import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('careers', 'Join Our Team at Myy Signature Myy Style')

export default function CareersPage() {
  return <SectionRedirect anchor="careers" />
}
