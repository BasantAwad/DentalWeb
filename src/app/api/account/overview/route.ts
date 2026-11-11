import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import type { AccountActivity, AccountBooking, AccountCourse } from '@/lib/account-types'
import { bookingGroup, courseGroup } from '@/lib/account-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/overview
 *
 * The dashboard in one request: counts, the next few activities and a
 * chronological activity timeline.
 *
 * Every figure is derived from the signed-in user's own records.
 */
export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'backend_not_configured',
        message: 'Your account is not connected yet.',
        counts: { reservations: 0, upcoming: 0, completed: 0, enrollments: 0, activeEnrollments: 0 },
        next: [],
        activity: [],
      },
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

  const supabase = await createServerSupabaseClient()

  const [bookingResult, enrollmentResult] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        `id, reference, start_dt, end_dt, status, created_at,
         deposit_due_egp, balance_due_egp, deposit_paid_egp,
         services (id, name, category, price_egp),
         resources (id, name, type, location),
         clinics (id, name, city, address),
         payments (id, status)`,
      )
      .eq('user_id', user.id)
      .order('start_dt', { ascending: false })
      .limit(200),
    supabase
      .from('course_enrollments')
      .select(
        `id, status, payment_status, payment_amount, registered_at,
         courses (id, slug, title, start_dt, end_dt, clinics (id, name), instructor)`,
      )
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false })
      .limit(200),
  ])

  if (bookingResult.error) {
    console.error('[DentalWeb] bookings lookup failed:', bookingResult.error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Your reservations could not be loaded.' },
      { status: 500 },
    )
  }
  if (enrollmentResult.error) {
    console.error(
      '[DentalWeb] enrolments lookup failed:',
      enrollmentResult.error.message,
    )
    return NextResponse.json(
      { error: 'query_failed', message: 'Your course registrations could not be loaded.' },
      { status: 500 },
    )
  }

  const bookingRows = bookingResult.data ?? []
  const enrollmentRows = enrollmentResult.data ?? []

  const bookings: AccountBooking[] = (bookingRows ?? []).map((row) => {
    const service = Array.isArray(row.services) ? row.services[0] : row.services
    const resource = Array.isArray(row.resources) ? row.resources[0] : row.resources
    const clinic = Array.isArray(row.clinics) ? row.clinics[0] : row.clinics
    const payments = row.payments ?? []
    const paid = payments.find((payment) => payment.status === 'paid')
    const pending = payments.find((payment) => payment.status === 'pending')

    const durationHours =
      (new Date(row.end_dt).getTime() - new Date(row.start_dt).getTime()) /
      3_600_000

    return {
      id: row.id,
      reference: row.reference,
      facilityId: clinic?.id ?? '',
      facilityName: clinic?.name ?? 'Facility',
      facilityCity: clinic?.city ?? null,
      facilityAddress: clinic?.address ?? null,
      serviceName: service?.name ?? null,
      serviceCategory: service?.category ?? null,
      stationName:
        resource && resource.type === 'dummy_head' ? resource.name : null,
      stationId: resource && resource.type === 'dummy_head' ? resource.id : null,
      roomName: resource?.location ?? null,
      startDt: row.start_dt,
      endDt: row.end_dt,
      durationHours,
      hourlyRateEgp: service?.price_egp ?? 0,
      totalEgp:
        service?.price_egp != null
          ? Math.round(service.price_egp * durationHours)
          : row.deposit_due_egp + row.balance_due_egp,
      depositDueEgp: row.deposit_due_egp,
      depositPaidEgp: row.deposit_paid_egp,
      balanceDueEgp: row.balance_due_egp,
      paymentStatus: paid ? 'paid' : pending ? 'pending' : 'not_required',
      status: row.status,
      createdAt: row.created_at,
      group: bookingGroup(row.status, row.start_dt, row.end_dt),
    }
  })

  const courses: AccountCourse[] = (enrollmentRows ?? []).map((row) => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    const clinic = course
      ? Array.isArray(course.clinics)
        ? course.clinics[0]
        : course.clinics
      : null
    return {
      enrollmentId: row.id,
      courseId: course?.id ?? '',
      courseSlug: course?.slug ?? '',
      courseTitle: course?.title ?? 'Course',
      facilityName: clinic?.name ?? null,
      instructor: course?.instructor ?? null,
      startDt: course?.start_dt ?? '',
      endDt: course?.end_dt ?? '',
      location: null,
      registeredAt: row.registered_at,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentAmount: row.payment_amount,
      sessions: [],
    }
  })

  const counts = {
    reservations: bookings.length,
    upcoming: bookings.filter((booking) => booking.group === 'upcoming').length,
    completed: bookings.filter((booking) => booking.group === 'completed').length,
    enrollments: courses.length,
    activeEnrollments: courses.filter(
      (course) => courseGroup(course) === 'upcoming' || courseGroup(course) === 'ongoing',
    ).length,
  }

  // The next activities, in chronological order.
  const next: AccountActivity[] = [
    ...bookings
      .filter(
        (booking) =>
          (booking.group === 'upcoming' || booking.group === 'pending') &&
          new Date(booking.endDt).getTime() >= Date.now(),
      )
      .map((booking) => ({
        id: `booking-${booking.id}`,
        kind: 'reservation' as const,
        title: booking.serviceName ?? 'Equipment reservation',
        subtitle: `${booking.facilityName}${booking.stationName ? ` · ${booking.stationName}` : ''}`,
        occurredAt: booking.startDt,
        status: booking.status,
        href: `/account/bookings?booking=${booking.id}`,
      })),
    ...courses
      .filter(
        (course) =>
          courseGroup(course) === 'upcoming' || courseGroup(course) === 'ongoing',
      )
      .map((course) => ({
        id: `course-${course.enrollmentId}`,
        kind: 'course' as const,
        title: course.courseTitle,
        subtitle: course.facilityName ?? 'Course registration',
        occurredAt: course.startDt,
        status: course.status,
        href: `/account/courses?course=${course.courseId}`,
      })),
  ]
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    .slice(0, 5)

  // The activity timeline is built from records that actually exist.
  const activity: AccountActivity[] = [
    ...bookings.map((booking) => ({
      id: `booking-created-${booking.id}`,
      kind: 'reservation' as const,
      title: `Reservation ${booking.reference}`,
      subtitle: `${booking.serviceName ?? 'Equipment'} at ${booking.facilityName}`,
      occurredAt: booking.createdAt,
      status: booking.status,
      href: `/account/bookings?booking=${booking.id}`,
    })),
    ...courses.map((course) => ({
      id: `course-registered-${course.enrollmentId}`,
      kind: 'course' as const,
      title: `Registered for ${course.courseTitle}`,
      subtitle: course.facilityName ?? 'Course',
      occurredAt: course.registeredAt,
      status: course.status,
      href: `/account/courses?course=${course.courseId}`,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, 20)

  return NextResponse.json({ counts, next, activity })
}
