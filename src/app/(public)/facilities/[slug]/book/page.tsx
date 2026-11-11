import type { Metadata } from 'next'
import BookingFlow, { type PreselectedService } from '@/components/booking/BookingFlow'

export const metadata: Metadata = {
  title: 'Book a resource',
  description:
    'Choose a service, pick an available date and time, and pay a 50% deposit to confirm your reservation.',
}

/**
 * The booking entry.
 *
 * `?service=chair|dummy_head` carries a service chosen earlier in the journey
 * (a service page or the filtered facility list) into the flow, so the visitor
 * continues the same booking instead of starting over.
 */
export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ service?: string; resource?: string }>
}) {
  const { slug } = await params
  const { service, resource } = await searchParams
  const initialService: PreselectedService | null =
    service === 'chair' || service === 'dummy_head' ? service : null
  return (
    <BookingFlow
      slug={slug}
      initialService={initialService}
      initialResourceId={typeof resource === 'string' && resource ? resource : null}
    />
  )
}
