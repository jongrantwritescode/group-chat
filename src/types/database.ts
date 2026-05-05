// ============================================================
// Database types — manually written to match the Supabase schema.
// Once a live Supabase project is connected, regenerate with:
//   supabase gen types typescript --linked > src/types/database.ts
// This will eliminate all `as unknown as T` casts in the API layer
// and provide auto-updated types as the schema evolves.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TripRole = 'owner' | 'admin' | 'member';
export type RsvpStatus = 'pending' | 'going' | 'maybe' | 'declined';
export type ItineraryCategory = 'travel' | 'lodging' | 'food' | 'activity' | 'meeting' | 'other';
export type ExpenseCategory = 'lodging' | 'food' | 'transport' | 'activity' | 'shopping' | 'other';
export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          destination: string | null;
          description: string | null;
          cover_image_path: string | null;
          start_date: string | null;
          end_date: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          destination?: string | null;
          description?: string | null;
          cover_image_path?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          destination?: string | null;
          description?: string | null;
          cover_image_path?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trip_members: {
        Row: {
          trip_id: string;
          user_id: string;
          role: TripRole;
          rsvp: RsvpStatus;
          joined_at: string;
        };
        Insert: {
          trip_id: string;
          user_id: string;
          role?: TripRole;
          rsvp?: RsvpStatus;
          joined_at?: string;
        };
        Update: {
          trip_id?: string;
          user_id?: string;
          role?: TripRole;
          rsvp?: RsvpStatus;
          joined_at?: string;
        };
        Relationships: [];
      };
      trip_invites: {
        Row: {
          id: string;
          trip_id: string;
          email: string;
          role: TripRole;
          token: string;
          invited_by: string;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          email: string;
          role?: TripRole;
          token?: string;
          invited_by: string;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          email?: string;
          role?: TripRole;
          token?: string;
          invited_by?: string;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      itinerary_items: {
        Row: {
          id: string;
          trip_id: string;
          day_date: string;
          start_time: string | null;
          end_time: string | null;
          title: string;
          description: string | null;
          location: string | null;
          lat: number | null;
          lng: number | null;
          category: ItineraryCategory;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          day_date: string;
          start_time?: string | null;
          end_time?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          category?: ItineraryCategory;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          day_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          title?: string;
          description?: string | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          category?: ItineraryCategory;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string;
          paid_by: string;
          amount_cents: number;
          currency: string;
          category: ExpenseCategory;
          description: string;
          occurred_on: string;
          split_method: SplitMethod;
          receipt_path: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          paid_by: string;
          amount_cents: number;
          currency: string;
          category?: ExpenseCategory;
          description: string;
          occurred_on?: string;
          split_method?: SplitMethod;
          receipt_path?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          paid_by?: string;
          amount_cents?: number;
          currency?: string;
          category?: ExpenseCategory;
          description?: string;
          occurred_on?: string;
          split_method?: SplitMethod;
          receipt_path?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expense_shares: {
        Row: {
          expense_id: string;
          user_id: string;
          share_cents: number;
        };
        Insert: {
          expense_id: string;
          user_id: string;
          share_cents: number;
        };
        Update: {
          expense_id?: string;
          user_id?: string;
          share_cents?: number;
        };
        Relationships: [];
      };
      settlements: {
        Row: {
          id: string;
          trip_id: string;
          from_user: string;
          to_user: string;
          amount_cents: number;
          currency: string;
          note: string | null;
          settled_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          from_user: string;
          to_user: string;
          amount_cents: number;
          currency: string;
          note?: string | null;
          settled_on?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          from_user?: string;
          to_user?: string;
          amount_cents?: number;
          currency?: string;
          note?: string | null;
          settled_on?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          description: string | null;
          assignee_id: string | null;
          due_date: string | null;
          status: TaskStatus;
          completed_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          title: string;
          description?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          completed_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          title?: string;
          description?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          completed_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      trip_balances: {
        Row: {
          trip_id: string;
          user_id: string;
          net_cents: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_trip_member: {
        Args: { _trip: string };
        Returns: boolean;
      };
      trip_role_of: {
        Args: { _trip: string };
        Returns: TripRole;
      };
      accept_trip_invite: {
        Args: { _token: string };
        Returns: string;
      };
      create_expense: {
        Args: {
          _trip_id: string;
          _paid_by: string;
          _amount_cents: number;
          _currency: string;
          _category: string;
          _description: string;
          _occurred_on: string;
          _split_method: string;
          _shares: string;
        };
        Returns: string;
      };
      update_expense: {
        Args: {
          _expense_id: string;
          _amount_cents: number;
          _currency: string;
          _category: string;
          _description: string;
          _occurred_on: string;
          _split_method: string;
          _shares: string;
        };
        Returns: null;
      };
    };
    Enums: {
      trip_role: TripRole;
      rsvp_status: RsvpStatus;
      itinerary_category: ItineraryCategory;
      expense_category: ExpenseCategory;
      split_method: SplitMethod;
      task_status: TaskStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
