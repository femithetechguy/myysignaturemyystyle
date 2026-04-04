import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '../../lib/mailer'

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
