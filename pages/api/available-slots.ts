import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '../../lib/dbQueries'

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { date } = req.query
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' })
  }

  try {
    const result = await pool.query(
      `SELECT appointment_time FROM appointments
       WHERE appointment_date = $1 AND status NOT IN ('cancelled')`,
      [date]
    )
    const bookedSlots = result.rows.map(r => to12h(String(r.appointment_time)))
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ bookedSlots })
  } catch (err) {
    console.error('[/api/available-slots]', err)
    return res.status(500).json({ error: 'Failed to fetch availability', bookedSlots: [] })
  }
}
