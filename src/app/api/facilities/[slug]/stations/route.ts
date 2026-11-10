import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/facilities/[slug]/stations
 *
 * Station availability for a room, at a given date and time.
 *
 * The response maps the blueprint's station ids onto real backend resources.
 * A station is only reported as available when the resource it maps to has no
 * conflicting reservation or block. Nothing is inferred.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const { searchParams } = new URL(request.url)

  const date = searchParams.get('date')
  const startHour = searchParams.get('start')
  const durationHours = Number(searchParams.get('duration') ?? '1')

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message:
        'Station availability requires a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      stations: {},
    })
  }

  const supabase = createClient()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, timezone')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!clinic) {
    return NextResponse.json(
      { error: 'not_found', message: 'That facility could not be found.' },
      { status: 404 },
    )
  }

  // The room plan's stations map to the facility's phantom-head resources.
  const { data: resources } = await supabase
    .from('resources')
    .select('id, name, type, location, is_active')
    .eq('clinic_id', clinic.id)
    .eq('type', 'dummy_head')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const phantomHeads = resources ?? []

  // The blueprint station order matches the facility's phantom-head order.
  const { BLUEPRINT_STATIONS } = await import('@/components/room/RoomBlueprintSvg')

  const stationStates: Record<
    string,
    { resourceId: string; status: string; label: string; reason?: string }
  > = {}

  // Without a date and time we can report only the static state.
  const window = date && startHour
    ? (() => {
        const start = new Date(`${date}T${startHour}:00`)
        const end = new Date(start.getTime() + durationHours * 3_600_000)
        return { start, end }
      })()
    : null

  if (window) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('resource_id, start_dt, end_dt, status')
      .eq('clinic_id', clinic.id)
      .in('status', ['confirmed', 'held', 'pending'])
      .lt('start_dt', window.end.toISOString())
      .gt('end_dt', window.start.toISOString())

    const { data: holds } = await supabase
      .from('booking_holds')
      .select('resource_id, start_dt, end_dt')
      .eq('status', 'active')
      .gt('expiration_dt', new Date().toISOString())
      .lt('start_dt', window.end.toISOString())
      .gt('end_dt', window.start.toISOString())

    const { data: blocks } = await supabase
      .from('availability_blocks')
      .select('resource_id, start_dt, end_dt, reason')
      .eq('clinic_id', clinic.id)
      .lt('start_dt', window.end.toISOString())
      .gt('end_dt', window.start.toISOString())

    for (const station of BLUEPRINT_STATIONS) {
      const resource = phantomHeads[station.index - 1]
      if (!resource) continue

      const booking = (bookings ?? []).find((b) => b.resource_id === resource.id)
      const hold = (holds ?? []).find((h) => h.resource_id === resource.id)
      const block = (blocks ?? []).find(
        (b) => b.resource_id === resource.id || b.resource_id === null,
      )

      if (block) {
        stationStates[station.id] = {
          resourceId: resource.id,
          status: 'maintenance',
          label: resource.name,
          reason:
            block.reason === 'maintenance'
              ? 'This station is under maintenance.'
              : 'This station is closed for the selected time.',
        }
      } else if (booking || hold) {
        stationStates[station.id] = {
          resourceId: resource.id,
          status: 'reserved',
          label: resource.name,
          reason: 'Reserved for the selected time.',
        }
      } else {
        stationStates[station.id] = {
          resourceId: resource.id,
          status: 'available',
          label: resource.name,
        }
      }
    }
  }

  return NextResponse.json({
    timezone: clinic.timezone,
    date,
    start: startHour,
    durationHours,
    stations: stationStates,
  })
}
