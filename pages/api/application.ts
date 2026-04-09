import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '../../lib/mailer'
import { pool } from '../../lib/dbQueries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    full_name,
    email,
    phone,
    position,
    employment_type,
    years_experience,
    specialties,
    certifications,
    portfolio_url,
    availability,
    why_join,
    references,
  } = req.body

  if (!full_name || !email || !phone || !position) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const vars = {
    full_name,
    email,
    phone,
    position,
    employment_type: employment_type ?? '',
    years_experience: years_experience ?? '',
    specialties: specialties ?? '',
    certifications: certifications ?? '',
    portfolio_url: portfolio_url ?? '',
    availability: availability ?? '',
    why_join: why_join ?? '',
    references: references ?? '',
  }

  // Save application to DB first (non-fatal — runs regardless of email outcome)
  try {
    const application_id = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    await pool.query(
        `INSERT INTO career_applications
          (application_id, full_name, email, phone, position, employment_type,
           license_number, years_experience, specialties, portfolio_url,
           certifications, availability, why_join, "references", status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'new')
         ON CONFLICT (application_id) DO NOTHING`,
        [
          application_id,
          full_name,
          email,
          phone,
          position,
          employment_type ?? null,
          (req.body.license_number ?? '').trim() || 'Not provided',
          Number(years_experience) || 0,
          specialties ?? null,
          portfolio_url ?? null,
          certifications ?? null,
          availability ?? null,
          why_join ?? null,
          references ?? null,
        ]
      )
    } catch (dbErr) {
    console.error('[/api/application] DB insert failed (non-fatal):', dbErr)
  }

  try {
    await Promise.all([
      sendMail({
        to: email,
        subject: 'Application Received – Myy Signature Myy Style',
        template: 'application-confirmation-applicant.html',
        vars,
      }),
      sendMail({
        to: process.env.EMAIL_ADMIN!,
        subject: `New Application: ${full_name} – ${position}`,
        template: 'application-notification-admin.html',
        vars,
      }),
    ])

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[/api/application]', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
