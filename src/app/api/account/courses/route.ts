import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import type { AccountCourse } from '@/lib/account-types'
import { courseGroup, type CourseGroup } from '@/lib/account-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/courses
 *
 * Every course the signed-in student is registered for, with the schedule.
 */
export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'backend_not_configured',
        message: 'Course registrations are not connected yet.',
        courses: [],
        counts: { upcoming: 0, ongoing: 0, completed: 0, cancelled: 0, total: 0 },
      },
      { status: 503 },
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.', courses: [] },
      { status: 401 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: rows, error } = await supabase
    .from('course_enrollments')
    .select(
      `
        id, status, payment_status, payment_amount, registered_at,
        courses (
          id, slug, title, start_dt, end_dt,
          clinics (id, name, city),
          instructors (id, name),
          instructor
        )
      `,
    )
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[DentalWeb] enrolments lookup failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Your course registrations could not be loaded.' },
      { status: 500 },
    )
  }

  const courseIds = (rows ?? [])
    .map((row) => {
      const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
      return course?.id ?? null
    })
    .filter((id): id is string => Boolean(id))

  // All sessions for those courses, in one query.
  const sessionsByCourse = new Map<string, AccountCourse['sessions']>()
  if (courseIds.length > 0) {
    const { data: sessions } = await supabase
      .from('course_sessions')
      .select('id, course_id, title, start_datetime, end_datetime, location')
      .in('course_id', courseIds)
      .order('start_datetime', { ascending: true })

    for (const session of sessions ?? []) {
      const list = sessionsByCourse.get(session.course_id) ?? []
      list.push({
        id: session.id,
        title: session.title,
        startDatetime: session.start_datetime,
        endDatetime: session.end_datetime ?? null,
        location: session.location ?? null,
      })
      sessionsByCourse.set(session.course_id, list)
    }
  }

  const courses: AccountCourse[] = (rows ?? []).map((row) => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    const clinic = course
      ? Array.isArray(course.clinics)
        ? course.clinics[0]
        : course.clinics
      : null
    const instructor = course
      ? Array.isArray(course.instructors)
        ? course.instructors[0]
        : course.instructors
      : null

    return {
      enrollmentId: row.id,
      courseId: course?.id ?? '',
      courseSlug: course?.slug ?? '',
      courseTitle: course?.title ?? 'Course',
      facilityName: clinic?.name ?? null,
      instructor: instructor?.name ?? course?.instructor ?? null,
      startDt: course?.start_dt ?? '',
      endDt: course?.end_dt ?? '',
      location: null,
      registeredAt: row.registered_at,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentAmount: row.payment_amount,
      sessions: course ? (sessionsByCourse.get(course.id) ?? []) : [],
    }
  })

  const counts = {
    upcoming: courses.filter((course) => courseGroup(course) === 'upcoming').length,
    ongoing: courses.filter((course) => courseGroup(course) === 'ongoing').length,
    completed: courses.filter((course) => courseGroup(course) === 'completed').length,
    cancelled: courses.filter((course) => courseGroup(course) === 'cancelled').length,
    total: courses.length,
  }

  return NextResponse.json({ courses, counts })
}
