import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '../../lib/mailer'
import { pool } from '../../lib/dbQueries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    booking_reference,
    customer_name,
    customer_email,
    customer_phone,
    stylist_name,
    service_name,
    service_category,
    service_duration,
    service_price_min,
    service_price_max,
    appointment_date,
    appointment_date_iso,
    appointment_time,
  } = req.body

  if (!booking_reference || !customer_name || !customer_email || !service_name) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Fetch booking disclaimer from DB (fall back to safe defaults)
  let disclaimer_deposit = 'A deposit is required to secure your appointment. Payment options will be provided.'
  let disclaimer_cancellation = 'Cancellations made less than 12 hours in advance will incur your deposit service charge. No-shows receive no refund.'
  let disclaimer_late = 'A grace period of 10–20 minutes may be allowed. Late arrivals may result in a shortened service or cancellation with applicable fees.'
  let disclaimer_confirmation = 'By completing this booking you agreed to our deposit, cancellation, and late-arrival policies.'

  try {
    const settingRes = await pool.query(
      `SELECT setting_value FROM business_settings WHERE setting_key = 'booking_disclaimer' LIMIT 1`
    )
    if (settingRes.rows.length) {
      const d = settingRes.rows[0].setting_value
      if (d.deposit_note)      disclaimer_deposit      = d.deposit_note
      if (d.cancellation_note) disclaimer_cancellation = d.cancellation_note
      if (d.late_policy)       disclaimer_late         = d.late_policy
      if (d.confirmation_note) disclaimer_confirmation  = d.confirmation_note
    }
  } catch (_) {
    // Non-fatal: fall back to defaults above
  }

  const vars = {
    booking_reference,
    customer_name,
    customer_email,
    customer_phone: customer_phone ?? '',
    stylist_name: stylist_name ?? '',
    service_name,
    service_category: service_category ?? '',
    service_duration: String(service_duration ?? ''),
    service_price_min: String(service_price_min ?? ''),
    service_price_max: String(service_price_max ?? ''),
    appointment_date: appointment_date ?? '',
    appointment_time: appointment_time ?? '',
    disclaimer_deposit,
    disclaimer_cancellation,
    disclaimer_late,
    disclaimer_confirmation,
  }

  // Save booking to DB first (non-fatal — runs regardless of email outcome)
  try {
    const parseTimeTo24 = (t: string): string => {
      if (!t) return '00:00:00'
      const parts = t.trim().split(' ')
      const ampm = parts[1] ?? ''
      let [h, m] = parts[0].split(':').map(Number)
      if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0
      return `${h.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}:00`
    }

    const isoDate = appointment_date_iso ?? new Date().toISOString().split('T')[0]
    const pgTime  = parseTimeTo24(appointment_time ?? '')

    await pool.query(
      `INSERT INTO appointments
        (appointment_id, appointment_date, appointment_time, duration, total_amount, status, notes, metadata)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)
       ON CONFLICT (appointment_id) DO NOTHING`,
      [
        booking_reference,
        isoDate,
        pgTime,
        Number(service_duration) || 60,
        Number(service_price_min) || 0,
        `${customer_name} | ${service_name} | ${stylist_name ?? 'Any Available Stylist'}`,
        JSON.stringify({
          customer_name,
          customer_email,
          customer_phone,
          service_name,
          service_category,
          stylist_name,
          appointment_date,
          appointment_time,
        }),
      ]
    )

    // Upsert customer — insert on first booking, update on repeat (email is the unique key)
    const nameParts = customer_name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName  = nameParts.slice(1).join(' ') || null
    const customerId = `CUS${Date.now()}`
    await pool.query(
      `INSERT INTO customers (customer_id, first_name, last_name, email, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name  = EXCLUDED.last_name,
         phone      = COALESCE(EXCLUDED.phone, customers.phone),
         updated_at = CURRENT_TIMESTAMP`,
      [customerId, firstName, lastName, customer_email, customer_phone ?? null]
    )
  } catch (dbErr) {
    console.error('[/api/booking] DB insert failed (non-fatal):', dbErr)
  }

  try {
    await Promise.all([
      sendMail({
        to: customer_email,
        subject: `Appointment Confirmed – ${booking_reference}`,
        template: 'appointment-confirmation-customer.html',
        vars,
      }),
      sendMail({
        to: process.env.EMAIL_ADMIN!,
        subject: `New Appointment: ${customer_name} – ${service_name}`,
        template: 'appointment-notification-admin.html',
        vars,
      }),
    ])

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[/api/booking]', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
