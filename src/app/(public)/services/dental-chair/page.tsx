import type { Metadata } from 'next'
import ServicePage from '@/components/service/ServicePage'
import { RENTAL_SERVICES } from '@/lib/pricing'

const RATE = RENTAL_SERVICES['dental-chair'].hourlyRateEgp

export const metadata: Metadata = {
  title: 'Dental chair rental',
  description: `Reserve a fully-equipped dental chair by the hour for ${RATE} EGP. Find a facility near you and pay a 50% deposit to confirm.`,
}

export default function DentalChairServicePage() {
  return (
    <ServicePage
      serviceKey="dental-chair"
      included={[
        {
          title: 'Articulating chair',
          body: 'A full clinical chair that reclines, tilts and rises, so you can work in the position the procedure actually needs.',
        },
        {
          title: 'Delivery unit',
          body: 'Handpieces, suction and air/water syringe within reach. Your setup starts where you left it.',
        },
        {
          title: 'LED operating light',
          body: 'A shadow-free light you can position for the working angle rather than fighting.',
        },
        {
          title: 'Instrument tray',
          body: 'Basic tray setup prepared before the session. What each facility stocks is listed on its own page.',
        },
      ]}
      notes={[
        'Sessions are booked in whole hours. Two hours of dental chair is 300 EGP, with a 150 EGP deposit.',
        'Each facility publishes its own inclusions, opening hours and equipment. Check the facility page before booking.',
        'The deposit is 50% of the total booking amount. The remaining balance is settled with the facility according to its policy.',
        'A reservation is confirmed only after the deposit payment has been verified by the platform.',
      ]}
    />
  )
}
