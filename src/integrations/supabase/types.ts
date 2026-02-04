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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
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
          amenities: string[] | null
          created_at: string
          description: string | null
          hostel_type: string
          id: string
          images: string[] | null
          location: string
          phone_number: string | null
          price: number
          price_period: string | null
          status: string | null
          title: string
          university_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          hostel_type: string
          id?: string
          images?: string[] | null
          location: string
          phone_number?: string | null
          price: number
          price_period?: string | null
          status?: string | null
          title: string
          university_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          hostel_type?: string
          id?: string
          images?: string[] | null
          location?: string
          phone_number?: string | null
          price?: number
          price_period?: string | null
          status?: string | null
          title?: string
          university_id?: string | null
          updated_at?: string
          user_id?: string
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
          category: string
          condition: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_urgent: boolean | null
          location: string | null
          price: number
          status: string | null
          title: string
          university_id: string | null
          updated_at: string
          urgent_payment_status: string | null
          user_id: string
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          location?: string | null
          price: number
          status?: string | null
          title: string
          university_id?: string | null
          updated_at?: string
          urgent_payment_status?: string | null
          user_id: string
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          location?: string | null
          price?: number
          status?: string | null
          title?: string
          university_id?: string | null
          updated_at?: string
          urgent_payment_status?: string | null
          user_id?: string
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
          reputation_score: number | null
          show_department: boolean | null
          show_level: boolean | null
          university_change_count: number | null
          university_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
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
          reputation_score?: number | null
          show_department?: boolean | null
          show_level?: boolean | null
          university_change_count?: number | null
          university_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
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
          reputation_score?: number | null
          show_department?: boolean | null
          show_level?: boolean | null
          university_change_count?: number | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
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
        }
        Insert: {
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
        }
        Update: {
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
      universities: {
        Row: {
          created_at: string
          email_domain: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_domain?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_domain?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
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
    }
    Enums: {
      app_role: "student" | "moderator" | "university_admin" | "super_admin"
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
      app_role: ["student", "moderator", "university_admin", "super_admin"],
    },
  },
} as const
