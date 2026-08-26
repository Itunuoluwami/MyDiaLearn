export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      availability_windows: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          timezone: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          timezone?: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          timezone?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_windows_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booked_by: string
          booking_timezone: string
          cancellation_policy_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          commission_rule_id: string | null
          created_at: string
          currency: string
          duration_minutes: number
          education_level_id: string | null
          ends_at: string
          hourly_rate: number
          id: string
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_notes: string | null
          subject_id: string | null
          total_amount: number
          tutor_id: string
          updated_at: string
        }
        Insert: {
          booked_by: string
          booking_timezone?: string
          cancellation_policy_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commission_rule_id?: string | null
          created_at?: string
          currency?: string
          duration_minutes: number
          education_level_id?: string | null
          ends_at: string
          hourly_rate: number
          id?: string
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_notes?: string | null
          subject_id?: string | null
          total_amount: number
          tutor_id: string
          updated_at?: string
        }
        Update: {
          booked_by?: string
          booking_timezone?: string
          cancellation_policy_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commission_rule_id?: string | null
          created_at?: string
          currency?: string
          duration_minutes?: number
          education_level_id?: string | null
          ends_at?: string
          hourly_rate?: number
          id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          student_notes?: string | null
          subject_id?: string | null
          total_amount?: number
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancellation_policy_id_fkey"
            columns: ["cancellation_policy_id"]
            isOneToOne: false
            referencedRelation: "cancellation_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_commission_rule_id_fkey"
            columns: ["commission_rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "bookings_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_policies: {
        Row: {
          applies_to: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          description: string | null
          hours_before: number
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          refund_percentage: number
          tutor_compensation_percentage: number
          updated_at: string
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          description?: string | null
          hours_before?: number
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          refund_percentage?: number
          tutor_compensation_percentage?: number
          updated_at?: string
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          description?: string | null
          hours_before?: number
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          refund_percentage?: number
          tutor_compensation_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      class_sessions: {
        Row: {
          booking_id: string
          created_at: string
          ended_at: string | null
          homework: string | null
          id: string
          meeting_provider: string | null
          meeting_url: string | null
          recording_url: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          student_attended: boolean | null
          tutor_attended: boolean | null
          tutor_notes: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          ended_at?: string | null
          homework?: string | null
          id?: string
          meeting_provider?: string | null
          meeting_url?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          student_attended?: boolean | null
          tutor_attended?: boolean | null
          tutor_notes?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          ended_at?: string | null
          homework?: string | null
          id?: string
          meeting_provider?: string | null
          meeting_url?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          student_attended?: boolean | null
          tutor_attended?: boolean | null
          tutor_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          agency_id: string | null
          applies_to: Database["public"]["Enums"]["app_role"]
          created_at: string
          currency: string | null
          effective_from: string
          effective_to: string | null
          fixed_amount: number | null
          id: string
          is_active: boolean
          model: Database["public"]["Enums"]["commission_model"]
          name: string
          notes: string | null
          percentage: number | null
          platform_fee_fixed: number
          platform_fee_percentage: number
          priority: number
          subject_id: string | null
          tiers: Json
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          applies_to?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          currency?: string | null
          effective_from?: string
          effective_to?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          model?: Database["public"]["Enums"]["commission_model"]
          name: string
          notes?: string | null
          percentage?: number | null
          platform_fee_fixed?: number
          platform_fee_percentage?: number
          priority?: number
          subject_id?: string | null
          tiers?: Json
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          applies_to?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          currency?: string | null
          effective_from?: string
          effective_to?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean
          model?: Database["public"]["Enums"]["commission_model"]
          name?: string
          notes?: string | null
          percentage?: number | null
          platform_fee_fixed?: number
          platform_fee_percentage?: number
          priority?: number
          subject_id?: string | null
          tiers?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "tutor_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "commission_rules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          decimals: number
          is_active: boolean
          is_payout_currency: boolean
          name: string
          sort_order: number
          symbol: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          is_active?: boolean
          is_payout_currency?: boolean
          name: string
          sort_order?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          is_active?: boolean
          is_payout_currency?: boolean
          name?: string
          sort_order?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      curricula: {
        Row: {
          code: string
          country_code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      education_levels: {
        Row: {
          code: string
          created_at: string
          curriculum_id: string | null
          id: string
          is_active: boolean
          max_age: number | null
          min_age: number | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          curriculum_id?: string | null
          id?: string
          is_active?: boolean
          max_age?: number | null
          min_age?: number | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          curriculum_id?: string | null
          id?: string
          is_active?: boolean
          max_age?: number | null
          min_age?: number | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_levels_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curricula"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          created_at: string
          effective_from: string
          id: string
          quote_currency: string
          rate: number
        }
        Insert: {
          base_currency: string
          created_at?: string
          effective_from?: string
          id?: string
          quote_currency: string
          rate: number
        }
        Update: {
          base_currency?: string
          created_at?: string
          effective_from?: string
          id?: string
          quote_currency?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_base_currency_fkey"
            columns: ["base_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exchange_rates_quote_currency_fkey"
            columns: ["quote_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      notification_templates: {
        Row: {
          audience: Database["public"]["Enums"]["app_role"] | null
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          subject: string | null
          trigger_key: string
          updated_at: string
          variables: Json
        }
        Insert: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          subject?: string | null
          trigger_key: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          subject?: string | null
          trigger_key?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json
          id: string
          link: string | null
          read_at: string | null
          sent_at: string | null
          template_id: string | null
          title: string | null
          trigger_key: string | null
          user_id: string
        }
        Insert: {
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          id?: string
          link?: string | null
          read_at?: string | null
          sent_at?: string | null
          template_id?: string | null
          title?: string | null
          trigger_key?: string | null
          user_id: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          id?: string
          link?: string | null
          read_at?: string | null
          sent_at?: string | null
          template_id?: string | null
          title?: string | null
          trigger_key?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          commission_amount: number
          commission_rule_id: string | null
          created_at: string
          currency: string
          exchange_rate: number | null
          id: string
          metadata: Json
          paid_at: string | null
          payer_id: string
          platform_fee: number
          provider: string | null
          provider_reference: string | null
          refunded_amount: number
          status: Database["public"]["Enums"]["payment_status"]
          tutor_id: string | null
          tutor_payout: number
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          commission_amount?: number
          commission_rule_id?: string | null
          created_at?: string
          currency?: string
          exchange_rate?: number | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          payer_id: string
          platform_fee?: number
          provider?: string | null
          provider_reference?: string | null
          refunded_amount?: number
          status?: Database["public"]["Enums"]["payment_status"]
          tutor_id?: string | null
          tutor_payout?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          commission_amount?: number
          commission_rule_id?: string | null
          created_at?: string
          currency?: string
          exchange_rate?: number | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          payer_id?: string
          platform_fee?: number
          provider?: string | null
          provider_reference?: string | null
          refunded_amount?: number
          status?: Database["public"]["Enums"]["payment_status"]
          tutor_id?: string | null
          tutor_payout?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_commission_rule_id_fkey"
            columns: ["commission_rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          key: string
          label: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          key: string
          label: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          key?: string
          label?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          group_name: string
          is_public: boolean
          key: string
          label: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_name?: string
          is_public?: boolean
          key: string
          label: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          group_name?: string
          is_public?: boolean
          key?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country_code: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          onboarding_completed: boolean
          phone: string | null
          preferred_currency: string
          primary_role: Database["public"]["Enums"]["app_role"]
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          preferred_currency?: string
          primary_role?: Database["public"]["Enums"]["app_role"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          preferred_currency?: string
          primary_role?: Database["public"]["Enums"]["app_role"]
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_published: boolean
          rater_id: string
          score: number
          student_id: string | null
          tutor_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          rater_id: string
          score: number
          student_id?: string | null
          tutor_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          rater_id?: string
          score?: number
          student_id?: string | null
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          can_book_lessons: boolean
          can_message_tutors: boolean
          can_self_login: boolean
          created_at: string
          curriculum_id: string | null
          date_of_birth: string | null
          education_level_id: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean
          last_name: string | null
          learning_goals: string | null
          parent_id: string | null
          profile_id: string | null
          school_name: string | null
          special_needs: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          can_book_lessons?: boolean
          can_message_tutors?: boolean
          can_self_login?: boolean
          created_at?: string
          curriculum_id?: string | null
          date_of_birth?: string | null
          education_level_id?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          learning_goals?: string | null
          parent_id?: string | null
          profile_id?: string | null
          school_name?: string | null
          special_needs?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          can_book_lessons?: boolean
          can_message_tutors?: boolean
          can_self_login?: boolean
          created_at?: string
          curriculum_id?: string | null
          date_of_birth?: string | null
          education_level_id?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          learning_goals?: string | null
          parent_id?: string | null
          profile_id?: string | null
          school_name?: string | null
          special_needs?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tutor_agencies: {
        Row: {
          about: string | null
          contact_email: string | null
          contact_phone: string | null
          country_code: string | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_id: string
          registration_number: string | null
          slug: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          about?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          registration_number?: string | null
          slug?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          about?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          registration_number?: string | null
          slug?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      tutor_subjects: {
        Row: {
          created_at: string
          education_level_id: string | null
          id: string
          subject_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          education_level_id?: string | null
          id?: string
          subject_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          education_level_id?: string | null
          id?: string
          subject_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_subjects_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_subjects_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_verification_progress: {
        Row: {
          created_at: string
          document_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["verification_status"]
          step_id: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          step_id: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          step_id?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_verification_progress_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_verification_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "verification_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_verification_progress_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutors: {
        Row: {
          agency_id: string | null
          biography: string | null
          created_at: string
          currency: string
          headline: string | null
          hourly_rate: number | null
          id: string
          intro_video_url: string | null
          is_listed: boolean
          languages: Json
          profile_id: string
          qualifications: Json
          timezone: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number | null
        }
        Insert: {
          agency_id?: string | null
          biography?: string | null
          created_at?: string
          currency?: string
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          intro_video_url?: string | null
          is_listed?: boolean
          languages?: Json
          profile_id: string
          qualifications?: Json
          timezone?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Update: {
          agency_id?: string | null
          biography?: string | null
          created_at?: string
          currency?: string
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          intro_video_url?: string | null
          is_listed?: boolean
          languages?: Json
          profile_id?: string
          qualifications?: Json
          timezone?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tutors_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "tutor_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_steps: {
        Row: {
          applies_to: Database["public"]["Enums"]["app_role"]
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["app_role"]
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["app_role"]
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_booking: { Args: { _booking_id: string }; Returns: boolean }
      can_access_student: { Args: { _student_id: string }; Returns: boolean }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      owns_tutor: { Args: { _tutor_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "parent" | "tutor" | "agency" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rejected"
        | "no_show"
      commission_model: "percentage" | "fixed" | "tiered"
      notification_channel: "in_app" | "email" | "sms" | "push"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
      verification_status:
        | "unverified"
        | "pending"
        | "in_review"
        | "verified"
        | "rejected"
        | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "parent", "tutor", "agency", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "rejected",
        "no_show",
      ],
      commission_model: ["percentage", "fixed", "tiered"],
      notification_channel: ["in_app", "email", "sms", "push"],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      verification_status: [
        "unverified",
        "pending",
        "in_review",
        "verified",
        "rejected",
        "suspended",
      ],
    },
  },
} as const
