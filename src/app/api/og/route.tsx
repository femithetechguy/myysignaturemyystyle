import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'Myy Signature Myy Style'
  const tagline = searchParams.get('tagline') ?? 'Premium Hair Salon · Locust Grove, GA'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2a2420',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 0,
        }}
      >
        {/* Gold top bar */}
        <div style={{ width: '100%', height: 8, background: '#a89880', flexShrink: 0 }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px 60px',
          }}
        >
          {/* Salon label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a89880', flexShrink: 0 }} />
            <span style={{ color: '#a89880', fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Myy Signature Myy Style · Hair Salon
            </span>
          </div>

          {/* Headline block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ color: '#ffffff', fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              {title}
            </div>
            <div style={{ color: '#e8d8d0', fontSize: 28, fontWeight: 400, opacity: 0.6, letterSpacing: '0.04em' }}>
              {tagline}
            </div>
          </div>

          {/* Domain */}
          <div style={{ color: '#a89880', fontSize: 20, fontWeight: 500, letterSpacing: '0.06em', opacity: 0.55 }}>
            myysignaturemyystyle.com
          </div>
        </div>

        {/* Gold bottom bar */}
        <div style={{ width: '100%', height: 4, background: '#a89880', flexShrink: 0 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
