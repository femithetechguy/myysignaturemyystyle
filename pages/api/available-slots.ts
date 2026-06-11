import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '../../lib/dbQueries'

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function toScheduleString(start: string, end: string): string {
  // Convert "09:00:00" "18:00:00" → "09:00-18:00"
  return `${start.slice(0, 5)}-${end.slice(0, 5)}`
}

// Fallback business hours when no staff_id or no DB row found
const FALLBACK_HOURS: Record<number, string> = {
  1: '09:00-18:00', // Mon
  2: '09:00-18:00', // Tue
  3: '09:00-18:00', // Wed
  4: '09:00-18:00', // Thu
  5: '09:00-18:00', // Fri
  6: '10:00-16:00', // Sat
  // 0 (Sun) omitted = closed
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { date, staff_id } = req.query
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' })
  }

  try {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay() // noon avoids DST edge cases

    // ── Working hours from DB ─────────────────────────────────────────────────
    let workingHours: string | null = null

    if (staff_id) {
      const availRes = await pool.query(
        `SELECT start_time, end_time, is_available
         FROM staff_availability
         WHERE staff_id = $1 AND day_of_week = $2
         LIMIT 1`,
        [Number(staff_id), dayOfWeek]
      )
      if (availRes.rows.length > 0) {
        const row = availRes.rows[0]
        workingHours = row.is_available
          ? toScheduleString(String(row.start_time), String(row.end_time))
          : 'closed'
      }
      // No row → staff has no entry for this day → fall through to fallback
    }

    // Fall back to general business hours if no DB row
    if (workingHours === null) {
      workingHours = FALLBACK_HOURS[dayOfWeek] ?? 'closed'
    }

    // ── Already-booked slots ──────────────────────────────────────────────────
    const bookedRes = await pool.query(
      `SELECT appointment_time FROM appointments
       WHERE appointment_date = $1 AND status NOT IN ('cancelled')`,
      [date]
    )
    const bookedSlots = bookedRes.rows.map(r => to12h(String(r.appointment_time)))

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ bookedSlots, workingHours })
  } catch (err) {
    console.error('[/api/available-slots]', err)
    return res.status(500).json({ bookedSlots: [], workingHours: null })
  }
}
