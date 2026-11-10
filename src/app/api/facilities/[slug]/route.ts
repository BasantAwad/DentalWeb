import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/facilities/[slug]
 *
 * Full facility profile: services, resources and operating hours.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params

  if (!slug) {
    return NextResponse.json({ error: 'invalid_request', message: 'A facility slug is required.' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message:
        'Facility details require a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      facility: null,
    })
  }

  const supabase = createClient()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select(
      'id, name, slug, description, address, city, cover_image_url, logo_url, timezone, deposit_pct, cancellation_cutoff_hours, phone, email',
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !clinic) {
    return NextResponse.json({ error: 'not_found', message: 'That facility could not be found.' }, { status: 404 })
  }

  const [{ data: services }, { data: resources }, { data: hours }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, category, price_egp, resource_type, duration_minutes, description, is_active, is_bookable')
      .eq('clinic_id', clinic.id)
      .eq('is_active', true)
      .order('price_egp', { ascending: true }),
    supabase
      .from('resources')
      .select('id, name, type, location, description, capacity, is_active, image_url')
      .eq('clinic_id', clinic.id)
      .order('name', { ascending: true }),
    supabase
      .from('operating_hours')
      .select('weekday, start_time, end_time, resource_id')
      .eq('clinic_id', clinic.id)
      .is('resource_id', null)
      .order('weekday', { ascending: true }),
  ])

  return NextResponse.json({
    facility: {
      id: clinic.id,
      name: clinic.name,
      slug: clinic.slug,
      description: clinic.description ?? '',
      address: clinic.address ?? '',
      city: clinic.city ?? '',
      coverImageUrl: clinic.cover_image_url ?? null,
      logoUrl: clinic.logo_url ?? null,
      timezone: clinic.timezone,
      depositPct: clinic.deposit_pct,
      cancellationCutoffHours: clinic.cancellation_cutoff_hours,
      phone: clinic.phone ?? null,
      email: clinic.email ?? null,
      services: (services ?? []).map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        priceEgp: service.price_egp,
        resourceType: service.resource_type,
        durationMinutes: service.duration_minutes,
        description: service.description ?? null,
        isBookable: service.is_bookable,
      })),
      resources: (resources ?? []).map((resource) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        location: resource.location ?? null,
        description: resource.description ?? null,
        capacity: resource.capacity,
        isActive: resource.is_active,
        imageUrl: resource.image_url ?? null,
      })),
      hours: (hours ?? []).map((entry) => ({
        weekday: entry.weekday,
        startTime: entry.start_time ?? null,
        endTime: entry.end_time ?? null,
        closed: !entry.start_time || !entry.end_time,
      })),
    },
  })
}
