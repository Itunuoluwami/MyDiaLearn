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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          assigned_at: string | null
          booking_id: string | null
          created_at: string
          due_at: string | null
          feedback: string | null
          id: string
          instructions: string | null
          resource_id: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          subject_id: string | null
          submission_path: string | null
          submission_requirements: string | null
          submission_text: string | null
          submitted_at: string | null
          title: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          booking_id?: string | null
          created_at?: string
          due_at?: string | null
          feedback?: string | null
          id?: string
          instructions?: string | null
          resource_id?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          subject_id?: string | null
          submission_path?: string | null
          submission_requirements?: string | null
          submission_text?: string | null
          submitted_at?: string | null
          title: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          booking_id?: string | null
          created_at?: string
          due_at?: string | null
          feedback?: string | null
          id?: string
          instructions?: string | null
          resource_id?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id?: string
          subject_id?: string | null
          submission_path?: string | null
          submission_requirements?: string | null
          submission_text?: string | null
          submitted_at?: string | null
          title?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "learning_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
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
          tutor_accepted_at: string | null
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
          tutor_accepted_at?: string | null
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
          tutor_accepted_at?: string | null
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
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string
          id: string
          last_message_at: string | null
          student_id: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          last_message_at?: string | null
          student_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          last_message_at?: string | null
          student_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
      learning_resources: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          is_shared: boolean
          mime_type: string | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          size_bytes: number | null
          storage_path: string | null
          student_id: string | null
          subject_id: string | null
          title: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          is_shared?: boolean
          mime_type?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          size_bytes?: number | null
          storage_path?: string | null
          student_id?: string | null
          subject_id?: string | null
          title: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          is_shared?: boolean
          mime_type?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          size_bytes?: number | null
          storage_path?: string | null
          student_id?: string | null
          subject_id?: string | null
          title?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_resources_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          booking_id: string
          covered: string | null
          created_at: string
          id: string
          improvements: string | null
          next_steps: string | null
          tutor_id: string
          understanding: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          covered?: string | null
          created_at?: string
          id?: string
          improvements?: string | null
          next_steps?: string | null
          tutor_id: string
          understanding?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          covered?: string | null
          created_at?: string
          id?: string
          improvements?: string | null
          next_steps?: string | null
          tutor_id?: string
          understanding?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          reference: string | null
          requested_at: string
          settled_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          tutor_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          notes?: string | null
          reference?: string | null
          requested_at?: string
          settled_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          tutor_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          reference?: string | null
          requested_at?: string
          settled_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "payouts_tutor_id_fkey"
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
      rating_categories: {
        Row: {
          applies_to: Database["public"]["Enums"]["app_role"]
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
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
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      rating_category_scores: {
        Row: {
          category_id: string
          created_at: string
          id: string
          rating_id: string
          score: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          rating_id: string
          score: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          rating_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "rating_category_scores_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rating_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_category_scores_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
        ]
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
      tutor_documents: {
        Row: {
          created_at: string
          id: string
          label: string
          mime_type: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["verification_status"]
          step_id: string | null
          storage_path: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          mime_type?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["verification_status"]
          step_id?: string | null
          storage_path: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          mime_type?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["verification_status"]
          step_id?: string | null
          storage_path?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_documents_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "verification_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_documents_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
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
          education: Json
          headline: string | null
          hourly_rate: number | null
          id: string
          intro_video_url: string | null
          is_listed: boolean
          languages: Json
          methodology: string | null
          onboarding_step: number
          profile_id: string
          qualifications: Json
          submitted_at: string | null
          teaching_context: string | null
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
          education?: Json
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          intro_video_url?: string | null
          is_listed?: boolean
          languages?: Json
          methodology?: string | null
          onboarding_step?: number
          profile_id: string
          qualifications?: Json
          submitted_at?: string | null
          teaching_context?: string | null
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
          education?: Json
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          intro_video_url?: string | null
          is_listed?: boolean
          languages?: Json
          methodology?: string | null
          onboarding_step?: number
          profile_id?: string
          qualifications?: Json
          submitted_at?: string | null
          teaching_context?: string | null
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
      booking_quote: {
        Args: { p_duration_minutes: number; p_tutor_id: string }
        Returns: {
          cancellation_policy_id: string
          commission_amount: number
          commission_rule_id: string
          currency: string
          duration_minutes: number
          hourly_rate: number
          lesson_amount: number
          platform_fee: number
          processing_fee: number
          total_amount: number
        }[]
      }
      can_access_booking: { Args: { _booking_id: string }; Returns: boolean }
      can_access_student: { Args: { _student_id: string }; Returns: boolean }
      current_tutor_id: { Args: never; Returns: string }
      ensure_tutor_record: { Args: never; Returns: string }
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
      in_conversation: { Args: { _conversation_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      my_conversations: {
        Args: never
        Returns: {
          id: string
          last_message: string
          last_message_at: string
          last_sender_name: string
          student_first_name: string
          student_id: string
          subject: string
          unread_count: number
        }[]
      }
      notify_user: {
        Args: {
          _link: string
          _trigger_key: string
          _user_id: string
          _vars: Json
        }
        Returns: undefined
      }
      owns_tutor: { Args: { _tutor_id: string }; Returns: boolean }
      parent_child_progress: {
        Args: { p_student_id: string }
        Returns: {
          attended_count: number
          avg_rating: number
          cancelled_count: number
          completed_lessons: number
          learning_minutes: number
          missed_count: number
          scheduled_lessons: number
          subject_id: string
          subject_name: string
        }[]
      }
      parent_dashboard_summary: {
        Args: never
        Returns: {
          active_students: number
          active_tutors: number
          attendance_rate: number
          completed_lessons: number
          learning_minutes: number
          month_spend: number
          month_spend_currency: string
          outstanding_amount: number
          outstanding_count: number
          outstanding_currency: string
          pending_approvals: number
          upcoming_classes: number
        }[]
      }
      public_country_facets: {
        Args: never
        Returns: {
          country_code: string
          tutor_count: number
        }[]
      }
      public_curriculum_facets: {
        Args: never
        Returns: {
          code: string
          country_code: string
          description: string
          id: string
          name: string
          tutor_count: number
        }[]
      }
      public_search_suggestions: {
        Args: { p_limit?: number; p_q: string }
        Returns: {
          id: string
          kind: string
          label: string
          sublabel: string
        }[]
      }
      public_subject_facets: {
        Args: never
        Returns: {
          category: string
          icon: string
          id: string
          name: string
          slug: string
          tutor_count: number
        }[]
      }
      public_tutor_cards: {
        Args: { p_ids: string[] }
        Returns: {
          avatar_url: string
          country_code: string
          currency: string
          full_name: string
          headline: string
          hourly_rate: number
          id: string
          lessons_completed: number
          rating_avg: number
          rating_count: number
          subjects: string[]
          timezone: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number
        }[]
      }
      public_tutor_detail: {
        Args: { p_tutor_id: string }
        Returns: {
          agency_name: string
          avatar_url: string
          biography: string
          country_code: string
          currency: string
          full_name: string
          headline: string
          hourly_rate: number
          id: string
          intro_video_url: string
          languages: Json
          qualifications: Json
          rating_avg: number
          rating_count: number
          subjects: string[]
          timezone: string
          years_experience: number
        }[]
      }
      public_tutor_reviews: {
        Args: { p_limit?: number; p_tutor_id: string }
        Returns: {
          comment: string
          created_at: string
          id: string
          reviewer_name: string
          score: number
        }[]
      }
      public_tutor_search: {
        Args: {
          p_country?: string
          p_curriculum?: string
          p_language?: string
          p_level?: string
          p_limit?: number
          p_max_price?: number
          p_min_rating?: number
          p_offset?: number
          p_q?: string
          p_sort?: string
          p_subject?: string
        }
        Returns: {
          availability_timezone: string
          available_days: number[]
          avatar_url: string
          country_code: string
          created_at: string
          currency: string
          curricula: string[]
          full_name: string
          headline: string
          hourly_rate: number
          id: string
          languages: Json
          lessons_completed: number
          levels: string[]
          rating_avg: number
          rating_count: number
          subjects: string[]
          total_count: number
          years_experience: number
        }[]
      }
      render_template: { Args: { _body: string; _vars: Json }; Returns: string }
      tutor_available_slots: {
        Args: {
          p_days?: number
          p_duration_minutes?: number
          p_from?: string
          p_tutor_id: string
        }
        Returns: {
          ends_at: string
          starts_at: string
          tutor_timezone: string
        }[]
      }
      tutor_bookings: {
        Args: {
          p_from?: string
          p_limit?: number
          p_offset?: number
          p_statuses?: Database["public"]["Enums"]["booking_status"][]
          p_to?: string
        }
        Returns: {
          booking_timezone: string
          cancellation_reason: string
          cancelled_at: string
          currency: string
          duration_minutes: number
          education_level_name: string
          ends_at: string
          has_notes: boolean
          hourly_rate: number
          id: string
          payment_amount: number
          payment_currency: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          session_id: string
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_avatar_url: string
          student_first_name: string
          student_id: string
          student_notes: string
          subject_id: string
          subject_name: string
          total_amount: number
          tutor_accepted_at: string
        }[]
      }
      tutor_dashboard_summary: {
        Args: never
        Returns: {
          active_students: number
          classes_today: number
          completed_lessons: number
          currency: string
          hourly_rate: number
          is_listed: boolean
          onboarding_step: number
          pending_requests: number
          profile_complete: boolean
          tutor_timezone: string
          upcoming_classes: number
          verification_status: Database["public"]["Enums"]["verification_status"]
        }[]
      }
      tutor_earnings_records: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          booking_id: string
          commission_amount: number
          currency: string
          exchange_rate: number
          gross_amount: number
          net_amount: number
          occurred_at: string
          payment_id: string
          platform_fee: number
          settlement_currency: string
          status: Database["public"]["Enums"]["payment_status"]
          student_first_name: string
          subject_name: string
        }[]
      }
      tutor_earnings_summary: {
        Args: never
        Returns: {
          available_balance: number
          currency: string
          gross_revenue: number
          minimum_payout: number
          net_earnings: number
          next_payout_date: string
          paid_out: number
          payment_fees: number
          pending_earnings: number
          pending_payouts: number
          platform_commission: number
          schedule_label: string
        }[]
      }
      tutor_end_class: {
        Args: { p_booking_id: string; p_student_attended?: boolean }
        Returns: undefined
      }
      tutor_open_class: {
        Args: { p_booking_id: string }
        Returns: {
          duration_minutes: number
          ended_at: string
          ends_at: string
          meeting_provider: string
          meeting_url: string
          session_id: string
          started_at: string
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_first_name: string
          subject_name: string
        }[]
      }
      tutor_rating_categories: {
        Args: never
        Returns: {
          average_score: number
          category_id: string
          name: string
          response_count: number
        }[]
      }
      tutor_rating_summary: {
        Args: never
        Returns: {
          five_star: number
          four_star: number
          one_star: number
          rating_avg: number
          rating_count: number
          three_star: number
          two_star: number
        }[]
      }
      tutor_request_payout: { Args: { p_amount: number }; Returns: string }
      tutor_respond_booking: {
        Args: { p_accept: boolean; p_booking_id: string }
        Returns: Database["public"]["Enums"]["booking_status"]
      }
      tutor_reviews: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          comment: string
          created_at: string
          id: string
          reviewer_name: string
          score: number
          student_first_name: string
          subject_name: string
        }[]
      }
      tutor_start_class: { Args: { p_booking_id: string }; Returns: undefined }
      tutor_start_conversation: {
        Args: { p_student_id: string; p_subject?: string }
        Returns: string
      }
      tutor_students: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          avatar_url: string
          curriculum_name: string
          education_level_name: string
          first_name: string
          last_class_at: string
          lessons_completed: number
          lessons_upcoming: number
          next_class_at: string
          student_id: string
          student_timezone: string
          subjects: string[]
        }[]
      }
      tutor_submit_verification: {
        Args: never
        Returns: Database["public"]["Enums"]["verification_status"]
      }
    }
    Enums: {
      app_role: "student" | "parent" | "tutor" | "agency" | "admin"
      assignment_status: "draft" | "assigned" | "submitted" | "reviewed"
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
      payout_status:
        | "requested"
        | "processing"
        | "paid"
        | "rejected"
        | "cancelled"
      resource_type: "pdf" | "video" | "link" | "document" | "image" | "other"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      assignment_status: ["draft", "assigned", "submitted", "reviewed"],
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
      payout_status: [
        "requested",
        "processing",
        "paid",
        "rejected",
        "cancelled",
      ],
      resource_type: ["pdf", "video", "link", "document", "image", "other"],
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
