/*
  # Ayurvedic Health Management System Schema

  ## Overview
  Complete database schema for an Ayurvedic health management application supporting
  user profiles, Prakriti analysis, personalized diet plans, daily schedules, and follow-ups.

  ## New Tables

  ### 1. `profiles`
  User profile information and health details
  - `id` (uuid, FK to auth.users)
  - `full_name` (text)
  - `email` (text)
  - `age` (integer)
  - `gender` (text)
  - `height` (numeric) - in cm
  - `weight` (numeric) - in kg
  - `medical_conditions` (text[]) - array of conditions
  - `allergies` (text[]) - array of allergies
  - `is_admin` (boolean) - admin flag
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `prakriti_questions`
  Standard Prakriti assessment questions
  - `id` (uuid, PK)
  - `category` (text) - physical, mental, behavioral
  - `question` (text)
  - `vata_option` (text)
  - `pitta_option` (text)
  - `kapha_option` (text)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 3. `prakriti_assessments`
  User's Prakriti assessment results
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `vata_score` (integer)
  - `pitta_score` (integer)
  - `kapha_score` (integer)
  - `dominant_dosha` (text) - Vata, Pitta, Kapha, or combination
  - `assessment_data` (jsonb) - stores all answers
  - `assessed_at` (timestamptz)

  ### 4. `diet_recommendations`
  Diet plan templates based on Prakriti
  - `id` (uuid, PK)
  - `dosha_type` (text) - Vata, Pitta, Kapha
  - `meal_type` (text) - breakfast, lunch, dinner, snack
  - `food_items` (text[])
  - `foods_to_avoid` (text[])
  - `portion_guidelines` (text)
  - `timing` (text)
  - `created_at` (timestamptz)

  ### 5. `user_diet_plans`
  Personalized diet plans for users
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `dosha_type` (text)
  - `meal_plan` (jsonb) - structured meal plan
  - `notes` (text)
  - `active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `daily_schedule_templates`
  Routine templates based on Prakriti
  - `id` (uuid, PK)
  - `dosha_type` (text)
  - `time_of_day` (text) - morning, afternoon, evening, night
  - `activity` (text)
  - `duration_minutes` (integer)
  - `description` (text)
  - `benefits` (text)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 7. `user_schedules`
  Personalized schedules for users
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `schedule_data` (jsonb) - full day schedule
  - `active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. `follow_ups`
  Follow-up tracking and reminders
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `follow_up_type` (text) - reminder, check_in, assessment
  - `title` (text)
  - `description` (text)
  - `scheduled_date` (timestamptz)
  - `completed` (boolean)
  - `completed_at` (timestamptz)
  - `notes` (text)
  - `created_by` (uuid, FK to profiles) - admin who created
  - `created_at` (timestamptz)

  ### 9. `progress_tracking`
  User progress logs
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `tracking_date` (date)
  - `weight` (numeric)
  - `energy_level` (integer) - 1-10 scale
  - `sleep_quality` (integer) - 1-10 scale
  - `stress_level` (integer) - 1-10 scale
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read/write their own data
  - Admins can read all data and manage follow-ups
  - Public can read prakriti questions and recommendations templates
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  age integer,
  gender text,
  height numeric,
  weight numeric,
  medical_conditions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prakriti_questions table
CREATE TABLE IF NOT EXISTS prakriti_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  vata_option text NOT NULL,
  pitta_option text NOT NULL,
  kapha_option text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prakriti_assessments table
CREATE TABLE IF NOT EXISTS prakriti_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vata_score integer DEFAULT 0,
  pitta_score integer DEFAULT 0,
  kapha_score integer DEFAULT 0,
  dominant_dosha text NOT NULL,
  assessment_data jsonb DEFAULT '{}'::jsonb,
  assessed_at timestamptz DEFAULT now()
);

-- Create diet_recommendations table
CREATE TABLE IF NOT EXISTS diet_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dosha_type text NOT NULL,
  meal_type text NOT NULL,
  food_items text[] DEFAULT '{}',
  foods_to_avoid text[] DEFAULT '{}',
  portion_guidelines text,
  timing text,
  created_at timestamptz DEFAULT now()
);

-- Create user_diet_plans table
CREATE TABLE IF NOT EXISTS user_diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dosha_type text NOT NULL,
  meal_plan jsonb DEFAULT '{}'::jsonb,
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_schedule_templates table
CREATE TABLE IF NOT EXISTS daily_schedule_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dosha_type text NOT NULL,
  time_of_day text NOT NULL,
  activity text NOT NULL,
  duration_minutes integer,
  description text,
  benefits text,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_schedules table
CREATE TABLE IF NOT EXISTS user_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_data jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  follow_up_type text NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create progress_tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tracking_date date NOT NULL,
  weight numeric,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Prakriti questions policies (public read)
CREATE POLICY "Anyone can view prakriti questions"
  ON prakriti_questions FOR SELECT
  TO authenticated
  USING (true);

-- Prakriti assessments policies
CREATE POLICY "Users can view own assessments"
  ON prakriti_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON prakriti_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessments"
  ON prakriti_assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Diet recommendations policies (public read)
CREATE POLICY "Anyone can view diet recommendations"
  ON diet_recommendations FOR SELECT
  TO authenticated
  USING (true);

-- User diet plans policies
CREATE POLICY "Users can view own diet plans"
  ON user_diet_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diet plans"
  ON user_diet_plans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all diet plans"
  ON user_diet_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Daily schedule templates policies (public read)
CREATE POLICY "Anyone can view schedule templates"
  ON daily_schedule_templates FOR SELECT
  TO authenticated
  USING (true);

-- User schedules policies
CREATE POLICY "Users can view own schedules"
  ON user_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own schedules"
  ON user_schedules FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all schedules"
  ON user_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Follow-ups policies
CREATE POLICY "Users can view own follow-ups"
  ON follow_ups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own follow-ups"
  ON follow_ups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all follow-ups"
  ON follow_ups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Progress tracking policies
CREATE POLICY "Users can view own progress"
  ON progress_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON progress_tracking FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON progress_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prakriti_assessments_user_id ON prakriti_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_diet_plans_user_id ON user_diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schedules_user_id ON user_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_date ON follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_date ON progress_tracking(tracking_date);