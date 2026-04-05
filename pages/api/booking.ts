import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '../../lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    booking_reference,
    customer_name,
    customer_email,
    customer_phone,
    service_name,
    service_category,
    service_duration,
    service_price_min,
    service_price_max,
    appointment_date,
  } = req.body

  if (!booking_reference || !customer_name || !customer_email || !service_name) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const vars = {
    booking_reference,
    customer_name,
    customer_email,
    customer_phone: customer_phone ?? '',
    service_name,
    service_category: service_category ?? '',
    service_duration: String(service_duration ?? ''),
    service_price_min: String(service_price_min ?? ''),
    service_price_max: String(service_price_max ?? ''),
    appointment_date: appointment_date ?? '',
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
