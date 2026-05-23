'use client'
import { useEffect } from 'react'

export default function SectionRedirect({ anchor }: { anchor: string }) {
  useEffect(() => {
    window.location.replace(`/#${anchor}`)
  }, [anchor])
  return null
}
