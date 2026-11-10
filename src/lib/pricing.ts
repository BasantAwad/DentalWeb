/**
 * Confirmed business rules — single source of truth.
 *
 * Source: docs/BOOKING_BUSINESS_RULES.md (v1.0, "Confirmed")
 *
 * Money is handled in integer minor units (piastres, 1 EGP = 100 piastres).
 * Floating point is never used for monetary arithmetic.
 */

/** 150 EGP per hour. */
export const DENTAL_CHAIR_HOURLY_EGP = 150
/** 100 EGP per hour. */
export const PHANTOM_HEAD_HOURLY_EGP = 100
/** Deposit is 50% of the total booking amount. */
export const DEPOSIT_RATE = 0.5

export type RentalServiceKey = 'dental-chair' | 'phantom-head'

export interface RentalService {
  key: RentalServiceKey
  /** Stable application identifier. */
  id: string
  name: string
  shortName: string
  /** Hourly rate in piastres (integer minor units). */
  hourlyRateMinor: number
  hourlyRateEgp: number
  currency: 'EGP'
  unit: 'hour'
  description: string
  /** Route used for the "explore availability" path. */
  href: string
}

export const RENTAL_SERVICES: Record<RentalServiceKey, RentalService> = {
  'dental-chair': {
    key: 'dental-chair',
    id: 'dental-chair',
    name: 'Dental chair',
    shortName: 'Chair',
    hourlyRateMinor: DENTAL_CHAIR_HOURLY_EGP * 100,
    hourlyRateEgp: DENTAL_CHAIR_HOURLY_EGP,
    currency: 'EGP',
    unit: 'hour',
    description:
      'A full clinical setup — articulating chair, delivery unit, operating light and sterilised instrument tray — reserved by the hour.',
    href: '/services/dental-chair',
  },
  'phantom-head': {
    key: 'phantom-head',
    id: 'phantom-head',
    name: 'Phantom head',
    shortName: 'Phantom head',
    hourlyRateMinor: PHANTOM_HEAD_HOURLY_EGP * 100,
    hourlyRateEgp: PHANTOM_HEAD_HOURLY_EGP,
    currency: 'EGP',
    unit: 'hour',
    description:
      'A manned training station with typodont, handpieces and suction, so you can rehearse procedures at your own pace.',
    href: '/services/phantom-head',
  },
}

export const RENTAL_SERVICE_LIST: RentalService[] = [
  RENTAL_SERVICES['dental-chair'],
  RENTAL_SERVICES['phantom-head'],
]

/**
 * Server-authoritative price calculation.
 *
 * @param hourlyRateMinor  rate in piastres
 * @param durationHours    whole-hour booking length
 */
export function calculateBookingAmounts(hourlyRateMinor: number, durationHours: number) {
  const totalMinor = hourlyRateMinor * durationHours
  // 50% of an integer total: floor the odd piastre to the customer.
  const depositMinor = Math.floor((totalMinor * DEPOSIT_RATE) / 100) * 100 === 0
    ? Math.floor(totalMinor * DEPOSIT_RATE)
    : Math.floor(totalMinor * DEPOSIT_RATE)
  const remainingMinor = totalMinor - depositMinor
  return { totalMinor, depositMinor, remainingMinor, hourlyRateMinor, durationHours }
}

/** Format integer minor units as an EGP string, e.g. 15000 -> "150 EGP". */
export function formatEgp(minor: number): string {
  const egp = minor / 100
  return `${Number.isInteger(egp) ? egp : egp.toFixed(2)} EGP`
}

/** Format integer minor units as a bare EGP amount, e.g. 15000 -> "150". */
export function formatEgpAmount(minor: number): string {
  const egp = minor / 100
  return Number.isInteger(egp) ? String(egp) : egp.toFixed(2)
}
