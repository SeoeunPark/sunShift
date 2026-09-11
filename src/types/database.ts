export type ShiftCode = "A" | "B" | "C" | "OFF";
export type WorkShiftCode = "A" | "B" | "C";
export type SleepShiftCode = "A" | "B" | "C";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          leave_total: number;
          night_care_leave_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          leave_total?: number;
          night_care_leave_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          leave_total?: number;
          night_care_leave_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shift_settings: {
        Row: {
          id: string;
          user_id: string;
          group_number: number;
          base_date: string;
          base_shift: WorkShiftCode;
          pattern_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_number?: number;
          base_date: string;
          base_shift: WorkShiftCode;
          pattern_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_number?: number;
          base_date?: string;
          base_shift?: WorkShiftCode;
          pattern_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shift_definitions: {
        Row: {
          id: string;
          shift_settings_id: string;
          code: ShiftCode;
          name: string;
          label: string;
          start_time: string | null;
          end_time: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shift_settings_id: string;
          code: ShiftCode;
          name: string;
          label: string;
          start_time?: string | null;
          end_time?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shift_settings_id?: string;
          code?: ShiftCode;
          name?: string;
          label?: string;
          start_time?: string | null;
          end_time?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leave_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: string;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type?: string;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          type?: string;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          today_enabled: boolean;
          today_time: string;
          tomorrow_enabled: boolean;
          tomorrow_time: string;
          before_shift_enabled: boolean;
          before_shift_minutes: number;
          off_day_enabled: boolean;
          leave_enabled: boolean;
          sleep_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          today_enabled?: boolean;
          today_time?: string;
          tomorrow_enabled?: boolean;
          tomorrow_time?: string;
          before_shift_enabled?: boolean;
          before_shift_minutes?: number;
          off_day_enabled?: boolean;
          leave_enabled?: boolean;
          sleep_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          today_enabled?: boolean;
          today_time?: string;
          tomorrow_enabled?: boolean;
          tomorrow_time?: string;
          before_shift_enabled?: boolean;
          before_shift_minutes?: number;
          off_day_enabled?: boolean;
          leave_enabled?: boolean;
          sleep_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sleep_settings: {
        Row: {
          id: string;
          user_id: string;
          shift_code: SleepShiftCode;
          enabled: boolean;
          notification_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shift_code: SleepShiftCode;
          enabled?: boolean;
          notification_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          shift_code?: SleepShiftCode;
          enabled?: boolean;
          notification_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_dispatches: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          reference_date: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          reference_date: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string;
          reference_date?: string;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;
export type ShiftSettingsRow = Tables<"shift_settings">;
export type ShiftDefinitionRow = Tables<"shift_definitions">;
export type LeaveRecord = Tables<"leave_records">;
export type MemoRecord = Tables<"memo_records">;
export type NotificationSettings = Tables<"notification_settings">;
export type SleepSettings = Tables<"sleep_settings">;
export type PushSubscription = Tables<"push_subscriptions">;
export type NotificationDispatch = Tables<"notification_dispatches">;
