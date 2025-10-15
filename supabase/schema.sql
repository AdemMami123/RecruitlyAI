-- ============================================
-- RECRUITLY AI - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this entire file in your Supabase SQL Editor
-- This creates all tables, policies, and triggers needed

-- ============================================
-- 1. PROFILES TABLE (User Information)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('hr', 'candidate')),
  avatar_url TEXT,
  
  -- HR-specific fields
  company TEXT,
  company_website TEXT,
  company_size TEXT,
  industry TEXT,
  
  -- Candidate-specific fields
  position TEXT,
  bio TEXT,
  skills TEXT[],
  cv_url TEXT,
  phone TEXT,
  location TEXT,
  experience_years INTEGER,
  education TEXT,
  
  -- Scoring & Analytics
  total_tests_taken INTEGER DEFAULT 0,
  total_tests_passed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  strengths TEXT[],
  weaknesses TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 2. TESTS TABLE (Skill Tests)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Test Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., "JavaScript", "React", "Python"
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  passing_score INTEGER NOT NULL DEFAULT 70,
  
  -- Questions (stored as JSONB)
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format: [{"id": 1, "question": "...", "options": [], "correct": 0, "points": 10}]
  
  -- Test Settings
  is_published BOOLEAN DEFAULT false,
  is_timed BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  max_attempts INTEGER DEFAULT 1,
  
  -- Statistics
  total_attempts INTEGER DEFAULT 0,
  total_passed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. TEST ASSIGNMENTS TABLE (Who can take which test)
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Assignment Details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  due_date TIMESTAMP WITH TIME ZONE,
  attempts_used INTEGER DEFAULT 0,
  
  -- Metadata
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(test_id, candidate_id)
);

-- ============================================
-- 4. TEST RESULTS TABLE (Candidate Test Performance)
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.test_assignments(id) ON DELETE SET NULL,
  
  -- Result Details
  score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken_minutes INTEGER,
  
  -- Answers (stored as JSONB)
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Format: {"1": 0, "2": 2, ...} question_id: selected_option_index
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  -- Format: {"strengths": [], "weaknesses": [], "recommendations": [], "skill_breakdown": {}}
  
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  
  -- Metadata
  attempt_number INTEGER DEFAULT 1,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 5. SHORTLISTS TABLE (HR Candidate Management)
-- ============================================
CREATE TABLE IF NOT EXISTS public.shortlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hr_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Shortlist Details
  status TEXT DEFAULT 'reviewing' CHECK (status IN ('reviewing', 'interviewed', 'selected', 'rejected')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  
  -- Interview Details
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(hr_id, candidate_id)
);

-- ============================================
-- 6. NOTIFICATIONS TABLE (System Notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification Details
  type TEXT NOT NULL, -- 'test_assigned', 'test_completed', 'result_ready', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- HR can view all candidate profiles
CREATE POLICY "HR can view candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'hr'
    AND role = 'candidate'
  );

-- Candidates can view other candidate profiles (for CV sharing)
CREATE POLICY "Candidates can view other candidates"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'candidate'
    AND role = 'candidate'
  );

-- ============================================
-- TESTS POLICIES
-- ============================================
-- HR can create tests
CREATE POLICY "HR can create tests"
  ON public.tests FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'hr');

-- HR can view their own tests
CREATE POLICY "HR can view own tests"
  ON public.tests FOR SELECT
  USING (created_by = auth.uid());

-- HR can update their own tests
CREATE POLICY "HR can update own tests"
  ON public.tests FOR UPDATE
  USING (created_by = auth.uid());

-- HR can delete their own tests
CREATE POLICY "HR can delete own tests"
  ON public.tests FOR DELETE
  USING (created_by = auth.uid());

-- Candidates can view assigned published tests
CREATE POLICY "Candidates can view assigned tests"
  ON public.tests FOR SELECT
  USING (
    is_published = true 
    AND id IN (
      SELECT test_id FROM public.test_assignments 
      WHERE candidate_id = auth.uid()
    )
  );

-- ============================================
-- TEST ASSIGNMENTS POLICIES
-- ============================================
-- HR can create assignments
CREATE POLICY "HR can create assignments"
  ON public.test_assignments FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'hr');

-- HR can view assignments they created
CREATE POLICY "HR can view own assignments"
  ON public.test_assignments FOR SELECT
  USING (assigned_by = auth.uid());

-- Candidates can view their own assignments
CREATE POLICY "Candidates can view own assignments"
  ON public.test_assignments FOR SELECT
  USING (candidate_id = auth.uid());

-- Candidates can update their assignment status
CREATE POLICY "Candidates can update assignment status"
  ON public.test_assignments FOR UPDATE
  USING (candidate_id = auth.uid());

-- ============================================
-- TEST RESULTS POLICIES
-- ============================================
-- Candidates can insert their own results
CREATE POLICY "Candidates can insert own results"
  ON public.test_results FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

-- Candidates can view their own results
CREATE POLICY "Candidates can view own results"
  ON public.test_results FOR SELECT
  USING (candidate_id = auth.uid());

-- HR can view results for tests they created
CREATE POLICY "HR can view test results"
  ON public.test_results FOR SELECT
  USING (
    test_id IN (
      SELECT id FROM public.tests WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- SHORTLISTS POLICIES
-- ============================================
-- HR can manage their shortlists
CREATE POLICY "HR can manage shortlists"
  ON public.shortlists FOR ALL
  USING (hr_id = auth.uid());

-- Candidates can view if they're shortlisted
CREATE POLICY "Candidates can view own shortlist status"
  ON public.shortlists FOR SELECT
  USING (candidate_id = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_shortlists_updated_at
  BEFORE UPDATE ON public.shortlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update test statistics
CREATE OR REPLACE FUNCTION public.update_test_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tests
  SET 
    total_attempts = (SELECT COUNT(*) FROM public.test_results WHERE test_id = NEW.test_id),
    total_passed = (SELECT COUNT(*) FROM public.test_results WHERE test_id = NEW.test_id AND passed = true),
    average_score = (SELECT AVG(score) FROM public.test_results WHERE test_id = NEW.test_id)
  WHERE id = NEW.test_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_statistics
  AFTER INSERT ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_test_stats();

-- Function to update candidate statistics
CREATE OR REPLACE FUNCTION public.update_candidate_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_tests_taken = (SELECT COUNT(*) FROM public.test_results WHERE candidate_id = NEW.candidate_id),
    total_tests_passed = (SELECT COUNT(*) FROM public.test_results WHERE candidate_id = NEW.candidate_id AND passed = true),
    average_score = (SELECT AVG(percentage) FROM public.test_results WHERE candidate_id = NEW.candidate_id)
  WHERE id = NEW.candidate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidate_statistics
  AFTER INSERT ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_candidate_stats();

-- Function to create notification on test assignment
CREATE OR REPLACE FUNCTION public.notify_test_assignment()
RETURNS TRIGGER AS $$
DECLARE
  test_title TEXT;
BEGIN
  SELECT title INTO test_title FROM public.tests WHERE id = NEW.test_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.candidate_id,
    'test_assigned',
    'New Test Assigned',
    'You have been assigned the test: ' || test_title,
    '/candidate/tests/' || NEW.test_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_test_assignment
  AFTER INSERT ON public.test_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_test_assignment();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

CREATE INDEX IF NOT EXISTS tests_created_by_idx ON public.tests(created_by);
CREATE INDEX IF NOT EXISTS tests_category_idx ON public.tests(category);
CREATE INDEX IF NOT EXISTS tests_published_idx ON public.tests(is_published);

CREATE INDEX IF NOT EXISTS assignments_test_idx ON public.test_assignments(test_id);
CREATE INDEX IF NOT EXISTS assignments_candidate_idx ON public.test_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS assignments_status_idx ON public.test_assignments(status);

CREATE INDEX IF NOT EXISTS results_test_idx ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS results_candidate_idx ON public.test_results(candidate_id);

CREATE INDEX IF NOT EXISTS shortlists_hr_idx ON public.shortlists(hr_id);
CREATE INDEX IF NOT EXISTS shortlists_candidate_idx ON public.shortlists(candidate_id);
CREATE INDEX IF NOT EXISTS shortlists_status_idx ON public.shortlists(status);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(is_read);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: HR Dashboard Summary
CREATE OR REPLACE VIEW public.hr_dashboard_summary AS
SELECT 
  p.id as hr_id,
  p.company,
  COUNT(DISTINCT t.id) as total_tests_created,
  COUNT(DISTINCT ta.candidate_id) as total_candidates_assigned,
  COUNT(DISTINCT tr.id) as total_test_results,
  COALESCE(AVG(tr.percentage), 0) as average_candidate_score
FROM public.profiles p
LEFT JOIN public.tests t ON t.created_by = p.id
LEFT JOIN public.test_assignments ta ON ta.assigned_by = p.id
LEFT JOIN public.test_results tr ON tr.test_id IN (SELECT id FROM public.tests WHERE created_by = p.id)
WHERE p.role = 'hr'
GROUP BY p.id, p.company;

-- View: Candidate Dashboard Summary
CREATE OR REPLACE VIEW public.candidate_dashboard_summary AS
SELECT 
  p.id as candidate_id,
  p.full_name,
  p.total_tests_taken,
  p.total_tests_passed,
  p.average_score,
  COUNT(ta.id) FILTER (WHERE ta.status = 'pending') as pending_tests,
  COUNT(ta.id) FILTER (WHERE ta.status = 'in_progress') as in_progress_tests
FROM public.profiles p
LEFT JOIN public.test_assignments ta ON ta.candidate_id = p.id
WHERE p.role = 'candidate'
GROUP BY p.id, p.full_name, p.total_tests_taken, p.total_tests_passed, p.average_score;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Note: Run this only in development
-- You can uncomment and modify as needed

/*
-- Insert sample test
INSERT INTO public.tests (created_by, title, description, category, difficulty, duration_minutes, questions, is_published)
VALUES (
  'YOUR_HR_USER_ID',
  'JavaScript Basics',
  'Test your knowledge of JavaScript fundamentals',
  'JavaScript',
  'medium',
  30,
  '[
    {
      "id": 1,
      "question": "What is the output of typeof null?",
      "options": ["object", "null", "undefined", "number"],
      "correct": 0,
      "points": 10
    },
    {
      "id": 2,
      "question": "Which method is used to add elements to an array?",
      "options": ["push()", "add()", "append()", "insert()"],
      "correct": 0,
      "points": 10
    }
  ]'::jsonb,
  true
);
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Schema creation complete!
-- Remember to:
-- 1. Replace sample IDs with real user IDs
-- 2. Test all policies with different user roles
-- 3. Monitor query performance and add indexes as needed
-- 4. Set up Supabase Storage buckets for CV uploads
-- ============================================
