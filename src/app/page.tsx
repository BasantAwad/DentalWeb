import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import PlatformIntro from '@/components/home/PlatformIntro'
import ServiceShowcase from '@/components/home/ServiceShowcase'
import CoursesShowcase from '@/components/home/CoursesShowcase'
import RoomReveal from '@/components/home/RoomReveal'
import BookingSteps from '@/components/home/BookingSteps'
import FacilityDiscovery from '@/components/home/FacilityDiscovery'
import FacilityOwner from '@/components/home/FacilityOwner'

export const metadata: Metadata = {
  title: 'DentalWeb — A space to practice',
  description:
    'Discover and reserve dental training equipment by the hour. Dental chairs from 150 EGP and phantom heads from 100 EGP, with a 50% deposit to confirm.',
  openGraph: {
    title: 'DentalWeb — A space to practice',
    description:
      'Discover and reserve dental training equipment by the hour. Dental chairs from 150 EGP and phantom heads from 100 EGP, with a 50% deposit to confirm.',
    type: 'website',
  },
}

/**
 * The homepage introduces the platform and points to the experiences that
 * need room to breathe.
 *
 *   1. Hero            — the chair on a studio stage        (graphite)
 *   2. Platform        — what DentalWeb is                  (porcelain)
 *   3. Two rentals     — chair and phantom head             (porcelain)
 *   4. Courses         — teaching and practical training    (graphite)
 *   5. The room        — the supplied plan, interactive      (graphite)
 *   6. How it works    — the sequence and a worked example  (porcelain)
 *   7. Facilities      — a short preview of real listings   (chalk)
 *   8. For owners      — the management workspace           (graphite)
 *
 * The complete booking system, the full room selector and every service
 * detail live on their own pages.
 *
 * Section themes are declared explicitly so the light/dark narrative is
 * deliberate rather than inferred from scroll offsets.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformIntro />
      <ServiceShowcase />
      <CoursesShowcase />
      <RoomReveal stations={{}} availabilitySource="preview" />
      <BookingSteps />
      <FacilityDiscovery />
      <FacilityOwner />
    </>
  )
}
