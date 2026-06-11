import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminRequest } from '../../../lib/jwtMiddleware'
import { pool } from '../../../lib/dbQueries'

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = verifyAdminRequest(req)
  if (!auth.valid) return res.status(401).json({ error: auth.error })

  const { staff_id } = req.query
  if (!staff_id) return res.status(400).json({ error: 'staff_id required' })
  const staffId = Number(staff_id)

  if (req.method === 'GET') {
    const result = await pool.query(
      `SELECT day_of_week, start_time, end_time, is_available
       FROM staff_availability
       WHERE staff_id = $1
       ORDER BY day_of_week`,
      [staffId]
    )

    // Build a full 7-day schedule object keyed by day name
    const schedule: Record<string, string> = {}
    for (let d = 0; d <= 6; d++) {
      const row = result.rows.find((r: any) => r.day_of_week === d)
      if (row) {
        schedule[DAY_NAMES[d]] = row.is_available
          ? `${String(row.start_time).slice(0, 5)}-${String(row.end_time).slice(0, 5)}`
          : 'closed'
      }
    }

    return res.status(200).json({ schedule })
  }

  if (req.method === 'PUT') {
    // body: { schedule: { monday: '09:00-17:00', tuesday: 'closed', ... } }
    const { schedule } = req.body as { schedule: Record<string, string> }
    if (!schedule || typeof schedule !== 'object') {
      return res.status(400).json({ error: 'schedule object required' })
    }

    for (let d = 0; d <= 6; d++) {
      const dayName = DAY_NAMES[d]
      const val = schedule[dayName]
      if (val === undefined) continue

      const isAvailable = val !== 'closed'
      const [startTime, endTime] = isAvailable ? val.split('-') : ['09:00', '18:00']

      await pool.query(
        `INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time, is_available)
         VALUES ($1, $2, $3::TIME, $4::TIME, $5)
         ON CONFLICT (staff_id, day_of_week) DO UPDATE SET
           start_time   = EXCLUDED.start_time,
           end_time     = EXCLUDED.end_time,
           is_available = EXCLUDED.is_available`,
        [staffId, d, startTime, endTime, isAvailable]
      )
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
