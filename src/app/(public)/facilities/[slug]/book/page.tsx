import type { Metadata } from 'next'
import BookingFlow from '@/components/booking/BookingFlow'

export const metadata: Metadata = {
  title: 'Book a resource',
  description:
    'Choose a service, pick an available date and time, and pay a 50% deposit to confirm your reservation.',
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <BookingFlow slug={slug} />
}
