import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  medical_conditions?: string[];
  allergies?: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type PrakritiQuestion = {
  id: string;
  category: string;
  question: string;
  vata_option: string;
  pitta_option: string;
  kapha_option: string;
  display_order: number;
};

export type PrakritiAssessment = {
  id: string;
  user_id: string;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  dominant_dosha: string;
  assessment_data: Record<string, string>;
  assessed_at: string;
};

export type DietRecommendation = {
  id: string;
  dosha_type: string;
  meal_type: string;
  food_items: string[];
  foods_to_avoid: string[];
  portion_guidelines?: string;
  timing?: string;
};

export type UserDietPlan = {
  id: string;
  user_id: string;
  dosha_type: string;
  meal_plan: Record<string, any>;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type DailyScheduleTemplate = {
  id: string;
  dosha_type: string;
  time_of_day: string;
  activity: string;
  duration_minutes?: number;
  description?: string;
  benefits?: string;
  display_order: number;
};

export type UserSchedule = {
  id: string;
  user_id: string;
  schedule_data: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type FollowUp = {
  id: string;
  user_id: string;
  follow_up_type: string;
  title: string;
  description?: string;
  scheduled_date: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
};

export type ProgressTracking = {
  id: string;
  user_id: string;
  tracking_date: string;
  weight?: number;
  energy_level?: number;
  sleep_quality?: number;
  stress_level?: number;
  notes?: string;
  created_at: string;
};
