// Types generated from the implementation plan schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PlatformUserRole = 'platform_owner' | 'clinic_owner' | 'manager' | 'staff' | 'user'

export interface PlatformUser {
  id: string
  email: string
  phone?: string
  name: string
  platform_role: PlatformUserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  name: string
  slug: string
  logo_url?: string
  cover_image_url?: string
  description?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  timezone: string
  brand_color?: string
  is_active: boolean
  deposit_pct: number
  cancellation_cutoff_hours: number
  paymob_config_id?: string
  created_at: string
  updated_at: string
}

export interface ClinicMembership {
  id: string
  user_id: string
  clinic_id: string
  role: 'owner' | 'manager' | 'staff'
  status: 'active' | 'pending' | 'invited'
  created_at: string
}

export interface Service {
  id: string
  clinic_id: string
  name: string
  category: 'general' | 'radiography' | 'sterilization' | 'chair_rental' | 'dummy_head' | 'course' | 'assistance' | 'other'
  description?: string
  duration_minutes: number
  price_egp: number
  deposit_egp?: number
  deposit_pct?: number
  buffer_minutes: number
  resource_type?: 'chair' | 'dummy_head' | 'xray' | 'sterilization' | 'course' | 'assistance'
  image_url?: string
  is_active: boolean
  is_bookable: boolean
  booking_mode: 'hourly' | 'session' | 'all_day'
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  clinic_id: string
  name: string
  type: 'chair' | 'dummy_head' | 'xray' | 'sterilization' | 'course'
  location?: string
  description?: string
  capacity: number
  is_active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface OperatingHours {
  id: string
  clinic_id: string
  resource_id?: string
  weekday: number // 0=Sunday .. 6=Saturday (Egypt)
  start_time: string // HH:mm
  end_time: string
  effective_from?: string
  effective_to?: string
  created_at: string
}

export interface AvailabilityBlock {
  id: string
  clinic_id: string
  resource_id?: string
  start_dt: string // ISO 8601
  end_dt: string
  reason: 'holiday' | 'closure' | 'maintenance' | 'phone_call' | 'blackout' | 'other'
  created_by: string
  is_recurring: boolean
  created_at: string
}

export type BookingStatus = 'pending' | 'held' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Booking {
  id: string
  reference: string
  clinic_id: string
  user_id: string
  service_id?: string
  resource_id?: string
  start_dt: string
  end_dt: string
  status: BookingStatus
  notes?: string
  deposit_due_egp: number
  balance_due_egp: number
  deposit_paid_egp: number
  source: 'web' | 'phone' | 'walk_in' | 'admin'
  created_by: string
  cancelled_by?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
}

export interface BookingHold {
  id: string
  booking_id: string
  resource_id: string
  start_dt: string
  end_dt: string
  expiration_dt: string
  checkout_session_id?: string
  status: 'active' | 'expired' | 'converted' | 'released'
  created_at: string
}

export type PaymentStatus = 'pending' | 'initiated' | 'paid' | 'failed' | 'refunded' | 'offline_recorded'

export interface Payment {
  id: string
  booking_id: string
  clinic_id: string
  provider: 'paymob' | 'offline' | 'cash'
  provider_tx_id?: string
  amount_egp: number
  currency: string
  status: PaymentStatus
  verified_at?: string
  idempotency_key?: string
  raw_metadata?: Json
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  clinic_id: string
  title: string
  instructor?: string
  description?: string
  start_dt: string
  end_dt: string
  capacity: number
  price_egp: number
  deposit_egp?: number
  image_url?: string
  syllabus?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ToothAssistanceRequest {
  id: string
  user_id: string
  clinic_id: string
  booking_id?: string
  arch_choice: 'upper' | 'lower' | 'both'
  selected_teeth: string[] // FDI notation e.g. ["16", "17", "26"]
  notes?: string
  preferred_appointment_type?: string
  status: 'pending' | 'reviewed' | 'scheduled' | 'completed' | 'cancelled'
  assigned_staff_id?: string
  reviewed_at?: string
  reviewed_notes?: string
  created_at: string
  updated_at: string
}

export interface ToothModelAsset {
  id: string
  clinic_id?: string
  name: string
  arch: 'upper' | 'lower' | 'full'
  asset_url: string
  version: string
  interaction_mode: '3d' | '2d' | 'both'
  attribution?: string
  license?: string
  is_active: boolean
  created_at: string
}

export interface SterilizationJob {
  id: string
  booking_id: string
  service_id: string
  clinic_id: string
  start_dt: string
  end_dt: string
  turnaround_minutes: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  assigned_staff_id?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  clinic_id: string
  user_id?: string
  recipient?: string
  event_type: string
  channel: 'email' | 'sms' | 'in_app'
  delivery_status: 'pending' | 'sent' | 'failed'
  sent_at?: string
  created_at: string
}

export interface AuditLog {
  id: string
  clinic_id?: string
  actor_id: string
  action: string
  entity: string
  entity_id?: string
  before?: Json
  after?: Json
  ip_address?: string
  created_at: string
}
