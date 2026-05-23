import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('gallery', 'Myy Signature Myy Style Gallery')

export default function GalleryPage() {
  return <SectionRedirect anchor="gallery" />
}
