import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('stylists', 'Our Stylists at Myy Signature Myy Style')

export default function StylistsPage() {
  return <SectionRedirect anchor="stylists" />
}
