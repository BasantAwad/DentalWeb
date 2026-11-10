/**
 * Platform data contracts and the client used to read them.
 *
 * The backend is the only source of truth for facilities, resources,
 * availability and pricing. Nothing here fabricates data — when the
 * platform has nothing published, the API says so and the UI says so.
 */

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
