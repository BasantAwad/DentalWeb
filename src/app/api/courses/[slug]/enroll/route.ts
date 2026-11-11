import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/courses/[slug]/enroll
 *
 * Registers the signed-in student for a course.
 *
 * Capacity, the registration window and duplicate registrations are all
 * enforced inside the database function `enroll_in_course()`, which locks the
 * course row so the final seat cannot be taken twice.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params

  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'backend_not_configured',
        message: 'Registration needs a configured database.',
      },
      { status: 503 },
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      {
        error: 'authentication_required',
        message: 'Please sign in to register for a course.',
      },
      { status: 401 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) {
    return NextResponse.json(
      { error: 'not_found', message: 'That course could not be found.' },
      { status: 404 },
    )
  }

  const { data, error } = await supabase.rpc('enroll_in_course', {
    p_course_id: course.id,
    p_user_id: user.id,
  })

  if (error) {
    // The function raises a specific message for each refusal reason.
    const reason = error.message ?? 'Registration failed.'

    const refusals: Record<string, { code: string; message: string; status: number }> = {
      not_authorised: {
        code: 'not_authorised',
        message: 'You can only register yourself.',
        status: 403,
      },
      course_not_found: {
        code: 'not_found',
        message: 'That course could not be found.',
        status: 404,
      },
      course_not_available: {
        code: 'not_available',
        message: 'This course is not open for registration.',
        status: 409,
      },
      registration_not_open: {
        code: 'registration_not_open',
        message: 'Registration has not opened yet.',
        status: 409,
      },
      registration_closed: {
        code: 'registration_closed',
        message: 'Registration for this course has closed.',
        status: 409,
      },
      course_full: {
        code: 'course_full',
        message: 'This course is full. Every seat has been taken.',
        status: 409,
      },
      already_enrolled: {
        code: 'already_enrolled',
        message: 'You are already registered for this course.',
        status: 409,
      },
    }

    const refusal = refusals[reason]
    if (refusal) {
      return NextResponse.json(
        { error: refusal.code, message: refusal.message },
        { status: refusal.status },
      )
    }

    console.error('[DentalWeb] enrolment failed:', error.message)
    return NextResponse.json(
      { error: 'enrolment_failed', message: 'Registration could not be completed.' },
      { status: 500 },
    )
  }

  const result = data as {
    enrollment: { id: string; status: string; payment_status: string; payment_amount: number }
    seats_taken: number
    capacity: number
    payment_amount: number
    payment_policy: string
  }

  return NextResponse.json(
    {
      success: true,
      enrolment: {
        id: result.enrollment.id,
        status: result.enrollment.status,
        paymentStatus: result.enrollment.payment_status,
        paymentAmount: result.enrollment.payment_amount,
      },
      seatsTaken: result.seats_taken,
      capacity: result.capacity,
      seatsRemaining: Math.max(0, result.capacity - result.seats_taken),
      paymentPolicy: result.payment_policy,
      paymentAmount: result.payment_amount,
    },
    { status: 201 },
  )
}
