/**
 * Platform data contracts and the client used to read them.
 *
 * The backend is the only source of truth for facilities, resources,
 * availability and pricing. Nothing here fabricates data — when the
 * platform has nothing published, the API says so and the UI says so.
 */

import type {
  AccountActivity,
  AccountBooking,
  AccountCourse,
  AccountProfile,
} from './account-types'

export type { AccountActivity, AccountBooking, AccountCourse, AccountProfile }

export type ResourceType = 'chair' | 'dummy_head' | 'xray' | 'sterilization' | 'course'

export interface ServiceSummary {
  id: string
  name: string
  category: string
  priceEgp: number
  resourceType: string | null
  durationMinutes: number
  description?: string | null
  isBookable?: boolean
}

export interface FacilitySummary {
  id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  coverImageUrl: string | null
  logoUrl: string | null
  timezone: string
  depositPct: number
  cancellationCutoffHours: number
  services: ServiceSummary[]
}

export interface FacilityHours {
  weekday: number
  startTime: string | null
  endTime: string | null
  closed: boolean
}

export interface FacilityResource {
  id: string
  name: string
  type: ResourceType
  location: string | null
  description: string | null
  capacity: number
  isActive: boolean
  imageUrl: string | null
}

export interface FacilityDetail extends FacilitySummary {
  phone: string | null
  email: string | null
  hours: FacilityHours[]
  resources: FacilityResource[]
}

export interface AvailabilitySlot {
  hour: string
  available: boolean
  occupiedUntil?: string
  reason?: string
}

export interface AvailabilityResponse {
  date: string
  resourceId: string
  slots: AvailabilitySlot[]
  timezone: string
  depositPct: number
}

export interface BookingQuote {
  facilityId: string
  serviceId: string
  resourceId?: string
  startDt: string
  endDt: string
  durationHours: number
  hourlyRateEgp: number
  totalEgp: number
  depositEgp: number
  remainingEgp: number
  depositPct: number
  currency: 'EGP'
}

/** Error shape returned by the platform API. */
export interface ApiError {
  error: string
  message: string
}

export class PlatformApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'PlatformApiError'
    this.code = code
    this.status = status
  }
}

export interface FacilitiesResponse {
  facilities: FacilitySummary[]
  backend?: string
  message?: string
}

export interface FacilityDetailResponse {
  facility: FacilityDetail | null
  backend?: string
  message?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new PlatformApiError(
      payload.error ?? 'request_failed',
      payload.message ?? 'The request could not be completed.',
      response.status,
    )
  }

  return payload as T
}

export function listFacilities(params: {
  q?: string
  service?: string
  city?: string
}): Promise<FacilitiesResponse> {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.service) search.set('service', params.service)
  if (params.city) search.set('city', params.city)
  return request(`/api/facilities?${search.toString()}`)
}

export function getFacility(slug: string): Promise<FacilityDetailResponse> {
  return request(`/api/facilities/${slug}`)
}

export function getAvailability(params: {
  clinicId: string
  resourceId: string
  date: string
}): Promise<AvailabilityResponse> {
  const search = new URLSearchParams({
    clinicId: params.clinicId,
    resourceId: params.resourceId,
    date: params.date,
  })
  return request(`/api/availability?${search.toString()}`)
}

/* ── Courses ─────────────────────────────────────────────────────────────── */

export type TrainingType = 'theoretical' | 'practical' | 'combined'

export interface CourseSummary {
  id: string
  slug: string
  title: string
  description: string
  subject: string | null
  specialty: string | null
  academicLevel: string | null
  trainingType: TrainingType
  learningObjectives: string[]
  topics: string[]
  theoreticalComponents: string | null
  practicalComponents: string | null
  includesSupervisedPractice: boolean
  materialsRequired: string | null
  startDt: string
  endDt: string
  capacity: number
  seatsTaken: number
  seatsRemaining: number
  priceEgp: number
  depositPct: number | null
  paymentPolicy: 'free' | 'full' | 'deposit'
  registrationOpenAt: string | null
  registrationCloseAt: string | null
  imageUrl: string | null
  syllabus: string | null
  sessionCount: number
  instructor: string | null
  facility: {
    id: string
    name: string
    slug: string
    city: string | null
    address: string | null
    coverImageUrl: string | null
  } | null
  registration: { open: boolean; reason: string | null }
}

export interface CourseFacets {
  subjects: string[]
  levels: string[]
  types: string[]
  cities: string[]
  facilities: { id: string; name: string; city: string | null }[]
}

export interface CourseSession {
  id: string
  title: string
  description: string | null
  startDatetime: string
  endDatetime: string | null
  location: string | null
  sessionIndex: number
}

export interface CourseDetail extends Omit<CourseSummary, 'facility' | 'instructor'> {
  instructor: {
    id: string | null
    name: string
    bio: string | null
    qualifications: string | null
    profileImage: string | null
  } | null
  facility: {
    id: string
    name: string
    slug: string
    city: string | null
    address: string | null
    coverImageUrl: string | null
    phone: string | null
    email: string | null
  } | null
}

export interface CourseDetailResponse {
  course: CourseDetail | null
  sessions: CourseSession[]
  enrolment: {
    id: string
    status: string
    paymentStatus: string
    paymentAmount: number
    registeredAt: string
  } | null
  backend?: string
  message?: string
}

export function listCourses(params: {
  q?: string
  subject?: string
  level?: string
  type?: string
  clinicId?: string
  city?: string
  from?: string
  to?: string
  registration?: 'open' | 'full' | 'closed'
  sort?: 'date' | 'price' | 'price-desc'
}): Promise<{
  courses: CourseSummary[]
  facets: CourseFacets
  backend?: string
  message?: string
}> {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.subject) search.set('subject', params.subject)
  if (params.level) search.set('level', params.level)
  if (params.type) search.set('type', params.type)
  if (params.clinicId) search.set('clinicId', params.clinicId)
  if (params.city) search.set('city', params.city)
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.registration) search.set('registration', params.registration)
  if (params.sort) search.set('sort', params.sort)
  return request(`/api/courses?${search.toString()}`)
}

export function getCourse(slug: string): Promise<CourseDetailResponse> {
  return request(`/api/courses/${slug}`)
}

export function enrollInCourse(slug: string): Promise<{
  success: boolean
  enrolment: {
    id: string
    status: string
    paymentStatus: string
    paymentAmount: number
  }
  seatsTaken: number
  capacity: number
  seatsRemaining: number
  paymentPolicy: string
  paymentAmount: number
}> {
  return request(`/api/courses/${slug}/enroll`, { method: 'POST' })
}

/* ── Account ─────────────────────────────────────────────────────────────── */

export function getAccountProfile(): Promise<{ profile: AccountProfile | null }> {
  return request('/api/account/profile')
}

export function updateAccountProfile(
  patch: Partial<AccountProfile>,
): Promise<{ profile: AccountProfile | null }> {
  return request('/api/account/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function getAccountBookings(): Promise<{
  bookings: AccountBooking[]
  counts: Record<string, number>
}> {
  return request('/api/account/bookings')
}

export function getAccountCourses(): Promise<{
  courses: AccountCourse[]
  counts: Record<string, number>
}> {
  return request('/api/account/courses')
}

export function getAccountOverview(): Promise<{
  counts: {
    reservations: number
    upcoming: number
    completed: number
    enrollments: number
    activeEnrollments: number
  }
  next: AccountActivity[]
  activity: AccountActivity[]
}> {
  return request('/api/account/overview')
}

/* ── Session ─────────────────────────────────────────────────────────────── */

export interface SessionUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  platformRole: string
}

export function getSession(): Promise<{
  signedIn: boolean
  backendConfigured: boolean
  user: SessionUser | null
}> {
  return request('/api/auth/session')
}

export function signIn(payload: {
  email: string
  password: string
}): Promise<{ success: boolean; user: { id: string; name: string } }> {
  return request('/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: {
  name: string
  email: string
  password: string
  phone?: string
}): Promise<{ success: boolean; signedIn: boolean; message: string }> {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function signOut(): Promise<{ success: boolean }> {
  return request('/api/auth/sign-out', { method: 'POST' })
}

/* ── Owner course management ─────────────────────────────────────────────── */

export interface ManagedCourse {
  id: string
  slug: string
  title: string
  description: string
  subject: string | null
  specialty: string | null
  academicLevel: string | null
  trainingType: TrainingType
  learningObjectives: string[]
  topics: string[]
  theoreticalComponents: string | null
  practicalComponents: string | null
  includesSupervisedPractice: boolean
  materialsRequired: string | null
  startDt: string
  endDt: string
  capacity: number
  seatsTaken: number
  seatsRemaining: number
  priceEgp: number
  depositPct: number | null
  paymentPolicy: 'free' | 'full' | 'deposit'
  registrationOpenAt: string | null
  registrationCloseAt: string | null
  status: string
  imageUrl: string | null
  sessionCount: number
  instructor: string | null
  clinicId: string
  facilityName: string
}

export interface ManagedFacility {
  id: string
  name: string
  slug: string
  city: string | null
  role: 'owner' | 'manager' | 'staff'
}

export function listManagedFacilities(): Promise<{
  facilities: ManagedFacility[]
  backend?: string
  message?: string
}> {
  return request('/api/manage/facilities')
}

export function listManagedCourses(clinicId?: string): Promise<{
  courses: ManagedCourse[]
  backend?: string
  message?: string
}> {
  return request(
    `/api/manage/courses${clinicId ? `?clinicId=${clinicId}` : ''}`,
  )
}

export interface CourseDraft {
  clinicId: string
  title: string
  description?: string
  subject?: string
  specialty?: string
  academicLevel?: string
  trainingType?: TrainingType
  learningObjectives?: string[]
  topics?: string[]
  theoreticalComponents?: string
  practicalComponents?: string
  includesSupervisedPractice?: boolean
  materialsRequired?: string
  instructor?: string
  imageUrl?: string
  startDt: string
  endDt?: string
  capacity: number
  priceEgp: number
  paymentPolicy?: 'free' | 'full' | 'deposit'
  depositPct?: number | null
  registrationOpenAt?: string | null
  registrationCloseAt?: string | null
  publish?: boolean
  sessions?: {
    title?: string
    description?: string
    startDatetime: string
    endDatetime?: string
    location?: string
  }[]
}

export function createCourse(draft: CourseDraft): Promise<{ course: { id: string; slug: string } }> {
  return request('/api/manage/courses', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
}

export function updateCourse(
  id: string,
  patch: Partial<CourseDraft> & { status?: string; publish?: boolean; isActive?: boolean },
): Promise<{ success: boolean }> {
  return request(`/api/manage/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export interface CourseEnrollment {
  id: string
  studentName: string
  studentEmail: string | null
  studentPhone: string | null
  university: string | null
  academicLevel: string | null
  professionalStatus: string | null
  status: string
  paymentStatus: string
  paymentAmount: number
  registeredAt: string
  notes: string | null
}

export function listCourseEnrollments(courseId: string): Promise<{
  course: { id: string; title: string; capacity: number }
  enrollments: CourseEnrollment[]
}> {
  return request(`/api/manage/courses/${courseId}/enrollments`)
}

/**
 * Server-side price quote.
 * The client never computes the amount that will be charged — this asks the
 * backend, and the booking endpoint recomputes it again before charging.
 */
export function quoteBooking(body: {
  facilityId: string
  serviceId: string
  resourceId?: string
  startDt: string
  endDt: string
}): Promise<{ quote: BookingQuote }> {
  return request('/api/booking/quote', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
