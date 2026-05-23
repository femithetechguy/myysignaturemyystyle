import { buildPageMetadata } from '@/lib/metadata'
import SectionRedirect from '../SectionRedirect'

export const metadata = buildPageMetadata('book', 'Book at Myy Signature Myy Style')

export default function BookPage() {
  return <SectionRedirect anchor="book" />
}
