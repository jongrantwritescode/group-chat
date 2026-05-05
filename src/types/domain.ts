// ============================================================
// Domain types — hand-written, matching the DB schema
// ============================================================

export type TripRole = 'owner' | 'admin' | 'member';
export type RsvpStatus = 'pending' | 'going' | 'maybe' | 'declined';
export type ItineraryCategory = 'travel' | 'lodging' | 'food' | 'activity' | 'meeting' | 'other';
export type ExpenseCategory = 'lodging' | 'food' | 'transport' | 'activity' | 'shopping' | 'other';
export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
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
}

export interface TripMember {
  trip_id: string;
  user_id: string;
  role: TripRole;
  rsvp: RsvpStatus;
  joined_at: string;
  profile?: Profile;
}

export interface TripInvite {
  id: string;
  trip_id: string;
  email: string;
  role: TripRole;
  token: string;
  invited_by: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface ItineraryItem {
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
}

export interface Expense {
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
  paid_by_profile?: Profile;
  shares?: ExpenseShare[];
}

export interface ExpenseShare {
  expense_id: string;
  user_id: string;
  share_cents: number;
  profile?: Profile;
}

export interface Settlement {
  id: string;
  trip_id: string;
  from_user: string;
  to_user: string;
  amount_cents: number;
  currency: string;
  note: string | null;
  settled_on: string;
  created_at: string;
  from_profile?: Profile;
  to_profile?: Profile;
}

export interface Task {
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
  assignee?: Profile;
}

// Computed balance per user for a trip
export interface TripBalance {
  trip_id: string;
  user_id: string;
  net_cents: number;
}

// Derived: who owes whom
export interface BalanceEntry {
  fromUser: Profile;
  toUser: Profile;
  amountCents: number;
  currency: string;
}

// Trip with embedded members
export interface TripWithMembers extends Trip {
  members: TripMember[];
}

// Share input for create_expense RPC
export interface ShareInput {
  user_id: string;
  share_cents: number;
}
