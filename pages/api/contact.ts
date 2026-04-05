import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '../../lib/mailer'

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
