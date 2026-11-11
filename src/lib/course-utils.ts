/**
 * Course rules shared by the API routes.
 *
 * The registration state is derived from the stored course record and the
 * real enrolment count. It is never a guess, and it never disagrees with
 * what the database will accept.
 */

export interface RegistrationState {
  open: boolean
  reason: string | null
  /**
   * `open` — a seat can be taken.
   * `full` — every seat is taken.
   * `closed` — the registration window is shut, or the course is not running.
   */
  category: 'open' | 'full' | 'closed'
}

/**
 * Turn a course title into a URL-friendly slug: lowercase, non-alphanumeric
 * characters collapsed into single dashes, trimmed, truncated and falling back
 * to a generic value when nothing usable remains.
 */
export function slugifyCourseTitle(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '')
  return slug === '' ? 'course' : slug
}

/**
 * Whether registration can be started right now, and why not when it cannot.
 *
 * The same conditions are enforced by `enroll_in_course()` inside the
 * database, so this is a presentation of the rule rather than a substitute
 * for it.
 */
export function registrationState(
  course: {
    status: string
    registration_open_at?: string | null
    registration_close_at?: string | null
  },
  seatsTaken: number,
  capacity: number,
): RegistrationState {
  const now = Date.now()

  if (course.status !== 'upcoming') {
    return {
      open: false,
      reason: 'This course is not open for registration.',
      category: 'closed',
    }
  }
  if (
    course.registration_open_at &&
    new Date(course.registration_open_at).getTime() > now
  ) {
    return {
      open: false,
      reason: 'Registration has not opened yet.',
      category: 'closed',
    }
  }
  if (
    course.registration_close_at &&
    new Date(course.registration_close_at).getTime() < now
  ) {
    return {
      open: false,
      reason: 'Registration has closed.',
      category: 'closed',
    }
  }
  if (seatsTaken >= capacity) {
    return { open: false, reason: 'This course is full.', category: 'full' }
  }
  return { open: true, reason: null, category: 'open' }
}
