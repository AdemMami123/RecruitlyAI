-- =====================================================
-- QUICK FIX: Add missing columns to existing profiles table
-- =====================================================
-- Run this if you don't want to recreate the entire database
-- This just adds the missing columns and fixes the helper function
-- =====================================================

-- 1. Add all missing columns (IF NOT EXISTS prevents errors if already added)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- 2. Drop and recreate the helper function with better performance
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use a simple SELECT with a limit for better performance
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

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, anon;

-- =====================================================
-- Test the function
-- =====================================================
-- Run this to verify it works:
-- SELECT public.get_user_role(auth.uid());

COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Helper function to get user role without causing RLS recursion. Uses SECURITY DEFINER to bypass RLS.';
