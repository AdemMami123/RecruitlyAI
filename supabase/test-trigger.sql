-- ==========================================================
-- 🧪 TEST: Verify Database Trigger Setup
-- Run this in Supabase SQL Editor to check if triggers exist
-- ==========================================================

-- Check if handle_new_user function exists
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_user';

-- Check if trigger exists on auth.users
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Test profile creation manually (optional - only run if you want to test)
-- DO NOT RUN THIS if you have an active user session
-- This is just to show what the trigger should do:
/*
-- This is what happens when a user signs up:
-- 1. User is created in auth.users
-- 2. Trigger fires automatically
-- 3. Profile is inserted into public.profiles

-- To test, you can create a test user via Supabase Auth UI
-- Then check if profile was created:
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.full_name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
*/
