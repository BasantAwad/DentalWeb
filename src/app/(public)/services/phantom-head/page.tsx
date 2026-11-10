import type { Metadata } from 'next'
import ServicePage from '@/components/service/ServicePage'
import { RENTAL_SERVICES } from '@/lib/pricing'

const RATE = RENTAL_SERVICES['phantom-head'].hourlyRateEgp

export const metadata: Metadata = {
  title: 'Phantom head rental',
  description: `Book a phantom head training station by the hour for ${RATE} EGP. Choose your station in the training room and pay a 50% deposit to confirm.`,
}

export default function PhantomHeadServicePage() {
  return (
    <ServicePage
      serviceKey="phantom-head"
      supportsStationSelection
      included={[
        {
          title: 'Manned training unit',
          body: 'A full phantom head on an adjustable mount, so you can rehearse at the height and angle you will actually work at.',
        },
        {
          title: 'Typodont jaw',
          body: 'A mounted typodont with a full arch, so you can practise cavity preparation, crown work and endodontic access.',
        },
        {
          title: 'Handpieces',
          body: 'High-speed and low-speed handpieces at the station. The exact set each facility provides is listed on its page.',
        },
        {
          title: 'Suction and spittoon',
          body: 'A working clinical setup rather than a bench model, so your technique transfers to a real operatory.',
        },
      ]}
      notes={[
        'Sessions are booked in whole hours. Two hours of phantom head is 200 EGP, with a 100 EGP deposit.',
        'Where a facility has published a room layout, you can pick the specific station you want from the room plan before you pay.',
        'The deposit is 50% of the total booking amount. The remaining balance is settled with the facility according to its policy.',
        'A reservation is confirmed only after the deposit payment has been verified by the platform.',
      ]}
    />
  )
}
