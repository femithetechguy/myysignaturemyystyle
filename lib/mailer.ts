import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import appConfig from '../app.json'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function loadTemplate(filename: string, vars: Record<string, string>): string {
  const filePath = path.join(process.cwd(), 'emails', filename)
  let html = fs.readFileSync(filePath, 'utf-8')

  // Process {{#if var}}...{{else}}...{{/if}} and {{#if var}}...{{/if}} conditionals
  html = html.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
    (_, key, truthy, falsy = '') => (vars[key] ? truthy : falsy)
  )

  // Simple {{var}} replacement
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '')
  }
  return html
}

export async function sendMail({
  to,
  subject,
  template,
  vars,
}: {
  to: string | string[]
  subject: string
  template: string
  vars: Record<string, string>
}) {
  const html = loadTemplate(template, {
    ...vars,
    base_url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    business_phone: appConfig.business.contact.phone,
    business_phone_raw: appConfig.business.contact.phone.replace(/\D/g, ''),
    business_email: appConfig.business.contact.email,
    business_address: appConfig.business.address,
    business_name: appConfig.business.name,
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    replyTo: process.env.EMAIL_REPLY_TO ?? process.env.EMAIL_ADMIN,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}
