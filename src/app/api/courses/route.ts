import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/courses
 *
 * Lists published courses. Courses are published by facilities and carry
 * their own instructor, dates, capacity and price — none of it is invented
 * by the platform.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')?.trim() ?? ''

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message:
        'Course listings require a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      courses: [],
    })
  }

  const supabase = createClient()

  let builder = supabase
    .from('courses')
    .select(
      'id, title, description, instructor, syllabus, start_dt, end_dt, capacity, price_egp, deposit_egp, image_url, status, clinics (id, name, slug, city)',
    )
    .eq('status', 'upcoming')
    .eq('is_active', true)
    .order('start_dt', { ascending: true })
    .limit(60)

  if (category) {
    // The courses table has no category column, so the filter applies to the
    // title and description instead.
    builder = builder.or(
      `title.ilike.%${category}%,description.ilike.%${category}%`,
    )
  }

  const { data, error } = await builder

  if (error) {
    console.error('[DentalWeb] courses query failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Courses could not be loaded.', courses: [] },
      { status: 500 },
    )
  }

  return NextResponse.json({
    courses: (data ?? []).map((course) => {
      // The relationship resolves as an array because it is a one-to-many
      // join in the generated types.
      const clinic = Array.isArray(course.clinics)
            ? course.clinics[0]
            : course.clinics
      return {
        id: course.id,
        title: course.title,
        description: course.description ?? '',
        instructor: course.instructor ?? null,
        syllabus: course.syllabus ?? null,
        startDt: course.start_dt,
        endDt: course.end_dt,
        capacity: course.capacity,
        priceEgp: course.price_egp,
        depositEgp: course.deposit_egp,
        imageUrl: course.image_url ?? null,
        facility: clinic
          ? {
              id: clinic.id,
              name: clinic.name,
              slug: clinic.slug,
              city: clinic.city,
            }
          : null,
      }
    }),
  })
}
