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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ad_events: {
        Row: {
          ad_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          points_awarded: number
          user_id: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          points_awarded?: number
          user_id?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          points_awarded?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_events_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reference_id: string | null
          request_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reference_id?: string | null
          request_type: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reference_id?: string | null
          request_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          ab_variant: string
          clicks_count: number
          conversions_count: number
          created_at: string
          creative_url: string | null
          cta_text: string
          cta_url: string
          description: string
          ends_at: string | null
          geo_region: string | null
          id: string
          impressions_count: number
          owner_id: string
          payment_status: string
          placement_type: string
          predicted_score: number
          reward_points: number
          sponsor_name: string
          starts_at: string
          status: string
          target_departments: string[]
          target_interests: string[]
          target_university_id: string | null
          tier_price: number
          title: string
          updated_at: string
        }
        Insert: {
          ab_variant?: string
          clicks_count?: number
          conversions_count?: number
          created_at?: string
          creative_url?: string | null
          cta_text?: string
          cta_url: string
          description: string
          ends_at?: string | null
          geo_region?: string | null
          id?: string
          impressions_count?: number
          owner_id: string
          payment_status?: string
          placement_type: string
          predicted_score?: number
          reward_points?: number
          sponsor_name: string
          starts_at?: string
          status?: string
          target_departments?: string[]
          target_interests?: string[]
          target_university_id?: string | null
          tier_price?: number
          title: string
          updated_at?: string
        }
        Update: {
          ab_variant?: string
          clicks_count?: number
          conversions_count?: number
          created_at?: string
          creative_url?: string | null
          cta_text?: string
          cta_url?: string
          description?: string
          ends_at?: string | null
          geo_region?: string | null
          id?: string
          impressions_count?: number
          owner_id?: string
          payment_status?: string
          placement_type?: string
          predicted_score?: number
          reward_points?: number
          sponsor_name?: string
          starts_at?: string
          status?: string
          target_departments?: string[]
          target_interests?: string[]
          target_university_id?: string | null
          tier_price?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_target_university_id_fkey"
            columns: ["target_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_verification_requests: {
        Row: {
          admin_notes: string | null
          business_name: string | null
          created_at: string
          fee_amount: number
          id: string
          identity_document_url: string | null
          legal_name: string
          payment_id: string | null
          phone_number: string
          status: string
          university_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_name?: string | null
          created_at?: string
          fee_amount?: number
          id?: string
          identity_document_url?: string | null
          legal_name: string
          payment_id?: string | null
          phone_number: string
          status?: string
          university_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_name?: string | null
          created_at?: string
          fee_amount?: number
          id?: string
          identity_document_url?: string | null
          legal_name?: string
          payment_id?: string | null
          phone_number?: string
          status?: string
          university_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_verification_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_verification_requests_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_comments: {
        Row: {
          anonymous_name: string
          content: string
          created_at: string
          id: string
          likes_count: number
          post_id: string
          user_id: string
        }
        Insert: {
          anonymous_name: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id: string
          user_id: string
        }
        Update: {
          anonymous_name?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "anonymous_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_names: {
        Row: {
          anonymous_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          anonymous_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          anonymous_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      anonymous_posts: {
        Row: {
          anonymous_name: string
          category: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          university_id: string | null
          user_id: string
        }
        Insert: {
          anonymous_name: string
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          university_id?: string | null
          user_id: string
        }
        Update: {
          anonymous_name?: string
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          university_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_posts_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "anonymous_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          course_code: string
          course_title: string
          created_at: string
          created_by: string
          department: string | null
          exam_date: string
          id: string
          level: string | null
          university_id: string | null
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string
          created_by: string
          department?: string | null
          exam_date: string
          id?: string
          level?: string | null
          university_id?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string
          created_by?: string
          department?: string | null
          exam_date?: string
          id?: string
          level?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      hostel_listings: {
        Row: {
          admin_review_notes: string | null
          amenities: string[] | null
          created_at: string
          description: string | null
          escrow_status: string
          hostel_type: string
          id: string
          images: string[] | null
          is_verified: boolean
          location: string
          phone_number: string | null
          price: number
          price_period: string | null
          status: string | null
          student_service_fee_amount: number
          student_service_fee_rate: number
          title: string
          total_student_price: number | null
          university_id: string | null
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          admin_review_notes?: string | null
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          escrow_status?: string
          hostel_type: string
          id?: string
          images?: string[] | null
          is_verified?: boolean
          location: string
          phone_number?: string | null
          price: number
          price_period?: string | null
          status?: string | null
          student_service_fee_amount?: number
          student_service_fee_rate?: number
          title: string
          total_student_price?: number | null
          university_id?: string | null
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          admin_review_notes?: string | null
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          escrow_status?: string
          hostel_type?: string
          id?: string
          images?: string[] | null
          is_verified?: boolean
          location?: string
          phone_number?: string | null
          price?: number
          price_period?: string | null
          status?: string | null
          student_service_fee_amount?: number
          student_service_fee_rate?: number
          title?: string
          total_student_price?: number | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "hostel_listings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          admin_review_notes: string | null
          category: string
          commission_rate: number
          condition: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_urgent: boolean | null
          listing_plan: string
          location: string | null
          payment_status: string
          platform_fee_amount: number
          price: number
          seller_phone: string | null
          status: string | null
          target_scope: string
          title: string
          university_id: string | null
          updated_at: string
          urgent_payment_status: string | null
          user_id: string
          views_count: number
        }
        Insert: {
          admin_review_notes?: string | null
          category: string
          commission_rate?: number
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          listing_plan?: string
          location?: string | null
          payment_status?: string
          platform_fee_amount?: number
          price: number
          seller_phone?: string | null
          status?: string | null
          target_scope?: string
          title: string
          university_id?: string | null
          updated_at?: string
          urgent_payment_status?: string | null
          user_id: string
          views_count?: number
        }
        Update: {
          admin_review_notes?: string | null
          category?: string
          commission_rate?: number
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          listing_plan?: string
          location?: string | null
          payment_status?: string
          platform_fee_amount?: number
          price?: number
          seller_phone?: string | null
          status?: string | null
          target_scope?: string
          title?: string
          university_id?: string | null
          updated_at?: string
          urgent_payment_status?: string | null
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          reference_id: string | null
          reference_type: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
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
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_important: boolean | null
          is_read: boolean | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json
          provider: string
          provider_payment_id: string | null
          purpose: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          provider: string
          provider_payment_id?: string | null
          purpose: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          provider?: string
          provider_payment_id?: string | null
          purpose?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      popularity_events: {
        Row: {
          created_at: string
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          images: string[] | null
          likes_count: number | null
          link_url: string | null
          location: string | null
          post_type: string | null
          university_id: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          images?: string[] | null
          likes_count?: number | null
          link_url?: string | null
          location?: string | null
          post_type?: string | null
          university_id?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          images?: string[] | null
          likes_count?: number | null
          link_url?: string | null
          location?: string | null
          post_type?: string | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          agent_daily_post_limit: number
          agent_monthly_post_limit: number
          agent_paid_at: string | null
          agent_verification_status: string
          allow_anonymous_dms: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_time_spent: number | null
          department: string | null
          display_name: string
          experience_points: number | null
          id: string
          last_active_at: string | null
          level: string | null
          matric_number: string | null
          paypal_customer_id: string | null
          popularity_points: number
          reputation_score: number | null
          show_department: boolean | null
          show_level: boolean | null
          stripe_customer_id: string | null
          student_id_number: string | null
          student_verification_status: string
          sub_admin_expires_at: string | null
          university_change_count: number | null
          university_id: string | null
          updated_at: string
          user_id: string
          verification_document_url: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_badge: boolean
        }
        Insert: {
          account_status?: string | null
          agent_daily_post_limit?: number
          agent_monthly_post_limit?: number
          agent_paid_at?: string | null
          agent_verification_status?: string
          allow_anonymous_dms?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_time_spent?: number | null
          department?: string | null
          display_name: string
          experience_points?: number | null
          id?: string
          last_active_at?: string | null
          level?: string | null
          matric_number?: string | null
          paypal_customer_id?: string | null
          popularity_points?: number
          reputation_score?: number | null
          show_department?: boolean | null
          show_level?: boolean | null
          stripe_customer_id?: string | null
          student_id_number?: string | null
          student_verification_status?: string
          sub_admin_expires_at?: string | null
          university_change_count?: number | null
          university_id?: string | null
          updated_at?: string
          user_id: string
          verification_document_url?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_badge?: boolean
        }
        Update: {
          account_status?: string | null
          agent_daily_post_limit?: number
          agent_monthly_post_limit?: number
          agent_paid_at?: string | null
          agent_verification_status?: string
          allow_anonymous_dms?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_time_spent?: number | null
          department?: string | null
          display_name?: string
          experience_points?: number | null
          id?: string
          last_active_at?: string | null
          level?: string | null
          matric_number?: string | null
          paypal_customer_id?: string | null
          popularity_points?: number
          reputation_score?: number | null
          show_department?: boolean | null
          show_level?: boolean | null
          stripe_customer_id?: string | null
          student_id_number?: string | null
          student_verification_status?: string
          sub_admin_expires_at?: string | null
          university_change_count?: number | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
          verification_document_url?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_badge?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      roommate_requests: {
        Row: {
          admin_review_notes: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          description: string | null
          id: string
          preferences: string | null
          preferred_location: string | null
          status: string | null
          title: string
          university_id: string | null
          updated_at: string
          user_id: string
          verification_required: boolean
        }
        Insert: {
          admin_review_notes?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          description?: string | null
          id?: string
          preferences?: string | null
          preferred_location?: string | null
          status?: string | null
          title: string
          university_id?: string | null
          updated_at?: string
          user_id: string
          verification_required?: boolean
        }
        Update: {
          admin_review_notes?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          description?: string | null
          id?: string
          preferences?: string | null
          preferred_location?: string | null
          status?: string | null
          title?: string
          university_id?: string | null
          updated_at?: string
          user_id?: string
          verification_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "roommate_requests_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          content_type: string
          content_url: string | null
          created_at: string
          expires_at: string
          id: string
          text_content: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          content_url?: string | null
          created_at?: string
          expires_at: string
          id?: string
          text_content?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          content_url?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          text_content?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_url: string | null
          id: string
          matric_number: string | null
          status: string
          student_id_number: string | null
          university_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          matric_number?: string | null
          status?: string
          student_id_number?: string | null
          university_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          matric_number?: string | null
          status?: string
          student_id_number?: string | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_verification_requests_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          accent_color: string
          campus_motto: string | null
          city: string | null
          community_prompt: string | null
          created_at: string
          email_domain: string | null
          id: string
          institution_type: string
          location: string | null
          logo_url: string | null
          name: string
          ownership: string | null
          region: string | null
          slug: string
          source_label: string | null
          state: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          accent_color?: string
          campus_motto?: string | null
          city?: string | null
          community_prompt?: string | null
          created_at?: string
          email_domain?: string | null
          id?: string
          institution_type?: string
          location?: string | null
          logo_url?: string | null
          name: string
          ownership?: string | null
          region?: string | null
          slug: string
          source_label?: string | null
          state?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          accent_color?: string
          campus_motto?: string | null
          city?: string | null
          community_prompt?: string | null
          created_at?: string
          email_domain?: string | null
          id?: string
          institution_type?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          ownership?: string | null
          region?: string | null
          slug?: string
          source_label?: string | null
          state?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_exams: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exams_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          provider: string
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          provider: string
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          provider?: string
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_admin_credentials: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "student"
        | "moderator"
        | "university_admin"
        | "super_admin"
        | "sub_admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "student",
        "moderator",
        "university_admin",
        "super_admin",
        "sub_admin",
      ],
    },
  },
} as const
