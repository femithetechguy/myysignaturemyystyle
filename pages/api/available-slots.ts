import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '../../lib/dbQueries'

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function toScheduleString(start: string, end: string): string {
  return `${start.slice(0, 5)}-${end.slice(0, 5)}`
}

// General salon fallback when no staff_id or no DB row
const FALLBACK_HOURS: Record<number, string> = {
  1: '09:00-18:00',
  2: '09:00-18:00',
  3: '09:00-18:00',
  4: '09:00-18:00',
  5: '09:00-18:00',
  6: '10:00-16:00',
  // 0 (Sun) omitted = closed
}

function resolveDay(rows: any[], dayOfWeek: number): string {
  const row = rows.find((r: any) => r.day_of_week === dayOfWeek)
  if (row) {
    return row.is_available
      ? toScheduleString(String(row.start_time), String(row.end_time))
      : 'closed'
  }
  return FALLBACK_HOURS[dayOfWeek] ?? 'closed'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  res.setHeader('Cache-Control', 'no-store')

  const { date, staff_id, weekly } = req.query

  try {
    // ── Weekly mode: return all 7 days for calendar preview ──────────────────
    if (weekly === 'true') {
      if (!staff_id) return res.status(400).json({ error: 'staff_id required for weekly mode' })

      const availRes = await pool.query(
        `SELECT day_of_week, start_time, end_time, is_available
         FROM staff_availability
         WHERE staff_id = $1
         ORDER BY day_of_week`,
        [Number(staff_id)]
      )

      const schedule: Record<number, string> = {}
      for (let d = 0; d <= 6; d++) {
        schedule[d] = resolveDay(availRes.rows, d)
      }

      return res.status(200).json({ schedule })
    }

    // ── Single-date mode ──────────────────────────────────────────────────────
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' })
    }

    const dayOfWeek = new Date(date + 'T12:00:00').getDay()
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
    }

    if (workingHours === null) {
      workingHours = FALLBACK_HOURS[dayOfWeek] ?? 'closed'
    }

    // Booked slots scoped to this stylist when staff_id is provided
    const bookedRes = staff_id
      ? await pool.query(
          `SELECT appointment_time FROM appointments
           WHERE appointment_date = $1 AND staff_id = $2 AND status NOT IN ('cancelled')`,
          [date, Number(staff_id)]
        )
      : await pool.query(
          `SELECT appointment_time FROM appointments
           WHERE appointment_date = $1 AND status NOT IN ('cancelled')`,
          [date]
        )
    const bookedSlots = bookedRes.rows.map((r: any) => to12h(String(r.appointment_time)))

    return res.status(200).json({ bookedSlots, workingHours })
  } catch (err) {
    console.error('[/api/available-slots]', err)
    return res.status(500).json({ bookedSlots: [], workingHours: null })
  }
}
