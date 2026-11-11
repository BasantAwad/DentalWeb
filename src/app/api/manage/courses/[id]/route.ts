import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import { slugifyCourseTitle } from '@/lib/course-utils'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/manage/courses/[id]
 *
 * Updates a course the signed-in owner manages.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

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

  const supabase = await createServerSupabaseClient()

  // Ownership is checked against the database, not against a body parameter.
  const { data: course } = await supabase
    .from('courses')
    .select('id, clinic_id, status')
    .eq('id', id)
    .maybeSingle()

  if (!course) {
    return NextResponse.json(
      { error: 'not_found', message: 'That course could not be found.' },
      { status: 404 },
    )
  }

  const { canManageFacility } = await import('@/lib/auth')
  if (!(await canManageFacility(user.id, course.clinic_id))) {
    return NextResponse.json(
      { error: 'not_authorised', message: 'You do not manage that facility.' },
      { status: 403 },
    )
  }

  const updates: Record<string, unknown> = {}

  if (typeof body.title === 'string' && body.title.trim()) {
    updates.title = body.title.trim()
    // A renamed course gets a regenerated, still-unique slug so the public
    // link keeps pointing at the same course instead of drifting.
    const nextSlug = slugifyCourseTitle(String(updates.title))
    const { data: clash } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', nextSlug)
      .neq('id', id)
      .maybeSingle()
    updates.slug = clash ? `${nextSlug}-${Math.random().toString(36).slice(2, 7)}` : nextSlug
  }
  if (typeof body.description === 'string') updates.description = body.description.trim() || null
  if (typeof body.subject === 'string') updates.subject = body.subject.trim() || null
  if (typeof body.specialty === 'string') updates.specialty = body.specialty.trim() || null
  if (typeof body.academicLevel === 'string') updates.academic_level = body.academicLevel || null
  if (body.trainingType === 'theoretical' || body.trainingType === 'practical' || body.trainingType === 'combined') {
    updates.training_type = body.trainingType
  }
  if (Array.isArray(body.learningObjectives)) {
    updates.learning_objectives = body.learningObjectives.filter(
      (item): item is string => typeof item === 'string',
    )
  }
  if (Array.isArray(body.topics)) {
    updates.topics = body.topics.filter((item): item is string => typeof item === 'string')
  }
  if (typeof body.theoreticalComponents === 'string') {
    updates.theoretical_components = body.theoreticalComponents.trim() || null
  }
  if (typeof body.practicalComponents === 'string') {
    updates.practical_components = body.practicalComponents.trim() || null
  }
  if (typeof body.includesSupervisedPractice === 'boolean') {
    updates.includes_supervised_practice = body.includesSupervisedPractice
  }
  if (typeof body.materialsRequired === 'string') {
    updates.materials_required = body.materialsRequired.trim() || null
  }
  if (typeof body.instructor === 'string') updates.instructor = body.instructor.trim() || null
  if (typeof body.imageUrl === 'string') updates.image_url = body.imageUrl.trim() || null
  if (typeof body.startDt === 'string') updates.start_dt = body.startDt
  if (typeof body.endDt === 'string') updates.end_dt = body.endDt
  if (body.capacity != null) {
    const capacity = Number(body.capacity)
    if (!Number.isInteger(capacity) || capacity < 1) {
      return NextResponse.json(
        { error: 'invalid_capacity', message: 'Capacity must be a whole number of at least 1.' },
        { status: 400 },
      )
    }
    updates.capacity = capacity
  }
  if (body.priceEgp != null) {
    const price = Number(body.priceEgp)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: 'invalid_price', message: 'The price must be zero or more.' },
        { status: 400 },
      )
    }
    updates.price_egp = Math.round(price)
  }
  if (body.paymentPolicy === 'free' || body.paymentPolicy === 'full' || body.paymentPolicy === 'deposit') {
    updates.payment_policy = body.paymentPolicy
    updates.deposit_pct = body.depositPct == null ? null : Number(body.depositPct)
  }
  if ('registrationOpenAt' in body) {
    updates.registration_open_at =
      typeof body.registrationOpenAt === 'string' && body.registrationOpenAt
        ? body.registrationOpenAt
        : null
  }
  if ('registrationCloseAt' in body) {
    updates.registration_close_at =
      typeof body.registrationCloseAt === 'string' && body.registrationCloseAt
        ? body.registrationCloseAt
        : null
  }

  // Publishing, unpublishing and archiving.
  if (body.publish === true && course.status !== 'upcoming') {
    updates.status = 'upcoming'
    updates.published_at = new Date().toISOString()
  }
  if (body.publish === false && course.status === 'upcoming') {
    updates.status = 'draft'
    updates.published_at = null
  }
  if (body.status === 'completed' || body.status === 'cancelled' || body.status === 'ongoing') {
    updates.status = body.status
  }
  if (typeof body.isActive === 'boolean') updates.is_active = body.isActive

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'nothing_to_update', message: 'No changes were supplied.' },
      { status: 400 },
    )
  }

  const { error } = await supabase.from('courses').update(updates).eq('id', id)

  if (error) {
    console.error('[DentalWeb] course update failed:', error.message)
    return NextResponse.json(
      { error: 'update_failed', message: 'The course could not be saved.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
