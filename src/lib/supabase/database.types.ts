// Database types — auto-generated from Supabase dashboard
// Run: supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
// Placeholder shape for local development without a live project:
export type Database = {
  public: {
    Tables: {
      platform_users: {
        Row: {
          id: string
          email: string
          phone?: string | null
          name: string
          platform_role: string
          avatar_url?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          name: string
          platform_role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          name?: string
          platform_role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url?: string | null
          cover_image_url?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          timezone: string
          brand_color?: string | null
          is_active: boolean
          deposit_pct: number
          cancellation_cutoff_hours: number
          paymob_config_id?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          cover_image_url?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          timezone?: string
          brand_color?: string | null
          is_active?: boolean
          deposit_pct?: number
          cancellation_cutoff_hours?: number
          paymob_config_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          cover_image_url?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          timezone?: string
          brand_color?: string | null
          is_active?: boolean
          deposit_pct?: number
          cancellation_cutoff_hours?: number
          paymob_config_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinic_memberships: {
        Row: {
          id: string
          user_id: string
          clinic_id: string
          role: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinic_id: string
          role?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinic_id?: string
          role?: string
          status?: string
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          clinic_id: string
          name: string
          category: string
          description?: string | null
          duration_minutes: number
          price_egp: number
          deposit_egp?: number | null
          deposit_pct?: number | null
          buffer_minutes: number
          resource_type?: string | null
          image_url?: string | null
          is_active: boolean
          is_bookable: boolean
          booking_mode: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          category: string
          description?: string | null
          duration_minutes?: number
          price_egp: number
          deposit_egp?: number | null
          deposit_pct?: number | null
          buffer_minutes?: number
          resource_type?: string | null
          image_url?: string | null
          is_active?: boolean
          is_bookable?: boolean
          booking_mode?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          category?: string
          description?: string | null
          duration_minutes?: number
          price_egp?: number
          deposit_egp?: number | null
          deposit_pct?: number | null
          buffer_minutes?: number
          resource_type?: string | null
          image_url?: string | null
          is_active?: boolean
          is_bookable?: boolean
          booking_mode?: string
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          clinic_id: string
          name: string
          type: string
          location?: string | null
          description?: string | null
          capacity: number
          is_active: boolean
          image_url?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          type: string
          location?: string | null
          description?: string | null
          capacity?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          type?: string
          location?: string | null
          description?: string | null
          capacity?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      operating_hours: {
        Row: {
          id: string
          clinic_id: string
          resource_id?: string | null
          weekday: number
          start_time: string
          end_time: string
          effective_from?: string | null
          effective_to?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          resource_id?: string | null
          weekday: number
          start_time: string
          end_time: string
          effective_from?: string | null
          effective_to?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          resource_id?: string | null
          weekday?: number
          start_time?: string
          end_time?: string
          effective_from?: string | null
          effective_to?: string | null
          created_at?: string
        }
      }
      availability_blocks: {
        Row: {
          id: string
          clinic_id: string
          resource_id?: string | null
          start_dt: string
          end_dt: string
          reason: string
          created_by: string
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          resource_id?: string | null
          start_dt: string
          end_dt: string
          reason: string
          created_by: string
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          resource_id?: string | null
          start_dt?: string
          end_dt?: string
          reason?: string
          created_by?: string
          is_recurring?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          reference: string
          clinic_id: string
          user_id: string
          service_id?: string | null
          resource_id?: string | null
          start_dt: string
          end_dt: string
          status: string
          notes?: string | null
          deposit_due_egp: number
          balance_due_egp: number
          deposit_paid_egp: number
          source: string
          created_by: string
          cancelled_by?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reference: string
          clinic_id: string
          user_id: string
          service_id?: string | null
          resource_id?: string | null
          start_dt: string
          end_dt: string
          status?: string
          notes?: string | null
          deposit_due_egp?: number
          balance_due_egp?: number
          deposit_paid_egp?: number
          source?: string
          created_by: string
          cancelled_by?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reference?: string
          clinic_id?: string
          user_id?: string
          service_id?: string | null
          resource_id?: string | null
          start_dt?: string
          end_dt?: string
          status?: string
          notes?: string | null
          deposit_due_egp?: number
          balance_due_egp?: number
          deposit_paid_egp?: number
          source?: string
          created_by?: string
          cancelled_by?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booking_holds: {
        Row: {
          id: string
          booking_id: string
          resource_id: string
          start_dt: string
          end_dt: string
          expiration_dt: string
          checkout_session_id?: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          resource_id: string
          start_dt: string
          end_dt: string
          expiration_dt: string
          checkout_session_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          resource_id?: string
          start_dt?: string
          end_dt?: string
          expiration_dt?: string
          checkout_session_id?: string | null
          status?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          clinic_id: string
          provider: string
          provider_tx_id?: string | null
          amount_egp: number
          currency: string
          status: string
          verified_at?: string | null
          idempotency_key?: string | null
          raw_metadata?: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          clinic_id: string
          provider: string
          provider_tx_id?: string | null
          amount_egp?: number
          currency?: string
          status?: string
          verified_at?: string | null
          idempotency_key?: string | null
          raw_metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          clinic_id?: string
          provider?: string
          provider_tx_id?: string | null
          amount_egp?: number
          currency?: string
          status?: string
          verified_at?: string | null
          idempotency_key?: string | null
          raw_metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          clinic_id: string
          title: string
          instructor?: string | null
          description?: string | null
          start_dt: string
          end_dt: string
          capacity: number
          price_egp: number
          deposit_egp?: number | null
          image_url?: string | null
          syllabus?: string | null
          status: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          title: string
          instructor?: string | null
          description?: string | null
          start_dt: string
          end_dt: string
          capacity: number
          price_egp: number
          deposit_egp?: number | null
          image_url?: string | null
          syllabus?: string | null
          status?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          title?: string
          instructor?: string | null
          description?: string | null
          start_dt?: string
          end_dt?: string
          capacity?: number
          price_egp?: number
          deposit_egp?: number | null
          image_url?: string | null
          syllabus?: string | null
          status?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tooth_assistance_requests: {
        Row: {
          id: string
          user_id: string
          clinic_id: string
          booking_id?: string | null
          arch_choice: string
          selected_teeth: string[]
          notes?: string | null
          preferred_appointment_type?: string | null
          status: string
          assigned_staff_id?: string | null
          reviewed_at?: string | null
          reviewed_notes?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinic_id: string
          booking_id?: string | null
          arch_choice: string
          selected_teeth: string[]
          notes?: string | null
          preferred_appointment_type?: string | null
          status?: string
          assigned_staff_id?: string | null
          reviewed_at?: string | null
          reviewed_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinic_id?: string
          booking_id?: string | null
          arch_choice?: string
          selected_teeth?: string[]
          notes?: string | null
          preferred_appointment_type?: string | null
          status?: string
          assigned_staff_id?: string | null
          reviewed_at?: string | null
          reviewed_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tooth_model_assets: {
        Row: {
          id: string
          clinic_id?: string | null
          name: string
          arch: string
          asset_url: string
          version: string
          interaction_mode: string
          attribution?: string | null
          license?: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id?: string | null
          name: string
          arch: string
          asset_url: string
          version: string
          interaction_mode?: string
          attribution?: string | null
          license?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string | null
          name?: string
          arch?: string
          asset_url?: string
          version?: string
          interaction_mode?: string
          attribution?: string | null
          license?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      sterilization_jobs: {
        Row: {
          id: string
          booking_id: string
          service_id: string
          clinic_id: string
          start_dt: string
          end_dt: string
          turnaround_minutes: number
          status: string
          assigned_staff_id?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          service_id: string
          clinic_id: string
          start_dt: string
          end_dt: string
          turnaround_minutes: number
          status?: string
          assigned_staff_id?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          service_id?: string
          clinic_id?: string
          start_dt?: string
          end_dt?: string
          turnaround_minutes?: number
          status?: string
          assigned_staff_id?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          clinic_id: string
          user_id?: string | null
          recipient?: string | null
          event_type: string
          channel: string
          delivery_status: string
          sent_at?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          user_id?: string | null
          recipient?: string | null
          event_type: string
          channel: string
          delivery_status?: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          user_id?: string | null
          recipient?: string | null
          event_type?: string
          channel?: string
          delivery_status?: string
          sent_at?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          clinic_id?: string | null
          actor_id: string
          action: string
          entity: string
          entity_id?: string | null
          before?: Json | null
          after?: Json | null
          ip_address?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id?: string | null
          actor_id: string
          action: string
          entity: string
          entity_id?: string | null
          before?: Json | null
          after?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string | null
          actor_id?: string
          action?: string
          entity?: string
          entity_id?: string | null
          before?: Json | null
          after?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
