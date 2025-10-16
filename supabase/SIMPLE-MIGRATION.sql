-- ==========================================================
-- 🚀 SIMPLE ONE-STEP MIGRATION - RUN THIS ONLY
-- This will fix everything in one go
-- ==========================================================

-- =========================
-- STEP 1: Drop and recreate profiles table with correct structure
-- =========================

-- First, disable RLS temporarily
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing constraints and triggers that might cause issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop existing table (CAREFUL: This deletes data!)
-- Comment out if you want to preserve existing data
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate profiles table with ALL required columns
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info (NOT NULL required fields)
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'hr')),
  
  -- Optional fields
  full_name TEXT,
  phone TEXT,
  company TEXT,
  industry TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  cv_url TEXT,
  avatar_url TEXT,
  
  -- Performance tracking
  tests_taken INTEGER DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  tests_in_progress INTEGER DEFAULT 0,
  tests_completed INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0.00,
  completion_rate NUMERIC(5,2) DEFAULT 0.00,
  
  -- AI insights
  weaknesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  strengths JSONB DEFAULT '[]'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_email_idx ON public.profiles(email);

-- =========================
-- STEP 2: Fix tests table
-- =========================

-- Drop and recreate tests table
DROP TABLE IF EXISTS public.tests CASCADE;

CREATE TABLE public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic fields
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  
  -- Required for AI integration
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  passing_score INTEGER NOT NULL DEFAULT 70,
  total_points INTEGER DEFAULT 100,
  
  -- Settings
  is_published BOOLEAN DEFAULT false,
  is_timed BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_options BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  show_explanations BOOLEAN DEFAULT true,
  max_attempts INTEGER DEFAULT 1,
  require_webcam BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT false,
  
  -- Stats
  total_attempts INTEGER DEFAULT 0,
  total_passed INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0.00,
  completion_rate NUMERIC(5,2) DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE INDEX tests_created_by_idx ON public.tests(created_by);
CREATE INDEX tests_is_published_idx ON public.tests(is_published);

-- =========================
-- STEP 3: Create questions table
-- =========================

DROP TABLE IF EXISTS public.questions CASCADE;

CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]'::JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE INDEX questions_test_id_idx ON public.questions(test_id);

-- =========================
-- STEP 4: Create test_assignments table
-- =========================

DROP TABLE IF EXISTS public.test_assignments CASCADE;

CREATE TABLE public.test_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  status TEXT DEFAULT 'pending',
  attempts_used INTEGER DEFAULT 0,
  
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(test_id, candidate_id)
);

ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX test_assignments_test_id_idx ON public.test_assignments(test_id);
CREATE INDEX test_assignments_candidate_id_idx ON public.test_assignments(candidate_id);

-- =========================
-- STEP 5: Fix test_results table
-- =========================

DROP TABLE IF EXISTS public.test_results CASCADE;

CREATE TABLE public.test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  score NUMERIC(5,2),
  points_earned INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}'::JSONB,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INTEGER,
  
  status TEXT DEFAULT 'in_progress',
  passed BOOLEAN,
  ai_analysis JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE INDEX test_results_test_id_idx ON public.test_results(test_id);
CREATE INDEX test_results_candidate_id_idx ON public.test_results(candidate_id);

-- =========================
-- STEP 6: Fix ai_feedback table
-- =========================

DROP TABLE IF EXISTS public.ai_feedback CASCADE;

CREATE TABLE public.ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  test_result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE,
  
  feedback JSONB NOT NULL,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  model_version TEXT DEFAULT 'gemini-2.0-flash-exp'
);

ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX ai_feedback_candidate_id_idx ON public.ai_feedback(candidate_id);

-- =========================
-- STEP 7: Create Functions
-- =========================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- STEP 8: Create Triggers
-- =========================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- STEP 9: Create RLS Policies
-- =========================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "HR can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

-- Tests policies
CREATE POLICY "HR can create tests"
  ON public.tests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

CREATE POLICY "HR can view own tests"
  ON public.tests FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "HR can update own tests"
  ON public.tests FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Published tests viewable"
  ON public.tests FOR SELECT
  USING (is_published = true);

-- Questions policies
CREATE POLICY "HR can manage questions"
  ON public.questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND created_by = auth.uid()));

CREATE POLICY "Users can view questions"
  ON public.questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND (is_published = true OR created_by = auth.uid())));

-- Test assignments policies
CREATE POLICY "HR can manage assignments"
  ON public.test_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

CREATE POLICY "Candidates can view own assignments"
  ON public.test_assignments FOR SELECT
  USING (candidate_id = auth.uid());

-- Test results policies
CREATE POLICY "Candidates can manage own results"
  ON public.test_results FOR ALL
  USING (candidate_id = auth.uid());

CREATE POLICY "HR can view results"
  ON public.test_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND created_by = auth.uid()));

-- AI feedback policies
CREATE POLICY "Candidates can view own feedback"
  ON public.ai_feedback FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "HR can view feedback"
  ON public.ai_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hr'));

CREATE POLICY "System can insert feedback"
  ON public.ai_feedback FOR INSERT
  WITH CHECK (true);

-- =========================
-- STEP 10: Grant permissions
-- =========================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =========================
-- ✅ MIGRATION COMPLETE!
-- =========================

-- Verify setup
SELECT 'Profiles table' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 'Tests table', COUNT(*) FROM public.tests
UNION ALL
SELECT 'Questions table', COUNT(*) FROM public.questions
UNION ALL
SELECT 'Test assignments', COUNT(*) FROM public.test_assignments
UNION ALL
SELECT 'Test results', COUNT(*) FROM public.test_results
UNION ALL
SELECT 'AI feedback', COUNT(*) FROM public.ai_feedback;
