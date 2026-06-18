import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env.local');
}

// Untyped client: supports both streaming tables (sermons, series, stream_settings…)
// and connect tables (profiles, cohorts…) without requiring a unified Database type.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Profile = {
  id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor' | 'media';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  avatar_url: string | null;
  gender: 'male' | 'female' | null;
  date_of_birth: string | null;
  address: string | null;
  occupation: string | null;
  marital_status: 'single' | 'married' | 'widowed' | 'divorced' | null;
  branch: string;
  crosspoint_zone: 'south' | 'east' | 'north' | 'west' | null;
  joined_ruach_date: string | null;
  is_in_crosspoint: boolean;
  member_id: string | null;
  member_since: string | null;
  connect_cohort_id: string | null;
  connect_graduated_at: string | null;
  is_legacy_member: boolean;
  created_at: string;
  updated_at: string;
};

export type {
  Series,
  Sermon,
  User,
  WatchlistItem,
  WatchHistoryItem,
  ServiceSchedule,
  PrayerRequest,
  StreamSettings,
} from '@/types';
