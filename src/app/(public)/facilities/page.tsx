import type { Metadata } from 'next'
import { Suspense } from 'react'
import FacilityExplorer from '@/components/facilities/FacilityExplorer'

export const metadata: Metadata = {
  title: 'Find a facility',
  description:
    'Search dental training facilities across Egypt. Compare rooms, equipment, services and hourly rates, then check what is actually bookable.',
}

export default function FacilitiesPage() {
  return (
    <Suspense fallback={null}>
      <FacilityExplorer />
    </Suspense>
  )
}
