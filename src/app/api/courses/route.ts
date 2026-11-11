import { NextResponse } from 'next/server'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import { registrationState } from '@/lib/course-utils'
import { safeSearchTerm } from '@/lib/search'

export const dynamic = 'force-dynamic'

/**
 * GET /api/courses
 *
 * Public course discovery. Supports search, filters and sorting.
 *
 * Only published courses are returned — RLS enforces this too, but the query
 * is explicit so the intent is readable.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const q = searchParams.get('q')?.trim() ?? ''
  const subject = searchParams.get('subject')?.trim() ?? ''
  const level = searchParams.get('level')?.trim() ?? ''
  const type = searchParams.get('type')?.trim() ?? ''
  const clinicId = searchParams.get('clinicId')?.trim() ?? ''
  const city = searchParams.get('city')?.trim() ?? ''
  const from = searchParams.get('from')?.trim() ?? ''
  const to = searchParams.get('to')?.trim() ?? ''
  const registration = searchParams.get('registration')?.trim() ?? ''
  const sort = searchParams.get('sort')?.trim() ?? 'date'

  if (!isBackendConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message:
        'Courses require a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      courses: [],
      facets: emptyFacets(),
    })
  }

  const supabase = await createServerSupabaseClient()

  let builder = supabase
    .from('courses')
    .select(
      `
        id, slug, title, description, subject, specialty, academic_level,
        training_type, learning_objectives, topics, theoretical_components,
        practical_components, includes_supervised_practice, materials_required,
        start_dt, end_dt, capacity, price_egp, deposit_pct, payment_policy,
        registration_open_at, registration_close_at, status, image_url, syllabus,
        session_count, instructor, instructor_id,
        clinics (id, name, slug, city, address, cover_image_url)
      `,
    )
    .eq('status', 'upcoming')
    .eq('is_active', true)

  if (q) {
    // Search the title, the description and the instructor's name. The term
    // is stripped of the characters the filter grammar reserves.
    const term = safeSearchTerm(q)
    if (term) {
      builder = builder.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,instructor.ilike.%${term}%,subject.ilike.%${term}%`,
      )
    }
  }
  if (subject) builder = builder.eq('subject', subject)
  if (level) builder = builder.eq('academic_level', level)
  if (type) builder = builder.eq('training_type', type)
  if (clinicId) builder = builder.eq('clinic_id', clinicId)
  if (from) builder = builder.gte('start_dt', `${from}T00:00:00Z`)
  if (to) builder = builder.lte('start_dt', `${to}T23:59:59Z`)

  if (sort === 'price') {
    builder = builder.order('price_egp', { ascending: true })
  } else if (sort === 'price-desc') {
    builder = builder.order('price_egp', { ascending: false })
  } else {
    builder = builder.order('start_dt', { ascending: true })
  }

  const { data, error } = await builder.limit(120)

  if (error) {
    console.error('[DentalWeb] course query failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Courses could not be loaded.', courses: [] },
      { status: 500 },
    )
  }

  const courses = data ?? []

  // Seats taken per course, in one query rather than one per course.
  const courseIds = courses.map((course) => course.id)
  const seatCounts = new Map<string, number>()
  if (courseIds.length > 0) {
    const { data: enrolments } = await supabase
      .from('course_enrollments')
      .select('course_id, status')
      .in('course_id', courseIds)
      .not('status', 'in', '(withdrawn,cancelled)')
    for (const enrolment of enrolments ?? []) {
      seatCounts.set(
        enrolment.course_id,
        (seatCounts.get(enrolment.course_id) ?? 0) + 1,
      )
    }
  }

  // The city filter is applied after the join, because it lives on the facility.
  const shaped = courses
    .map((course) => {
      const clinic = Array.isArray(course.clinics)
        ? course.clinics[0]
        : course.clinics
      const seatsTaken = seatCounts.get(course.id) ?? 0
      const registration = registrationState(course, seatsTaken, course.capacity)
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description ?? '',
        subject: course.subject ?? null,
        specialty: course.specialty ?? null,
        academicLevel: course.academic_level ?? null,
        trainingType: course.training_type ?? 'practical',
        learningObjectives: course.learning_objectives ?? [],
        topics: course.topics ?? [],
        theoreticalComponents: course.theoretical_components ?? null,
        practicalComponents: course.practical_components ?? null,
        includesSupervisedPractice: course.includes_supervised_practice,
        materialsRequired: course.materials_required ?? null,
        startDt: course.start_dt,
        endDt: course.end_dt,
        capacity: course.capacity,
        seatsTaken,
        seatsRemaining: Math.max(0, course.capacity - seatsTaken),
        priceEgp: course.price_egp,
        depositPct: course.deposit_pct ?? null,
        paymentPolicy: course.payment_policy ?? 'full',
        registrationOpenAt: course.registration_open_at ?? null,
        registrationCloseAt: course.registration_close_at ?? null,
        imageUrl: course.image_url ?? null,
        syllabus: course.syllabus ?? null,
        sessionCount: course.session_count ?? 0,
        instructor: course.instructor ?? null,
        facility: clinic
          ? {
              id: clinic.id,
              name: clinic.name,
              slug: clinic.slug,
              city: clinic.city ?? null,
              address: clinic.address ?? null,
              coverImageUrl: clinic.cover_image_url ?? null,
            }
          : null,
        registration,
      }
    })
    .filter((course) => (city ? course.facility?.city === city : true))
    // The registration filter is applied here because it depends on the live
    // seat count, which is only known once the enrolments have been counted.
    .filter((course) =>
      registration ? course.registration.category === registration : true,
    )

  return NextResponse.json({
    courses: shaped,
    facets: buildFacets(shaped),
  })
}

/**
 * Whether registration can be started right now, and why not when it cannot.
 */
function buildFacets(courses: CourseSummary[]) {
  const subjects = new Set<string>()
  const levels = new Set<string>()
  const types = new Set<string>()
  const cities = new Set<string>()
  const facilities = new Map<string, { id: string; name: string; city: string | null }>()

  for (const course of courses) {
    if (course.subject) subjects.add(course.subject)
    if (course.academicLevel) levels.add(course.academicLevel)
    if (course.trainingType) types.add(course.trainingType)
    if (course.facility?.city) cities.add(course.facility.city)
    if (course.facility?.id) {
      facilities.set(course.facility.id, {
        id: course.facility.id,
        name: course.facility.name,
        city: course.facility.city,
      })
    }
  }

  const sortSet = (set: Set<string>) => Array.from(set).sort()

  return {
    subjects: sortSet(subjects),
    levels: sortSet(levels),
    types: sortSet(types),
    cities: sortSet(cities),
    facilities: Array.from(facilities.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }
}

function emptyFacets() {
  return {
    subjects: [],
    levels: [],
    types: [],
    cities: [],
    facilities: [] as { id: string; name: string; city: string | null }[],
  }
}

/** The shape a course takes on the wire. */
interface CourseSummary {
  subject: string | null
  academicLevel: string | null
  trainingType: string | null
  facility: { id: string; name: string; city: string | null } | null
}
