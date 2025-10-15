-- ==========================================================
-- 📦 MIGRATION: Add Missing Columns to Existing Tables
-- Run this FIRST before the full schema
-- ==========================================================

-- Add missing columns to profiles table (if they don't exist)
DO $$ 
BEGIN
  -- Add skills column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'skills') THEN
    ALTER TABLE public.profiles ADD COLUMN skills TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Add industry column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'industry') THEN
    ALTER TABLE public.profiles ADD COLUMN industry TEXT;
  END IF;

  -- Add avatar_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add performance tracking columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'tests_taken') THEN
    ALTER TABLE public.profiles ADD COLUMN tests_taken INTEGER DEFAULT 0 CHECK (tests_taken >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'tests_passed') THEN
    ALTER TABLE public.profiles ADD COLUMN tests_passed INTEGER DEFAULT 0 CHECK (tests_passed >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'tests_in_progress') THEN
    ALTER TABLE public.profiles ADD COLUMN tests_in_progress INTEGER DEFAULT 0 CHECK (tests_in_progress >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'tests_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN tests_completed INTEGER DEFAULT 0 CHECK (tests_completed >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'average_score') THEN
    ALTER TABLE public.profiles ADD COLUMN average_score NUMERIC(5,2) DEFAULT 0.00 CHECK (average_score >= 0 AND average_score <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'completion_rate') THEN
    ALTER TABLE public.profiles ADD COLUMN completion_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'strengths') THEN
    ALTER TABLE public.profiles ADD COLUMN strengths JSONB DEFAULT '[]'::JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- Add missing columns to tests table (if they don't exist)
DO $$ 
BEGIN
  -- Add duration_minutes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'duration_minutes') THEN
    ALTER TABLE public.tests ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0 AND duration_minutes <= 300);
  END IF;

  -- Add category column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'category') THEN
    ALTER TABLE public.tests ADD COLUMN category TEXT;
  END IF;

  -- Add difficulty column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'difficulty') THEN
    ALTER TABLE public.tests ADD COLUMN difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium';
  END IF;

  -- Add passing_score column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'passing_score') THEN
    ALTER TABLE public.tests ADD COLUMN passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100);
  END IF;

  -- Add total_points column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'total_points') THEN
    ALTER TABLE public.tests ADD COLUMN total_points INTEGER DEFAULT 100 CHECK (total_points > 0);
  END IF;

  -- Add is_published column (THE IMPORTANT ONE!)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'is_published') THEN
    ALTER TABLE public.tests ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;

  -- Add test settings columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'is_timed') THEN
    ALTER TABLE public.tests ADD COLUMN is_timed BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'shuffle_questions') THEN
    ALTER TABLE public.tests ADD COLUMN shuffle_questions BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'shuffle_options') THEN
    ALTER TABLE public.tests ADD COLUMN shuffle_options BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'show_correct_answers') THEN
    ALTER TABLE public.tests ADD COLUMN show_correct_answers BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'show_explanations') THEN
    ALTER TABLE public.tests ADD COLUMN show_explanations BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'max_attempts') THEN
    ALTER TABLE public.tests ADD COLUMN max_attempts INTEGER DEFAULT 1 CHECK (max_attempts > 0 AND max_attempts <= 10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'require_webcam') THEN
    ALTER TABLE public.tests ADD COLUMN require_webcam BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'ai_generated') THEN
    ALTER TABLE public.tests ADD COLUMN ai_generated BOOLEAN DEFAULT false;
  END IF;

  -- Add statistics columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'total_attempts') THEN
    ALTER TABLE public.tests ADD COLUMN total_attempts INTEGER DEFAULT 0 CHECK (total_attempts >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'total_passed') THEN
    ALTER TABLE public.tests ADD COLUMN total_passed INTEGER DEFAULT 0 CHECK (total_passed >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'average_score') THEN
    ALTER TABLE public.tests ADD COLUMN average_score NUMERIC(5,2) DEFAULT 0.00 CHECK (average_score >= 0 AND average_score <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'completion_rate') THEN
    ALTER TABLE public.tests ADD COLUMN completion_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'published_at') THEN
    ALTER TABLE public.tests ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tests' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE public.tests ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- Add missing columns to test_results table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'points_earned') THEN
    ALTER TABLE public.test_results ADD COLUMN points_earned INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'total_points') THEN
    ALTER TABLE public.test_results ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'started_at') THEN
    ALTER TABLE public.test_results ADD COLUMN started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'completed_at') THEN
    ALTER TABLE public.test_results ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'time_taken') THEN
    ALTER TABLE public.test_results ADD COLUMN time_taken INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.test_results ADD COLUMN status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'passed') THEN
    ALTER TABLE public.test_results ADD COLUMN passed BOOLEAN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'test_results' 
                 AND column_name = 'ai_analysis') THEN
    ALTER TABLE public.test_results ADD COLUMN ai_analysis JSONB;
  END IF;
END $$;

-- Add missing columns to ai_feedback table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'ai_feedback' 
                 AND column_name = 'test_result_id') THEN
    ALTER TABLE public.ai_feedback ADD COLUMN test_result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'ai_feedback' 
                 AND column_name = 'generated_at') THEN
    ALTER TABLE public.ai_feedback ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'ai_feedback' 
                 AND column_name = 'model_version') THEN
    ALTER TABLE public.ai_feedback ADD COLUMN model_version TEXT DEFAULT 'gemini-2.0-flash-exp';
  END IF;

  -- If test_id exists but not test_result_id, we can keep test_id as it's still useful
  -- The schema allows both columns to exist
END $$;

-- Update role values from 'rh' to 'hr' (if needed)
UPDATE public.profiles SET role = 'hr' WHERE role = 'rh';

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS tests_created_by_idx ON public.tests(created_by);
CREATE INDEX IF NOT EXISTS tests_is_published_idx ON public.tests(is_published);
CREATE INDEX IF NOT EXISTS tests_category_idx ON public.tests(category);
CREATE INDEX IF NOT EXISTS tests_difficulty_idx ON public.tests(difficulty);
CREATE INDEX IF NOT EXISTS test_results_test_id_idx ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS test_results_candidate_id_idx ON public.test_results(candidate_id);
CREATE INDEX IF NOT EXISTS test_results_status_idx ON public.test_results(status);
CREATE INDEX IF NOT EXISTS ai_feedback_candidate_id_idx ON public.ai_feedback(candidate_id);
CREATE INDEX IF NOT EXISTS ai_feedback_test_result_id_idx ON public.ai_feedback(test_result_id);

-- ==========================================================
-- ✅ MIGRATION COMPLETE - Now you can run the full schema!
-- ==========================================================
