import { NextResponse } from 'next/server'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth'
import { registrationState } from '@/lib/course-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/courses/[slug]
 *
 * A single course with its sessions, its instructor and the enrolment state
 * of the signed-in visitor.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params

  if (!isBackendConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message:
        'Courses require a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      course: null,
      sessions: [],
    })
  }

  const supabase = await createServerSupabaseClient()

  const { data: course, error } = await supabase
    .from('courses')
    .select(
      `
        id, slug, title, description, subject, specialty, academic_level,
        training_type, learning_objectives, topics, theoretical_components,
        practical_components, includes_supervised_practice, materials_required,
        start_dt, end_dt, capacity, price_egp, deposit_pct, payment_policy,
        registration_open_at, registration_close_at, status, image_url, syllabus,
        session_count, instructor, instructor_id,
        clinics (id, name, slug, city, address, cover_image_url, phone, email),
        instructors (id, name, bio, qualifications, profile_image)
      `,
    )
    .eq('slug', slug)
    // A published course stays readable once it has started or finished, so
    // a student who registered can still open its schedule. Drafts are not.
    .in('status', ['upcoming', 'ongoing', 'completed'])
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[DentalWeb] course lookup failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'The course could not be loaded.' },
      { status: 500 },
    )
  }

  if (!course) {
    return NextResponse.json(
      { error: 'not_found', message: 'That course could not be found.' },
      { status: 404 },
    )
  }

  const [{ data: sessions }, { data: enrolments }] = await Promise.all([
    supabase
      .from('course_sessions')
      .select('id, title, description, start_datetime, end_datetime, location, session_index')
      .eq('course_id', course.id)
      .order('start_datetime', { ascending: true }),
    supabase
      .from('course_enrollments')
      .select('id, user_id, status, payment_status, payment_amount, registered_at')
      .eq('course_id', course.id)
      .not('status', 'in', '(withdrawn,cancelled)'),
  ])

  const seatsTaken = (enrolments ?? []).length

  // The visitor's own enrolment, if they have one.
  const user = await getSessionUser()
  const own = user
    ? (enrolments ?? []).find((enrolment) => enrolment.user_id === user.id) ?? null
    : null

  const facility = Array.isArray(course.clinics)
    ? course.clinics[0]
    : course.clinics
  const instructor = Array.isArray(course.instructors)
    ? course.instructors[0]
    : course.instructors

  return NextResponse.json({
    course: {
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
      registration: registrationState(course, seatsTaken, course.capacity),
      instructor: instructor
        ? {
            id: instructor.id,
            name: instructor.name,
            bio: instructor.bio ?? null,
            qualifications: instructor.qualifications ?? null,
            profileImage: instructor.profile_image ?? null,
          }
        : course.instructor
          ? { id: null, name: course.instructor, bio: null, qualifications: null, profileImage: null }
          : null,
      facility: facility
        ? {
            id: facility.id,
            name: facility.name,
            slug: facility.slug,
            city: facility.city ?? null,
            address: facility.address ?? null,
            coverImageUrl: facility.cover_image_url ?? null,
            phone: facility.phone ?? null,
            email: facility.email ?? null,
          }
        : null,
    },
    sessions: (sessions ?? []).map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description ?? null,
      startDatetime: session.start_datetime,
      endDatetime: session.end_datetime ?? null,
      location: session.location ?? null,
      sessionIndex: session.session_index,
    })),
    enrolment: own
      ? {
          id: own.id,
          status: own.status,
          paymentStatus: own.payment_status,
          paymentAmount: own.payment_amount,
          registeredAt: own.registered_at,
        }
      : null,
  })
}
