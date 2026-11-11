import { NextResponse } from 'next/server'
import { getSessionUser, canManageFacility } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/manage/courses/[id]/enrollments
 *
 * The students registered for a course, with only the information a facility
 * needs to prepare a session.
 *
 * A facility never sees a student's full profile, their unrelated bookings,
 * or their account settings — only what is relevant to this course.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  if (!isBackendConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message: 'Registrations need a configured database.',
      enrollments: [],
    })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.' },
      { status: 401 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, clinic_id, capacity')
    .eq('id', id)
    .maybeSingle()

  if (!course) {
    return NextResponse.json(
      { error: 'not_found', message: 'That course could not be found.' },
      { status: 404 },
    )
  }

  if (!(await canManageFacility(user.id, course.clinic_id))) {
    return NextResponse.json(
      { error: 'not_authorised', message: 'You do not manage that facility.' },
      { status: 403 },
    )
  }

  const { data: rows, error } = await supabase
    .from('course_enrollments')
    .select(
      `id, status, payment_status, payment_amount, registered_at, notes,
       platform_users (
         id, name, email, phone,
         user_profiles (university, academic_level, professional_status)
       )`,
    )
    .eq('course_id', id)
    .order('registered_at', { ascending: true })

  if (error) {
    console.error('[DentalWeb] enrolment lookup failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Registrations could not be loaded.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      capacity: course.capacity,
    },
    enrollments: (rows ?? []).map((row) => {
      const student = Array.isArray(row.platform_users)
        ? row.platform_users[0]
        : row.platform_users
      const profile = student
        ? Array.isArray(student.user_profiles)
          ? student.user_profiles[0]
          : student.user_profiles
        : null

      return {
        id: row.id,
        // Only what a facility needs to prepare the session.
        studentName: student?.name ?? 'Student',
        studentEmail: student?.email ?? null,
        studentPhone: student?.phone ?? null,
        university: profile?.university ?? null,
        academicLevel: profile?.academic_level ?? null,
        professionalStatus: profile?.professional_status ?? null,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentAmount: row.payment_amount,
        registeredAt: row.registered_at,
        notes: row.notes ?? null,
      }
    }),
  })
}
