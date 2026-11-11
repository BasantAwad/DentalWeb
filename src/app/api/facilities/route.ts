import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { safeSearchTerm } from '@/lib/search'

export const dynamic = 'force-dynamic'

/**
 * GET /api/facilities
 *
 * Lists published facilities from the database.
 *
 * There is deliberately no demo/mock fallback: when the backend is not
 * configured or returns no rows the API says so, and the UI renders an
 * honest empty state. Facility data is never invented.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const service = searchParams.get('service')?.trim() ?? ''
  const limit = Math.min(48, Math.max(1, Number(searchParams.get('limit') ?? 24)))

  if (!isSupabaseConfigured()) {
    // 200 with an explicit flag: the platform is not misconfigured, it simply
    // has no published facilities yet. The UI renders an honest empty state.
    return NextResponse.json({
      backend: 'not_configured',
      message:
        'Facility listings require a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      facilities: [],
    })
  }

  const supabase = createClient()

  let requestBuilder = supabase
    .from('clinics')
    .select(
      'id, name, slug, description, address, city, cover_image_url, logo_url, timezone, deposit_pct, cancellation_cutoff_hours, services (id, name, category, price_egp, resource_type, duration_minutes, is_active)',
    )
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(limit)

  if (query) {
    // `or` is the only multi-column text filter PostgREST offers here.
    // The term is stripped of the characters the filter grammar reserves.
    const term = safeSearchTerm(query)
    if (term) {
      requestBuilder = requestBuilder.or(
        `name.ilike.%${term}%,city.ilike.%${term}%,description.ilike.%${term}%`,
      )
    }
  }

  const { data, error } = await requestBuilder

  if (error) {
    console.error('[DentalWeb] facilities query failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Could not load facilities.', facilities: [] },
      { status: 500 },
    )
  }

  const facilities = (data ?? [])
    .map((clinic) => {
      const activeServices = (clinic.services ?? []).filter(
        (s) => s.is_active && s.resource_type !== 'course',
      )
      return {
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
        services: activeServices.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          priceEgp: s.price_egp,
          resourceType: s.resource_type,
          durationMinutes: s.duration_minutes,
        })),
      }
    })
    .filter((facility) => {
      if (!service) return true
      return facility.services.some((s) => s.resourceType === service)
    })

  return NextResponse.json({ facilities })
}
