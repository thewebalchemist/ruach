// =============================================
// RUACHSTREAM TYPES - v3.0
// =============================================

// =============================================
// SERIES & SERMONS
// =============================================

export interface Series {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  sermon_count?: number;
  latest_sermon_date?: string;
}

export interface Sermon {
  id: string;
  slug: string;
  title: string;
  preacher: string;
  youtube_url: string;
  description: string;
  service_date: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields
  series_id?: string | null;
  duration_seconds?: number | null;
  scripture_ref?: string | null;
  view_count?: number;
  tags?: string[];
  // Joined relationships
  series?: Series | null;
}

// =============================================
// USER & AUTHENTICATION
// =============================================

export interface User {
  id: string;
  email: string;
  name: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// =============================================
// WATCHLIST & HISTORY
// =============================================

export interface WatchlistItem {
  id: number;
  user_id: string;
  sermon_id: number;
  added_at: string;
  sermon?: Sermon;
}

export interface WatchHistoryItem {
  id: number;
  user_id: string;
  sermon_id: number;
  progress: number;
  last_watched: string;
  sermon?: Sermon;
}

// =============================================
// STREAMING
// =============================================

export interface StreamLink {
  url: string;
  isLive: boolean;
  updatedAt: string;
  defaultYoutubeUrl?: string;
}

export interface StreamSettings {
  id: number;
  live_url: string;
  default_youtube_url: string;
  is_live: boolean;
  updated_at: string;
}

// =============================================
// SERVICES & SCHEDULE
// =============================================

export interface Service {
  id: number | string;
  title: string;
  date: string;
  time: string;
  description: string;
  isRecurring?: boolean;
}

export interface ServiceSchedule {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  created_at: string;
}

// =============================================
// PRAYER REQUESTS
// =============================================

export interface PrayerRequest {
  id: number;
  name: string;
  phone: string;
  message: string;
  created_at: string;
  status?: 'pending' | 'contacted' | 'completed';
}

// =============================================
// NOTES & UI
// =============================================

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export type TabType = 'services' | 'schedule' | 'notes' | 'bible';

// =============================================
// ASK RUACH CHATBOT TYPES
// =============================================

export interface ChurchInfo {
  id: number;
  name: string;
  tagline?: string | null;
  about_text?: string | null;
  
  // Location
  address?: string | null;
  city?: string | null;
  country?: string | null;
  directions?: string | null;
  google_maps_url?: string | null;
  
  // Contact
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  
  // Service Times (JSON array)
  service_times?: ServiceTime[] | null;
  
  // Social Media
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
  
  created_at?: string;
  updated_at?: string;
}

export interface ServiceTime {
  day: string;
  time: string;
  name: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  category: EventCategory;
  repeat_weekly: boolean;
  chatbot_enabled: boolean;
  chatbot_announcement: boolean;
  created_at?: string;
  updated_at?: string;
}

export type EventCategory = 
  | 'service' 
  | 'youth' 
  | 'community' 
  | 'prayer' 
  | 'outreach' 
  | 'music' 
  | 'general';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type FAQCategory = 
  | 'general' 
  | 'services' 
  | 'giving' 
  | 'youth' 
  | 'membership' 
  | 'prayer' 
  | 'community';

export interface ChatSession {
  id: string;
  user_id?: string | null;
  title: string;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id?: string | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRateLimit {
  id: number;
  ip_address: string;
  session_id?: string | null;
  message_count: number;
  window_start: string;
}

// =============================================
// CHATBOT API TYPES
// =============================================

export interface ChatRequest {
  message: string;
  session_id?: string;
  conversation_history?: ChatMessage[];
  user_id?: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  sources?: ChatSource[];
  suggested_questions?: string[];
  rate_limit?: {
    remaining: number;
    reset_at: string;
  };
}

export interface ChatSource {
  type: 'sermon' | 'event' | 'faq' | 'church_info';
  title: string;
  url?: string;
}

export interface KnowledgeBase {
  church_info: ChurchInfo | null;
  events: Event[];
  faqs: FAQ[];
  sermons: SermonSummary[];
  last_updated: string;
}

export interface SermonSummary {
  id: number;
  slug: string;
  title: string;
  preacher: string;
  service_date: string;
  description?: string | null;
  scripture_ref?: string | null;
  tags?: string[] | null;
}

// =============================================
// ADMIN DASHBOARD TYPES
// =============================================

export interface AdminStats {
  total_sermons: number;
  total_series: number;
  total_events: number;
  total_faqs: number;
  total_users: number;
  total_chat_sessions: number;
  recent_chats: number;
}

export type AdminTabId = 
  | 'dashboard' 
  | 'sermons' 
  | 'series' 
  | 'events' 
  | 'faqs'
  | 'church-info'
  | 'stream'
  | 'members';

export interface AdminTab {
  id: AdminTabId;
  label: string;
  icon: string;
}