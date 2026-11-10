import RentalBookingPage from '@/components/RentalBookingPage'

export const metadata = {
  title: 'Dummy Head Practice Session — Dental Platform',
  description:
    'Book a phantom head practice session by the hour. Includes manikin unit, typodont teeth, handpieces, and full instrument setup. Ideal for dental students and early-career dentists.',
}

const DUMMY_HEAD_ITEM = {
  name: 'Dummy Head Practice',
  pricePerHour: 180,
  accentColor: '#2d8a5e',
  images: [
    'https://images.unsplash.com/photo-1598256989514-c2f2aadcf2e9?w=900&h=700&fit=crop&q=85',
    'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?w=900&h=700&fit=crop&q=85',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=700&fit=crop&q=85',
  ],
  description:
    'Full phantom head (manikin) units designed to replicate the clinical experience as closely as possible. Each station includes a mounted typodont, handpieces, and a comprehensive instrument kit. Perfect for OSCE preparation, technique refinement, and first clinical procedures.',
  specs: [
    { label: 'Type', value: 'Phantom head manikin unit' },
    { label: 'Rate', value: '180 EGP / hour' },
    { label: 'Min booking', value: '1 hour' },
    { label: 'Max booking', value: '8 hours' },
    { label: 'Deposit', value: '50% via Paymob' },
    { label: 'Availability', value: 'Sun–Thu, Sat · 8am–7pm' },
  ],
  includes: [
    'Full phantom head manikin (mounted & adjustable)',
    'Typodont teeth set (all 28 teeth, replaceable)',
    'High-speed turbine handpiece',
    'Low-speed contra-angle & straight handpiece',
    'Assorted burs (diamond, tungsten carbide)',
    'Endodontic files & reamers (hand & rotary)',
    'Impression tray & material (one mix)',
    'Mirror, probe, explorer, cotton pliers',
    'Spittoon & suction setup',
    'Gloves, mask, and disposable bibs',
    'Station disinfection before every session',
  ],
}

export default function DummyHeadPage() {
  return <RentalBookingPage item={DUMMY_HEAD_ITEM} />
}
