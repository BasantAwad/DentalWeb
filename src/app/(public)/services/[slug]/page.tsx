import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SERVICES } from '@/lib/services-data'

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) return {}
  return {
    title: `${service.name} — Dental Platform`,
    description: service.shortDescription,
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) notFound()

  const otherServices = SERVICES.filter((s) => s.slug !== slug).slice(0, 3)

  // Parse simple markdown bold (**text**) for the fullDescription
  const renderDescription = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-navy mt-4 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        )
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 text-charcoal/75 text-sm leading-relaxed list-disc">
            {line.slice(2)}
          </li>
        )
      }
      if (line.startsWith('#')) {
        return null // skip internal headings
      }
      if (line.trim() === '') return <br key={i} />
      return (
        <p key={i} className="text-charcoal/75 text-sm leading-relaxed">
          {line}
        </p>
      )
    })

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Cover ── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={service.coverImage}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 flex items-center gap-2 text-white/70 text-xs">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-white transition-colors">Services</Link>
          <span>/</span>
          <span className="text-white">{service.name}</span>
        </div>

        {/* Back btn */}
        <Link
          href="/services"
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium hover:bg-white/30 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          All services
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <span
              className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-full mb-3"
              style={{ background: service.accentColor }}
            >
              {service.tagline}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {service.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {service.highlights.map((h) => (
                <div
                  key={h}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border bg-white text-xs font-medium text-navy"
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: service.accentColor }} />
                  {h}
                </div>
              ))}
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">About this service</h2>
              <div className="space-y-1">
                {renderDescription(service.fullDescription)}
              </div>
            </div>

            {/* Related services */}
            <div>
              <h2 className="text-base font-semibold text-navy mb-4">Other services you might need</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {otherServices.map((os) => (
                  <Link
                    key={os.id}
                    href={`/services/${os.slug}`}
                    className="group bg-white rounded-xl border border-border overflow-hidden hover:border-aqua/40 hover:shadow-md transition-all"
                  >
                    <div className="h-28 overflow-hidden relative">
                      <img src={os.image} alt={os.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-navy group-hover:text-aqua transition-colors">{os.name}</p>
                      <p className="text-[10px] text-muted mt-0.5">{os.price} EGP · {os.duration} min</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Booking card */}
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-navy">{service.price} <span className="text-sm font-normal text-muted">EGP</span></p>
                    <p className="text-xs text-muted mt-0.5">per session · {service.duration} min</p>
                  </div>
                  <div
                    className="px-2 py-1 text-[10px] font-bold text-white rounded-full uppercase tracking-wider"
                    style={{ background: service.accentColor }}
                  >
                    {service.category.replace('_', ' ')}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-charcoal/70 mb-4 divide-y divide-border">
                  <div className="flex justify-between py-2">
                    <span>Duration</span>
                    <span className="font-semibold text-navy">{service.duration} minutes</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Deposit required</span>
                    <span className="font-semibold text-aqua">{service.deposit} EGP (50%)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Balance at clinic</span>
                    <span className="font-semibold text-navy">{service.price - service.deposit} EGP</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Payment via</span>
                    <span className="font-semibold text-navy">Paymob · EGP</span>
                  </div>
                </div>

                <Link
                  href={service.bookingHref}
                  className="block w-full py-3 text-center text-sm font-bold text-white rounded-xl hover:opacity-90 transition-all shadow-sm"
                  style={{ background: service.accentColor }}
                >
                  Book this service
                </Link>
                <Link
                  href="/clinics"
                  className="block w-full py-2 mt-2 text-center text-xs font-medium text-charcoal/60 hover:text-aqua transition-colors"
                >
                  Browse clinics offering this →
                </Link>
              </div>

              {/* Trust badges */}
              <div className="bg-cream rounded-xl border border-border p-4 space-y-2.5 text-xs text-muted">
                {[
                  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: 'Secure deposit payment via Paymob' },
                  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5v-5l3.5 2-3.5 3z', text: 'Live availability — no double booking' },
                  { icon: 'M20 6L9 17l-5-5', text: 'Instant confirmation on payment' },
                ].map((b) => (
                  <div key={b.text} className="flex items-start gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-aqua">
                      <path d={b.icon} />
                    </svg>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
