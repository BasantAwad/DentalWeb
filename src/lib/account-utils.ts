/**
 * Grouping rules shared by the account API routes.
 *
 * These map the real booking and enrolment statuses onto the groups the
 * account area displays. They never invent a status — a reservation is
 * reported under the group its stored status and dates place it in.
 */

export type BookingGroup = 'upcoming' | 'pending' | 'completed' | 'cancelled'
export type CourseGroup = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

/**
 * Which group a reservation belongs to.
 *
 * A reservation that has not been paid for yet is "pending" even if its date
 * is in the future, because it is not actually secured.
 */
export function bookingGroup(
  status: string,
  startDt: string,
  endDt: string,
): BookingGroup {
  if (status === 'cancelled' || status === 'no_show') return 'cancelled'
  if (status === 'completed') return 'completed'
  if (status === 'pending' || status === 'held') return 'pending'
  if (new Date(endDt).getTime() < Date.now()) return 'completed'
  return 'upcoming'
}

/** Which group a registration belongs to. */
export function courseGroup(course: {
  status: string
  startDt: string
  endDt: string
}): CourseGroup {
  if (course.status === 'withdrawn' || course.status === 'cancelled') {
    return 'cancelled'
  }
  if (course.status === 'attended') return 'completed'
  const now = Date.now()
  if (course.endDt && new Date(course.endDt).getTime() < now) return 'completed'
  if (course.startDt && new Date(course.startDt).getTime() <= now) return 'ongoing'
  return 'upcoming'
}
