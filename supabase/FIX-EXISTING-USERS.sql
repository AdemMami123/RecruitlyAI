-- ==========================================================
-- 🔧 FIX EXISTING USERS - Run this to fix your current issue
-- This will create missing profiles for existing users
-- ==========================================================

-- Step 1: Create missing profiles for existing users
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email), -- Use email as fallback
  COALESCE(u.raw_user_meta_data->>'role', 'candidate') -- Default to candidate
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL; -- Only insert where profile doesn't exist

-- Step 2: Verify all users now have profiles
SELECT 
  u.id,
  u.email as auth_email,
  u.created_at as user_created,
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING PROFILE'
    ELSE '✅ Profile exists'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 3: Verify trigger exists for future signups
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ Trigger is active'
    ELSE '❌ Trigger is disabled'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ==========================================================
-- If you see "0 rows" for the trigger, run SIMPLE-MIGRATION.sql
-- Otherwise, you're all set! Try logging in again.
-- ==========================================================
