// Central services data — used on homepage accordion, services index, and individual pages
//
// Rates for the two confirmed rental services come from src/lib/pricing.ts,
// which mirrors docs/BOOKING_BUSINESS_RULES.md. Do not duplicate them here.

import {
  DENTAL_CHAIR_HOURLY_EGP,
  PHANTOM_HEAD_HOURLY_EGP,
} from './pricing'

export const SERVICES = [
  {
    id: '1',
    slug: 'general-dentistry',
    name: 'General Dentistry',
    category: 'general',
    tagline: 'Comprehensive oral care',
    shortDescription:
      'Full examination, diagnosis, and treatment planning by licensed dentists. Cleanings, fillings, and preventive care.',
    fullDescription: `
General dentistry forms the cornerstone of oral health. Our licensed dentists conduct thorough
examinations covering teeth, gums, jaw, and soft tissue. The visit includes professional cleaning,
cavity detection via digital X-ray, personalised treatment planning, and preventive care advice.

**What's included:**
- Comprehensive oral examination
- Professional scale & polish
- Digital X-ray review (if needed)
- Treatment plan with itemised cost breakdown
- Preventive care recommendations

Suitable for new patients, routine check-ups, and second opinions.
    `.trim(),
    duration: 45,
    price: 300,
    deposit: 150,
    image:
      'https://images.unsplash.com/photo-1588776814546-1ffbb8d03197?w=800&h=600&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=1400&h=600&fit=crop&q=80',
    accentColor: '#0ea5a0',
    bookingHref: '/chair-rental',
    highlights: ['Licensed dentists', 'Digital X-ray', 'Itemised costs', 'Preventive plan'],
  },
  {
    id: '2',
    slug: 'dental-radiography',
    name: 'Dental Radiography',
    category: 'radiography',
    tagline: 'Digital X-ray imaging',
    shortDescription:
      'Intraoral & panoramic digital X-ray for precision diagnosis and treatment planning. Fast, low-dose imaging.',
    fullDescription: `
High-resolution digital radiography is essential for detecting conditions invisible to the naked eye —
including interproximal cavities, bone loss, impacted teeth, and root pathology.

**Types of imaging available:**
- Periapical X-rays (individual teeth)
- Bitewing X-rays (proximal surfaces)
- Panoramic (OPG) — full arch view
- CBCT referral available on request

All imaging is conducted at low radiation doses and results are available immediately for
same-session diagnosis and treatment planning.
    `.trim(),
    duration: 30,
    price: 150,
    deposit: 75,
    image:
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=600&fit=crop&q=80',
    accentColor: '#6366f1',
    bookingHref: '/chair-rental',
    highlights: ['Low-dose digital', 'Periapical & OPG', 'Instant results', 'CBCT referral'],
  },
  {
    id: '3',
    slug: 'chair-rental',
    name: 'Chair Rental',
    category: 'chair_rental',
    tagline: 'Hourly dental chair access',
    shortDescription:
      'Reserve a fully-equipped dental chair by the hour. Includes operating light, basic setup, and sterilized instruments.',
    fullDescription: `
Our dental chair rental service is designed for dental students, recent graduates, and licensed
practitioners who need access to a clinical environment without the overhead of running a full practice.

**Included in every booking:**
- Dental chair with full articulation
- LED operating light
- High-volume suction
- Air & water syringe
- Basic tray setup (mirror, probe, tweezers)
- Sterile instrument pack

Supervision can be arranged on request. Ideal for practice sessions, shadowing, OSCE preparation,
and clinical case completion.
    `.trim(),
    duration: 60,
    price: DENTAL_CHAIR_HOURLY_EGP,
    deposit: DENTAL_CHAIR_HOURLY_EGP / 2,
    image:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&h=600&fit=crop&q=80',
    accentColor: '#202522',
    bookingHref: '/chair-rental/dental-chair',
    highlights: ['Fully equipped chair', 'Sterile instrument pack', 'Flexible hours', 'Supervision available'],
  },
  {
    id: '4',
    slug: 'dummy-head-practice',
    name: 'Dummy Head Practice',
    category: 'dummy_head',
    tagline: 'Hands-on student training',
    shortDescription:
      'Practice operative, prosthetic, and endodontic techniques on fully-equipped phantom head simulators.',
    fullDescription: `
Phantom head (dummy head) practice sessions give dental students and early-career dentists a
realistic, pressure-free environment to develop clinical technique before working on live patients.

**What you get:**
- Full phantom head + manikin unit
- Typodont teeth (replaceable per session)
- High-speed and low-speed handpieces
- Relevant burs, files, and instruments
- Spittoon and full suction setup
- Tray setup matching clinical standards

Sessions are timed and structured — book 1–8 hours. Additional instrument sets available at cost.
Common uses: composite placement, crown prep, RCT access, impression taking.
    `.trim(),
    duration: 60,
    price: PHANTOM_HEAD_HOURLY_EGP,
    deposit: PHANTOM_HEAD_HOURLY_EGP / 2,
    image:
      'https://images.unsplash.com/photo-1598256989514-c2f2aadcf2e9?w=800&h=600&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?w=1400&h=600&fit=crop&q=80',
    accentColor: '#2F7772',
    bookingHref: '/chair-rental/dummy-head',
    highlights: ['Phantom head unit', 'Handpieces included', 'Book 1–8 hrs', 'OSCE-ready setup'],
  },
  {
    id: '5',
    slug: 'instrument-sterilization',
    name: 'Instrument Sterilization',
    category: 'sterilization',
    tagline: 'Clinical reprocessing service',
    shortDescription:
      'Professional cleaning, disinfection, and autoclave sterilization following international reprocessing protocols.',
    fullDescription: `
Our instrument sterilization and reprocessing service follows Class B autoclave standards and
full WHO/SFDA infection control guidelines. Suitable for clinics, teaching centres, and individual
practitioners needing reliable turnaround.

**Reprocessing cycle:**
1. Pre-cleaning & decontamination
2. Ultrasonic cleaning bath
3. Rinse & inspection
4. Pouch packaging & labeling
5. Class B autoclave cycle
6. Sterility confirmation & traceability record

Turnaround: same-day for morning drop-off. Emergency same-hour available on request.
Track your batch status in real-time via your booking dashboard.
    `.trim(),
    duration: 60,
    price: 200,
    deposit: 100,
    image:
      'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?w=800&h=600&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=600&fit=crop&q=80',
    accentColor: '#d4a030',
    bookingHref: '/chair-rental',
    highlights: ['Class B autoclave', 'Full traceability', 'Same-day turnaround', 'WHO protocol'],
  },
  {
    id: '6',
    slug: 'tooth-assistance',
    name: 'Tooth Assistance',
    category: 'assistance',
    tagline: '3D interactive consultation',
    shortDescription:
      'Select affected teeth on our interactive 3D dental model using FDI notation. A dentist reviews and schedules a consultation.',
    fullDescription: `
Not sure which teeth need attention, or want a professional opinion before booking a full appointment?
Tooth Assistance lets you communicate precisely with a dentist using FDI tooth numbering.

**How it works:**
1. Choose upper arch, lower arch, or both
2. Click teeth on the interactive 3D model
3. Add a note describing your symptoms or concerns
4. Select a consultation type (in-person, video, or phone)
5. Submit — a dentist reviews within 24 hours and contacts you to discuss next steps

Your submission does not create a clinical record. No patient data is stored publicly.
This is a triage and guidance service, not a diagnosis.
    `.trim(),
    duration: 30,
    price: 100,
    deposit: 50,
    image:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1599813503916-9c37ec05bbfc?w=1400&h=600&fit=crop&q=80',
    accentColor: '#0ea5a0',
    bookingHref: '/tooth-assistance',
    highlights: ['FDI tooth notation', '3D model selector', 'Dentist review 24h', 'No clinical record'],
  },
]

export type Service = (typeof SERVICES)[number]
