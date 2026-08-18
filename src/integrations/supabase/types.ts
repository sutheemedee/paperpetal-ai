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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_provider_settings: {
        Row: {
          api_key: string
          base_url: string | null
          capability: string
          chat_model: string
          created_at: string
          enabled: boolean
          id: string
          image_model: string | null
          label: string
          priority: number
          provider: string
          updated_at: string
        }
        Insert: {
          api_key: string
          base_url?: string | null
          capability?: string
          chat_model: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_model?: string | null
          label?: string
          priority?: number
          provider: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          base_url?: string | null
          capability?: string
          chat_model?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_model?: string | null
          label?: string
          priority?: number
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: string
          props: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          props?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          props?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      bonus_credits: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          metric: string
          reason: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          metric: string
          reason?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          metric?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      export_records: {
        Row: {
          created_at: string
          format: string
          id: string
          project_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format: string
          id?: string
          project_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          project_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_thb: number
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          plan_code: string | null
          provider: string | null
          provider_reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_thb?: number
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          plan_code?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_thb?: number
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          plan_code?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          badge: string | null
          code: string
          created_at: string
          entitlements: Json
          is_active: boolean
          name: string
          price_thb: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          code: string
          created_at?: string
          entitlements?: Json
          is_active?: boolean
          name: string
          price_thb?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          code?: string
          created_at?: string
          entitlements?: Json
          is_active?: boolean
          name?: string
          price_thb?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded: boolean
          onboarding_goal: string | null
          suspended: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded?: boolean
          onboarding_goal?: string | null
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          onboarding_goal?: string | null
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          archived: boolean
          cover_url: string | null
          created_at: string
          data: Json
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          cover_url?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          cover_url?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promos: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          id: string
          kind: string
          max_redemptions: number | null
          metric: string | null
          plan_scope: string | null
          redemptions: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          kind: string
          max_redemptions?: number | null
          metric?: string | null
          plan_scope?: string | null
          redemptions?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          max_redemptions?: number | null
          metric?: string | null
          plan_scope?: string | null
          redemptions?: number
          value?: number
        }
        Relationships: []
      }
      quota_notifications: {
        Row: {
          created_at: string
          email_status: string
          id: string
          level: string
          limit_value: number
          metric: string
          period_start: string
          plan_code: string | null
          used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          email_status?: string
          id?: string
          level: string
          limit_value?: number
          metric: string
          period_start: string
          plan_code?: string | null
          used?: number
          user_id: string
        }
        Update: {
          created_at?: string
          email_status?: string
          id?: string
          level?: string
          limit_value?: number
          metric?: string
          period_start?: string
          plan_code?: string | null
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          category: string | null
          created_at: string
          enabled: boolean
          folder: string | null
          id: string
          knowledge: Json
          project_id: string | null
          raw_text: string | null
          role: string | null
          source_type: string
          tags: string[]
          title: string
          url: string | null
          user_id: string
          warnings: Json
        }
        Insert: {
          category?: string | null
          created_at?: string
          enabled?: boolean
          folder?: string | null
          id?: string
          knowledge?: Json
          project_id?: string | null
          raw_text?: string | null
          role?: string | null
          source_type: string
          tags?: string[]
          title?: string
          url?: string | null
          user_id: string
          warnings?: Json
        }
        Update: {
          category?: string | null
          created_at?: string
          enabled?: boolean
          folder?: string | null
          id?: string
          knowledge?: Json
          project_id?: string | null
          raw_text?: string | null
          role?: string | null
          source_type?: string
          tags?: string[]
          title?: string
          url?: string | null
          user_id?: string
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_code: string
          provider: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_code?: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_code?: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      usage_counters: {
        Row: {
          id: string
          metric: string
          period_start: string
          updated_at: string
          used: number
          user_id: string
        }
        Insert: {
          id?: string
          metric: string
          period_start: string
          updated_at?: string
          used?: number
          user_id: string
        }
        Update: {
          id?: string
          metric?: string
          period_start?: string
          updated_at?: string
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      usage_ledger: {
        Row: {
          cost_estimate: number | null
          created_at: string
          id: string
          metadata: Json
          metric: string | null
          model: string | null
          operation: string
          plan_code: string | null
          project_id: string | null
          quantity: number
          status: string
          user_id: string
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string
          id?: string
          metadata?: Json
          metric?: string | null
          model?: string | null
          operation: string
          plan_code?: string | null
          project_id?: string | null
          quantity?: number
          status?: string
          user_id: string
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string
          id?: string
          metadata?: Json
          metric?: string | null
          model?: string | null
          operation?: string
          plan_code?: string | null
          project_id?: string | null
          quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
