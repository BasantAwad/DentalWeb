import { NextResponse } from 'next/server'
import { getSessionUser, getFacilityMemberships } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/manage/courses
 *
 * Every course belonging to the facilities the signed-in owner manages,
 * including unpublished ones.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicId = searchParams.get('clinicId') ?? ''

  if (!isBackendConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message: 'Course management needs a configured database.',
      courses: [],
    })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.' },
      { status: 401 },
    )
  }

  const memberships = await getFacilityMemberships(user.id)
  const manageable = memberships.filter(
    (membership) => membership.role === 'owner' || membership.role === 'manager',
  )

  if (manageable.length === 0) {
    return NextResponse.json(
      {
        error: 'not_authorised',
        message: 'You do not manage any facility.',
        courses: [],
      },
      { status: 403 },
    )
  }

  const allowedClinicIds = manageable
    .map((membership) => membership.clinicId)
    .filter((id) => !clinicId || id === clinicId)

  if (allowedClinicIds.length === 0) {
    return NextResponse.json(
      { error: 'not_authorised', message: 'You do not manage that facility.' },
      { status: 403 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('courses')
    .select(
      `id, slug, title, description, subject, specialty, academic_level,
       training_type, learning_objectives, topics, theoretical_components,
       practical_components, includes_supervised_practice, materials_required,
       start_dt, end_dt, capacity, price_egp, deposit_pct, payment_policy,
       registration_open_at, registration_close_at, status, image_url, session_count,
       instructor, clinic_id, clinics (id, name, slug)`,
    )
    .in('clinic_id', allowedClinicIds)
    .order('start_dt', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[DentalWeb] managed course query failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Courses could not be loaded.' },
      { status: 500 },
    )
  }

  const courseIds = (data ?? []).map((course) => course.id)

  const enrolmentsByCourse = new Map<string, number>()
  if (courseIds.length > 0) {
    const { data: enrolments } = await supabase
      .from('course_enrollments')
      .select('course_id, status')
      .in('course_id', courseIds)
      .not('status', 'in', '(withdrawn,cancelled)')
    for (const enrolment of enrolments ?? []) {
      enrolmentsByCourse.set(
        enrolment.course_id,
        (enrolmentsByCourse.get(enrolment.course_id) ?? 0) + 1,
      )
    }
  }

  return NextResponse.json({
    courses: (data ?? []).map((course) => {
      const clinic = Array.isArray(course.clinics)
        ? course.clinics[0]
        : course.clinics
      const seatsTaken = enrolmentsByCourse.get(course.id) ?? 0
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
        status: course.status,
        imageUrl: course.image_url ?? null,
        sessionCount: course.session_count ?? 0,
        instructor: course.instructor ?? null,
        clinicId: course.clinic_id,
        facilityName: clinic?.name ?? '',
      }
    }),
  })
}

/**
 * POST /api/manage/courses
 *
 * Creates a course for a facility the signed-in owner manages.
 */
export async function POST(request: Request) {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: 'backend_not_configured', message: 'Course management needs a configured database.' },
      { status: 503 },
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.' },
      { status: 401 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'A request body is required.' },
      { status: 400 },
    )
  }

  const clinicId = typeof body.clinicId === 'string' ? body.clinicId : ''
  if (!clinicId) {
    return NextResponse.json(
      { error: 'missing_facility', message: 'Choose the facility hosting the course.' },
      { status: 400 },
    )
  }

  const memberships = await getFacilityMemberships(user.id)
  const allowed = memberships.some(
    (membership) =>
      membership.clinicId === clinicId &&
      (membership.role === 'owner' || membership.role === 'manager'),
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'not_authorised', message: 'You do not manage that facility.' },
      { status: 403 },
    )
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) {
    return NextResponse.json(
      { error: 'missing_title', message: 'The course needs a title.' },
      { status: 400 },
    )
  }

  const capacity = Number(body.capacity ?? 0)
  if (!Number.isInteger(capacity) || capacity < 1) {
    return NextResponse.json(
      { error: 'invalid_capacity', message: 'Capacity must be a whole number of at least 1.' },
      { status: 400 },
    )
  }

  const price = Number(body.priceEgp ?? 0)
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: 'invalid_price', message: 'The price must be zero or more.' },
      { status: 400 },
    )
  }

  const paymentPolicy = body.paymentPolicy === 'free' || body.paymentPolicy === 'deposit'
    ? body.paymentPolicy
    : 'full'

  const depositPct = body.depositPct == null ? null : Number(body.depositPct)
  if (paymentPolicy === 'deposit' && (depositPct == null || depositPct < 1 || depositPct > 99)) {
    return NextResponse.json(
      { error: 'invalid_deposit', message: 'A deposit percentage is required for this payment policy.' },
      { status: 400 },
    )
  }

  const startDt = typeof body.startDt === 'string' ? body.startDt : ''
  const endDt = typeof body.endDt === 'string' ? body.endDt : ''
  if (!startDt || Number.isNaN(new Date(startDt).getTime())) {
    return NextResponse.json(
      { error: 'invalid_start', message: 'The course needs a valid start date.' },
      { status: 400 },
    )
  }

  const supabase = await createServerSupabaseClient()

  // A URL-friendly identifier, unique across the platform.
  const baseSlug = slugify(title)
  const { data: clash } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle()
  const slug = clash ? `${baseSlug}-${Math.random().toString(36).slice(2, 7)}` : baseSlug

  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      clinic_id: clinicId,
      title,
      slug,
      description: typeof body.description === 'string' ? body.description.trim() : null,
      subject: typeof body.subject === 'string' ? body.subject.trim() || null : null,
      specialty: typeof body.specialty === 'string' ? body.specialty.trim() || null : null,
      academic_level: typeof body.academicLevel === 'string' ? body.academicLevel || null : null,
      training_type:
        body.trainingType === 'theoretical' || body.trainingType === 'combined'
          ? body.trainingType
          : 'practical',
      learning_objectives: stringArray(body.learningObjectives),
      topics: stringArray(body.topics),
      theoretical_components: text(body.theoreticalComponents),
      practical_components: text(body.practicalComponents),
      includes_supervised_practice: body.includesSupervisedPractice === true,
      materials_required: text(body.materialsRequired),
      instructor: text(body.instructor),
      start_dt: startDt,
      end_dt: endDt || startDt,
      capacity,
      price_egp: Math.round(price),
      payment_policy: paymentPolicy,
      deposit_pct: paymentPolicy === 'deposit' ? Math.round(depositPct!) : null,
      registration_open_at: text(body.registrationOpenAt),
      registration_close_at: text(body.registrationCloseAt),
      image_url: text(body.imageUrl),
      status: body.publish === true ? 'upcoming' : 'draft',
      is_active: true,
      published_at: body.publish === true ? new Date().toISOString() : null,
      session_count: 0,
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('[DentalWeb] course creation failed:', error.message)
    return NextResponse.json(
      { error: 'create_failed', message: 'The course could not be created.' },
      { status: 500 },
    )
  }

  // Optional sessions, created with the course.
  const sessions = Array.isArray(body.sessions) ? body.sessions : []
  if (sessions.length > 0) {
    const rows = sessions
      .filter(
        (session): session is Record<string, unknown> =>
          typeof session === 'object' && session !== null,
      )
      .filter((session) => typeof session.startDatetime === 'string')
      .map((session, index) => ({
        course_id: course.id,
        title: typeof session.title === 'string' && session.title.trim()
          ? session.title.trim()
          : `Session ${index + 1}`,
        description: typeof session.description === 'string' ? session.description : null,
        start_datetime: session.startDatetime as string,
        end_datetime:
          typeof session.endDatetime === 'string' ? session.endDatetime : null,
        location: typeof session.location === 'string' ? session.location : null,
        session_index: index,
      }))

    if (rows.length > 0) {
      await supabase.from('course_sessions').insert(rows)
      await supabase
        .from('courses')
        .update({ session_count: rows.length })
        .eq('id', course.id)
    }
  }

  return NextResponse.json({ success: true, course }, { status: 201 })
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 30)
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) || 'course'
  )
}
