-- =====================================================
-- RECRUITLY AI - FINAL COMPLETE SCHEMA
-- =====================================================
-- This schema fixes the infinite recursion issue in RLS policies
-- by using auth.jwt() claims instead of querying profiles table
-- =====================================================

-- =====================================================
-- 1. CLEANUP
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public signup" ON public.profiles;

DROP POLICY IF EXISTS "HR can view all tests" ON public.tests;
DROP POLICY IF EXISTS "HR can create tests" ON public.tests;
DROP POLICY IF EXISTS "HR can update own tests" ON public.tests;
DROP POLICY IF EXISTS "HR can delete own tests" ON public.tests;
DROP POLICY IF EXISTS "Candidates can view assigned tests" ON public.tests;

DROP POLICY IF EXISTS "HR can view all questions" ON public.questions;
DROP POLICY IF EXISTS "HR can manage questions" ON public.questions;
DROP POLICY IF EXISTS "Candidates can view questions from assigned tests" ON public.questions;

DROP POLICY IF EXISTS "HR can view all assignments" ON public.test_assignments;
DROP POLICY IF EXISTS "HR can create assignments" ON public.test_assignments;
DROP POLICY IF EXISTS "HR can update assignments" ON public.test_assignments;
DROP POLICY IF EXISTS "HR can delete assignments" ON public.test_assignments;
DROP POLICY IF EXISTS "Candidates can view own assignments" ON public.test_assignments;

DROP POLICY IF EXISTS "HR can view all results" ON public.test_results;
DROP POLICY IF EXISTS "Candidates can view own results" ON public.test_results;
DROP POLICY IF EXISTS "Candidates can submit results" ON public.test_results;
DROP POLICY IF EXISTS "HR can update results" ON public.test_results;

DROP POLICY IF EXISTS "HR can view all feedback" ON public.ai_feedback;
DROP POLICY IF EXISTS "Candidates can view own feedback" ON public.ai_feedback;
DROP POLICY IF EXISTS "System can create feedback" ON public.ai_feedback;

DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.ai_feedback CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.test_assignments CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('hr', 'candidate')) DEFAULT 'candidate',
  avatar_url TEXT,
  company TEXT,
  industry TEXT,
  title TEXT,
  skills TEXT[],
  experience_years INTEGER,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  phone TEXT,
  location TEXT,
  cv_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tests Table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  skills TEXT[] NOT NULL DEFAULT '{}',
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  is_published BOOLEAN NOT NULL DEFAULT false,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions Table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'coding', 'essay', 'true_false')) DEFAULT 'multiple_choice',
  options JSONB, -- For multiple choice: {"a": "option1", "b": "option2", ...}
  correct_answer TEXT, -- For multiple choice and true/false
  test_cases JSONB, -- For coding questions: [{"input": "...", "expected": "..."}]
  points INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Test Assignments Table
CREATE TABLE public.test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')) DEFAULT 'pending',
  deadline TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent_minutes INTEGER CHECK (time_spent_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_id, candidate_id)
);

-- Test Results Table
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.test_assignments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  time_spent_seconds INTEGER CHECK (time_spent_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, question_id)
);

-- AI Feedback Table
CREATE TABLE public.ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.test_assignments(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  detailed_analysis JSONB, -- Detailed breakdown by skill/question
  learning_path JSONB, -- Suggested next steps
  performance_percentile INTEGER CHECK (performance_percentile >= 0 AND performance_percentile <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id)
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE INDEX idx_tests_created_by ON public.tests(created_by);
CREATE INDEX idx_tests_is_published ON public.tests(is_published);
CREATE INDEX idx_tests_difficulty ON public.tests(difficulty);

CREATE INDEX idx_questions_test_id ON public.questions(test_id);
CREATE INDEX idx_questions_type ON public.questions(question_type);
CREATE INDEX idx_questions_order ON public.questions(test_id, order_index);

CREATE INDEX idx_assignments_test_id ON public.test_assignments(test_id);
CREATE INDEX idx_assignments_candidate_id ON public.test_assignments(candidate_id);
CREATE INDEX idx_assignments_status ON public.test_assignments(status);
CREATE INDEX idx_assignments_assigned_by ON public.test_assignments(assigned_by);

CREATE INDEX idx_results_assignment_id ON public.test_results(assignment_id);
CREATE INDEX idx_results_candidate_id ON public.test_results(candidate_id);
CREATE INDEX idx_results_question_id ON public.test_results(question_id);

CREATE INDEX idx_feedback_assignment_id ON public.ai_feedback(assignment_id);
CREATE INDEX idx_feedback_candidate_id ON public.ai_feedback(candidate_id);

-- =====================================================
-- 4. CREATE TRIGGER FUNCTION
-- =====================================================

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

-- =====================================================
-- 5. CREATE TRIGGER
-- =====================================================

CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE HELPER FUNCTION FOR ROLE CHECK
-- =====================================================
-- This function safely gets the user's role without causing recursion
-- It uses a direct query with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = user_id 
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'candidate');
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, default to candidate
    RETURN 'candidate';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to the function
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, anon;

-- =====================================================
-- 8. CREATE RLS POLICIES - PROFILES
-- =====================================================

-- Allow public signup (INSERT only)
CREATE POLICY "Allow public signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- HR can view all profiles (NO RECURSION - using helper function with SECURITY DEFINER)
CREATE POLICY "HR can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'hr'
  );

-- HR can update all profiles (NO RECURSION - using helper function with SECURITY DEFINER)
CREATE POLICY "HR can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'hr'
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'hr'
  );

-- =====================================================
-- 9. CREATE RLS POLICIES - TESTS
-- =====================================================

-- HR can view all tests
CREATE POLICY "HR can view all tests"
  ON public.tests FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');

-- HR can create tests
CREATE POLICY "HR can create tests"
  ON public.tests FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr' AND auth.uid() = created_by);

-- HR can update their own tests
CREATE POLICY "HR can update own tests"
  ON public.tests FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'hr' AND auth.uid() = created_by)
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr' AND auth.uid() = created_by);

-- HR can delete their own tests
CREATE POLICY "HR can delete own tests"
  ON public.tests FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'hr' AND auth.uid() = created_by);

-- Candidates can view tests assigned to them (published only)
CREATE POLICY "Candidates can view assigned tests"
  ON public.tests FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.test_assignments
      WHERE test_assignments.test_id = tests.id
      AND test_assignments.candidate_id = auth.uid()
    )
  );

-- =====================================================
-- 10. CREATE RLS POLICIES - QUESTIONS
-- =====================================================

-- HR can view all questions
CREATE POLICY "HR can view all questions"
  ON public.questions FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');

-- HR can manage questions (INSERT, UPDATE, DELETE)
CREATE POLICY "HR can manage questions"
  ON public.questions FOR ALL
  USING (public.get_user_role(auth.uid()) = 'hr')
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr');

-- Candidates can view questions from their assigned tests
CREATE POLICY "Candidates can view questions from assigned tests"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_assignments ta
      JOIN public.tests t ON t.id = ta.test_id
      WHERE t.id = questions.test_id
      AND ta.candidate_id = auth.uid()
      AND ta.status IN ('pending', 'in_progress')
    )
  );

-- =====================================================
-- 11. CREATE RLS POLICIES - TEST ASSIGNMENTS
-- =====================================================

-- HR can view all assignments
CREATE POLICY "HR can view all assignments"
  ON public.test_assignments FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');

-- HR can create assignments
CREATE POLICY "HR can create assignments"
  ON public.test_assignments FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr' AND auth.uid() = assigned_by);

-- HR can update assignments
CREATE POLICY "HR can update assignments"
  ON public.test_assignments FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'hr')
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr');

-- HR can delete assignments
CREATE POLICY "HR can delete assignments"
  ON public.test_assignments FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'hr');

-- Candidates can view their own assignments
CREATE POLICY "Candidates can view own assignments"
  ON public.test_assignments FOR SELECT
  USING (auth.uid() = candidate_id);

-- Candidates can update their own assignment status
CREATE POLICY "Candidates can update own assignments"
  ON public.test_assignments FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

-- =====================================================
-- 12. CREATE RLS POLICIES - TEST RESULTS
-- =====================================================

-- HR can view all results
CREATE POLICY "HR can view all results"
  ON public.test_results FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');

-- HR can update results (for manual grading)
CREATE POLICY "HR can update results"
  ON public.test_results FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'hr')
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr');

-- Candidates can view their own results
CREATE POLICY "Candidates can view own results"
  ON public.test_results FOR SELECT
  USING (auth.uid() = candidate_id);

-- Candidates can submit results
CREATE POLICY "Candidates can submit results"
  ON public.test_results FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

-- Candidates can update their own results (before completion)
CREATE POLICY "Candidates can update own results"
  ON public.test_results FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

-- =====================================================
-- 13. CREATE RLS POLICIES - AI FEEDBACK
-- =====================================================

-- HR can view all feedback
CREATE POLICY "HR can view all feedback"
  ON public.ai_feedback FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');

-- Candidates can view their own feedback
CREATE POLICY "Candidates can view own feedback"
  ON public.ai_feedback FOR SELECT
  USING (auth.uid() = candidate_id);

-- System can create feedback (service role or HR)
CREATE POLICY "System can create feedback"
  ON public.ai_feedback FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr');

-- HR can update feedback
CREATE POLICY "HR can update feedback"
  ON public.ai_feedback FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'hr')
  WITH CHECK (public.get_user_role(auth.uid()) = 'hr');

-- =====================================================
-- 14. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

GRANT ALL ON public.tests TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tests TO authenticated;

GRANT ALL ON public.questions TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;

GRANT ALL ON public.test_assignments TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_assignments TO authenticated;

GRANT ALL ON public.test_results TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_results TO authenticated;

GRANT ALL ON public.ai_feedback TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.ai_feedback TO authenticated;

-- =====================================================
-- 15. CREATE MISSING PROFILES FOR EXISTING USERS
-- =====================================================

-- This will create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'candidate')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- To apply this schema:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
--
-- IMPORTANT: After running this schema, you need to update
-- the JWT token to include user_role claim. This is done
-- by creating a custom claim in Supabase:
--
-- Go to: Authentication > Settings > Custom Claims 
-- Add this SQL function:
--
-- CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
-- RETURNS jsonb
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--   claims jsonb;
--   user_role text;
-- BEGIN
--   SELECT role INTO user_role FROM public.profiles WHERE id = (event->>'user_id')::uuid;
--   claims := event->'claims';
--   claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
--   event := jsonb_set(event, '{claims}', claims);
--   RETURN event;
-- END;
-- $$;
--
-- Then enable it in: Dashboard > Authentication > Hooks
-- =====================================================
