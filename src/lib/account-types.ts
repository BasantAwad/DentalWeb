/**
 * Account-area data contracts.
 *
 * Every shape here comes from the database. Nothing is derived from
 * assumptions about the user.
 */

export interface AccountProfile {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  createdAt: string
  /** Optional personal information. */
  dateOfBirth: string | null
  city: string | null
  /** Optional dental-student information. */
  university: string | null
  academicLevel: string | null
  professionalStatus: string | null
  interests: string[]
  /** Notification preferences. */
  notifyEmail: boolean
  notifySms: boolean
  timezone: string
  /** 0–100. */
  completion: number
}

export type BookingGroup = 'upcoming' | 'pending' | 'completed' | 'cancelled'

export interface AccountBooking {
  id: string
  reference: string
  facilityId: string
  facilityName: string
  facilityCity: string | null
  facilityAddress: string | null
  serviceName: string | null
  serviceCategory: string | null
  /** Present for phantom-head reservations. */
  stationName: string | null
  stationId: string | null
  roomName: string | null
  startDt: string
  endDt: string
  durationHours: number
  hourlyRateEgp: number
  totalEgp: number
  depositDueEgp: number
  depositPaidEgp: number
  balanceDueEgp: number
  paymentStatus: string
  status: string
  createdAt: string
  /** Which group this reservation falls into. */
  group: BookingGroup
}

export interface AccountCourse {
  enrollmentId: string
  courseId: string
  courseSlug: string
  courseTitle: string
  facilityName: string | null
  instructor: string | null
  startDt: string
  endDt: string
  location: string | null
  registeredAt: string
  status: string
  paymentStatus: string
  paymentAmount: number
  sessions: {
    id: string
    title: string
    startDatetime: string
    endDatetime: string | null
    location: string | null
  }[]
}

export interface AccountActivity {
  id: string
  kind: 'reservation' | 'course'
  title: string
  subtitle: string
  occurredAt: string
  status: string
  href: string
}

/** The status vocabulary the account area uses, matching the booking table. */
export const BOOKING_STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting confirmation',
  held: 'Awaiting payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
}

export const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
  registered: 'Registered',
  confirmed: 'Confirmed',
  attended: 'Attended',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  not_required: 'No payment required',
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

export const ACADEMIC_LEVEL_LABEL: Record<string, string> = {
  first_year: 'First year',
  second_year: 'Second year',
  third_year: 'Third year',
  fourth_year: 'Fourth year',
  fifth_year: 'Fifth year',
  postgraduate: 'Postgraduate',
  resident: 'Resident',
  other: 'Other',
}

export const PROFESSIONAL_STATUS_LABEL: Record<string, string> = {
  student: 'Dental student',
  graduate: 'Recent graduate',
  dentist: 'Practising dentist',
  other: 'Other',
}

export const TRAINING_TYPE_LABEL: Record<string, string> = {
  theoretical: 'Theoretical',
  practical: 'Practical',
  combined: 'Theory and practice',
}
