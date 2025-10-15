-- ==========================================================
-- 📦 SUPABASE HR RECRUITING PLATFORM SCHEMA (SAFE RE-RUN)
-- Technologies: Next.js 15 + Supabase + TailwindCSS + shadcn + Gemini AI
-- Version: 2.0 - Updated for AI Integration
-- ==========================================================

-- =========================
-- TABLE: profiles
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('candidate', 'hr')) NOT NULL,
  
  -- HR-specific fields
  company TEXT,
  industry TEXT,
  
  -- Candidate-specific fields
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  cv_url TEXT,
  
  -- Performance tracking (for candidates)
  tests_taken INTEGER DEFAULT 0 CHECK (tests_taken >= 0),
  tests_passed INTEGER DEFAULT 0 CHECK (tests_passed >= 0),
  tests_in_progress INTEGER DEFAULT 0 CHECK (tests_in_progress >= 0),
  tests_completed INTEGER DEFAULT 0 CHECK (tests_completed >= 0),
  average_score NUMERIC(5,2) DEFAULT 0.00 CHECK (average_score >= 0 AND average_score <= 100),
  completion_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  
  -- AI-generated insights (JSONB for flexibility)
  weaknesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  strengths JSONB DEFAULT '[]'::JSONB,
  
  -- Avatar/Profile picture
  avatar_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =========================
-- TABLE: tests
-- =========================
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Test Details
  title TEXT NOT NULL CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 200),
  description TEXT,
  category TEXT, -- e.g., "JavaScript", "React", "Python", "Data Science"
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0 AND duration_minutes <= 300),
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  total_points INTEGER DEFAULT 100 CHECK (total_points > 0),
  
  -- Test Settings
  is_published BOOLEAN DEFAULT false,
  is_timed BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_options BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  show_explanations BOOLEAN DEFAULT true,
  max_attempts INTEGER DEFAULT 1 CHECK (max_attempts > 0 AND max_attempts <= 10),
  require_webcam BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT false,
  
  -- Statistics (auto-updated by triggers)
  total_attempts INTEGER DEFAULT 0 CHECK (total_attempts >= 0),
  total_passed INTEGER DEFAULT 0 CHECK (total_passed >= 0),
  average_score NUMERIC(5,2) DEFAULT 0.00 CHECK (average_score >= 0 AND average_score <= 100),
  completion_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS tests_created_by_idx ON public.tests(created_by);
CREATE INDEX IF NOT EXISTS tests_is_published_idx ON public.tests(is_published);
CREATE INDEX IF NOT EXISTS tests_category_idx ON public.tests(category);
CREATE INDEX IF NOT EXISTS tests_difficulty_idx ON public.tests(difficulty);

-- =========================
-- TABLE: questions
-- =========================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  
  -- Question Content
  question_text TEXT NOT NULL CHECK (LENGTH(question_text) >= 10),
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'code', 'essay')) DEFAULT 'multiple_choice',
  
  -- Options (for multiple choice)
  options JSONB DEFAULT '[]'::JSONB,
  
  -- Answer
  correct_answer JSONB NOT NULL, -- Can be string, array, or object depending on question type
  explanation TEXT,
  
  -- Scoring
  points INTEGER DEFAULT 10 CHECK (points > 0),
  
  -- Order
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS questions_test_id_idx ON public.questions(test_id);
CREATE INDEX IF NOT EXISTS questions_order_idx ON public.questions(test_id, order_index);

-- =========================
-- TABLE: test_assignments
-- =========================
CREATE TABLE IF NOT EXISTS public.test_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Assignment details
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')) DEFAULT 'pending',
  attempts_used INTEGER DEFAULT 0 CHECK (attempts_used >= 0),
  
  -- Scheduling
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_assignment UNIQUE(test_id, candidate_id)
);

-- Enable RLS
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS test_assignments_test_id_idx ON public.test_assignments(test_id);
CREATE INDEX IF NOT EXISTS test_assignments_candidate_id_idx ON public.test_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS test_assignments_status_idx ON public.test_assignments(status);

-- =========================
-- TABLE: test_results
-- =========================
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Results
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  points_earned INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Answers (JSONB: { question_id: answer })
  answers JSONB DEFAULT '{}'::JSONB,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INTEGER, -- in seconds
  
  -- Status
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  passed BOOLEAN,
  
  -- AI Analysis (cached from Gemini AI)
  ai_analysis JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS test_results_test_id_idx ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS test_results_candidate_id_idx ON public.test_results(candidate_id);
CREATE INDEX IF NOT EXISTS test_results_status_idx ON public.test_results(status);
CREATE INDEX IF NOT EXISTS test_results_completed_at_idx ON public.test_results(completed_at);

-- =========================
-- TABLE: ai_feedback (with backward compatibility)
-- =========================
-- Note: This table may already exist with test_id column
-- The script will add test_result_id if missing
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- AI-generated feedback (from Gemini)
  feedback JSONB NOT NULL,
  -- Structure: { strengths: [], weaknesses: [], recommendations: [], summary: "" }
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add optional columns if they don't exist (handled by migration script)
-- test_result_id, generated_at, model_version will be added by migration

-- Enable RLS
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS ai_feedback_candidate_id_idx ON public.ai_feedback(candidate_id);

-- =========================
-- STORAGE: CVs Bucket
-- =========================
-- This needs to be created via Supabase Dashboard or API
-- Bucket name: 'cvs'
-- Public: false
-- File size limit: 5MB
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- ==========================================================
-- 🧩 POLICY CLEANUP (SAFE FOR RE-RUN)
-- ==========================================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "HR can view candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view other candidates" ON public.profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON public.profiles;

-- TESTS
DROP POLICY IF EXISTS "HR can create tests" ON public.tests;
DROP POLICY IF EXISTS "HR can view own tests" ON public.tests;
DROP POLICY IF EXISTS "HR can update own tests" ON public.tests;
DROP POLICY IF EXISTS "HR can delete own tests" ON public.tests;
DROP POLICY IF EXISTS "Candidates can view published tests" ON public.tests;
DROP POLICY IF EXISTS "Candidates can view all tests" ON public.tests;
DROP POLICY IF EXISTS "Published tests are viewable" ON public.tests;

-- QUESTIONS
DROP POLICY IF EXISTS "HR can manage questions for own tests" ON public.questions;
DROP POLICY IF EXISTS "HR can insert questions" ON public.questions;
DROP POLICY IF EXISTS "HR can update questions" ON public.questions;
DROP POLICY IF EXISTS "HR can delete questions" ON public.questions;
DROP POLICY IF EXISTS "Candidates can view questions" ON public.questions;
DROP POLICY IF EXISTS "Users can view questions for accessible tests" ON public.questions;

-- TEST ASSIGNMENTS
DROP POLICY IF EXISTS "HR can assign tests" ON public.test_assignments;
DROP POLICY IF EXISTS "HR can view assignments" ON public.test_assignments;
DROP POLICY IF EXISTS "Candidates can view own assignments" ON public.test_assignments;
DROP POLICY IF EXISTS "Candidates can update own assignments" ON public.test_assignments;

-- TEST RESULTS
DROP POLICY IF EXISTS "Candidates can insert own results" ON public.test_results;
DROP POLICY IF EXISTS "Candidates can update own results" ON public.test_results;
DROP POLICY IF EXISTS "Users can view own results" ON public.test_results;
DROP POLICY IF EXISTS "HR can view all results" ON public.test_results;
DROP POLICY IF EXISTS "HR can view results for their tests" ON public.test_results;

-- AI FEEDBACK
DROP POLICY IF EXISTS "AI feedback visible to candidate" ON public.ai_feedback;
DROP POLICY IF EXISTS "HR can view candidate feedback" ON public.ai_feedback;
DROP POLICY IF EXISTS "System can insert feedback" ON public.ai_feedback;

-- ==========================================================
-- ✅ RECREATE POLICIES
-- ==========================================================

-- ---------- PROFILES ----------
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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'hr'
    )
  );

-- ---------- TESTS ----------
CREATE POLICY "HR can create tests"
  ON public.tests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'hr'
    )
  );

CREATE POLICY "HR can view own tests"
  ON public.tests FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "HR can update own tests"
  ON public.tests FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "HR can delete own tests"
  ON public.tests FOR DELETE
  USING (created_by = auth.uid());

CREATE POLICY "Published tests are viewable"
  ON public.tests FOR SELECT
  USING (is_published = true);

-- ---------- QUESTIONS ----------
CREATE POLICY "HR can insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "HR can update questions"
  ON public.questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "HR can delete questions"
  ON public.questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view questions for accessible tests"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id 
      AND (t.is_published = true OR t.created_by = auth.uid())
    )
  );

-- ---------- TEST ASSIGNMENTS ----------
CREATE POLICY "HR can assign tests"
  ON public.test_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'hr'
    )
  );

CREATE POLICY "HR can view assignments"
  ON public.test_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'hr'
    )
    OR assigned_by = auth.uid()
  );

CREATE POLICY "Candidates can view own assignments"
  ON public.test_assignments FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can update own assignments"
  ON public.test_assignments FOR UPDATE
  USING (candidate_id = auth.uid());

-- ---------- TEST RESULTS ----------
CREATE POLICY "Candidates can insert own results"
  ON public.test_results FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can update own results"
  ON public.test_results FOR UPDATE
  USING (candidate_id = auth.uid());

CREATE POLICY "Users can view own results"
  ON public.test_results FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "HR can view results for their tests"
  ON public.test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

-- ---------- AI FEEDBACK ----------
CREATE POLICY "AI feedback visible to candidate"
  ON public.ai_feedback FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "HR can view candidate feedback"
  ON public.ai_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'hr'
    )
  );

CREATE POLICY "System can insert feedback"
  ON public.ai_feedback FOR INSERT
  WITH CHECK (true);

-- ==========================================================
-- 📊 FUNCTIONS & TRIGGERS
-- ==========================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for tests
DROP TRIGGER IF EXISTS update_tests_updated_at ON public.tests;
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Create profile on signup
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- ✅ FINAL: GRANT PRIVILEGES
-- ==========================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ==========================================================
-- ✅ STORAGE POLICIES (for CVs bucket)
-- ==========================================================
-- Note: Create the 'cvs' bucket first via Supabase Dashboard

-- Allow authenticated users to upload their own CV
DROP POLICY IF EXISTS "Users can upload own CV" ON storage.objects;
CREATE POLICY "Users can upload own CV"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own CV
DROP POLICY IF EXISTS "Users can update own CV" ON storage.objects;
CREATE POLICY "Users can update own CV"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own CV
DROP POLICY IF EXISTS "Users can delete own CV" ON storage.objects;
CREATE POLICY "Users can delete own CV"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own CV
DROP POLICY IF EXISTS "Users can view own CV" ON storage.objects;
CREATE POLICY "Users can view own CV"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow HR to view all CVs
DROP POLICY IF EXISTS "HR can view all CVs" ON storage.objects;
CREATE POLICY "HR can view all CVs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' 
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'hr'
    )
  );

-- ==========================================================
-- 🎉 SCHEMA SETUP COMPLETE!
-- ==========================================================
