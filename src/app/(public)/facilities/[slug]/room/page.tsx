import type { Metadata } from 'next'
import RoomPage from '@/components/room/RoomPage'
import type { StationState } from '@/components/room/RoomPlan'

export const metadata: Metadata = {
  title: 'Room plan',
  description:
    'Choose the phantom head station you want from the training room plan, then book it by the hour.',
}

export default async function RoomPlanPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Availability is resolved by the booking flow against the facility's own
  // schedule. This page renders the published layout; the states shown here
  // are explicitly labelled as a preview until a date and time are chosen.
  const initialStations: Record<string, StationState> = {}

  return (
    <RoomPage
      slug={slug}
      initialStations={initialStations}
      availabilitySource="preview"
    />
  )
}
