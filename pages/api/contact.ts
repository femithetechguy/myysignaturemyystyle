import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '../../lib/mailer'
import { pool } from '../../lib/dbQueries'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, contact, message, message_type, selected_service } = req.body

  if (!name || !contact || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const vars = {
    name,
    contact,
    message,
    message_type: message_type ?? 'inquiry',
    selected_service: selected_service ?? '',
  }

  // Save to DB (non-fatal)
  try {
    const isEmail = contact.includes('@')
    const submissionId = `CON${Date.now()}`
    await pool.query(
      `INSERT INTO contact_submissions (submission_id, name, email, phone, message_type, service, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (submission_id) DO NOTHING`,
      [
        submissionId,
        name,
        isEmail ? contact : null,
        isEmail ? null : contact,
        message_type ?? 'inquiry',
        selected_service ?? null,
        message,
      ]
    )
  } catch (dbErr) {
    console.error('[/api/contact] DB insert failed (non-fatal):', dbErr)
  }

  try {
    await Promise.all([
      sendMail({
        to: contact.includes('@') ? contact : process.env.EMAIL_ADMIN!,
        subject: 'We received your message – Myy Signature Myy Style',
        template: 'contact-confirmation-visitor.html',
        vars,
      }),
      sendMail({
        to: process.env.EMAIL_ADMIN!,
        subject: `New Contact Message from ${name}`,
        template: 'contact-notification-admin.html',
        vars,
      }),
    ])

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[/api/contact]', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
