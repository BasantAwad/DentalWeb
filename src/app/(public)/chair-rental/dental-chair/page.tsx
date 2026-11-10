import RentalBookingPage from '@/components/RentalBookingPage'

export const metadata = {
  title: 'Dental Chair Rental — Dental Platform',
  description:
    'Reserve a fully-equipped dental chair by the hour. Includes operating light, suction, air/water syringe, and a sterile instrument pack. Book online with a 50% deposit via Paymob.',
}

const CHAIR_ITEM = {
  name: 'Dental Chair',
  pricePerHour: 120,
  accentColor: '#1a1a2e',
  images: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&h=700&fit=crop&q=85',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=900&h=700&fit=crop&q=85',
    'https://images.unsplash.com/photo-1588776814546-1ffbb8d03197?w=900&h=700&fit=crop&q=85',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=900&h=700&fit=crop&q=85',
  ],
  description:
    'A professional dental chair fully configured for clinical practice, OSCE prep, and hands-on patient simulation. Each chair is cleaned and reset between sessions, inspected before every booking, and includes a sterile instrument tray.',
  specs: [
    { label: 'Type', value: 'Dental unit · full articulation' },
    { label: 'Rate', value: '120 EGP / hour' },
    { label: 'Min booking', value: '1 hour' },
    { label: 'Max booking', value: '8 hours' },
    { label: 'Deposit', value: '50% via Paymob' },
    { label: 'Availability', value: 'Sun–Thu, Sat · 8am–7pm' },
  ],
  includes: [
    'Dental chair with full recline & positioning',
    'LED operating light (adjustable)',
    'High-volume evacuation (HVE) suction',
    'Air/water 3-in-1 syringe',
    'Spittoon / cuspidor',
    'Sterilized basic tray (mirror, probe, tweezers)',
    'Patient bib & bracket tray',
    'Gloves, masks, and disposables',
    'Pre-session chair disinfection & setup',
    'Supervision available on request (+extra)',
  ],
}

export default function DentalChairPage() {
  return <RentalBookingPage item={CHAIR_ITEM} />
}
