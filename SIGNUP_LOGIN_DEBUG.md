# 🐛 Signup/Login Infinite Loading - Debugging Guide

## Problem
Signup and login stay in loading state forever and don't redirect to dashboard.

## Root Causes Identified

### 1. **Duplicate Profile Creation** ✅ FIXED
- **Issue**: Signup was trying to manually insert into `profiles` table
- **Conflict**: Database trigger `handle_new_user()` also creates profile automatically
- **Result**: Unique constraint violation on `email` field or race condition
- **Fix**: Removed manual insertion, let trigger handle it with fallback

### 2. **Missing Database Trigger** ⚠️ NEEDS VERIFICATION
- **Issue**: Trigger `on_auth_user_created` might not exist in database
- **Result**: No profile gets created, login fails to find profile
- **Solution**: Run the full schema to create trigger

### 3. **Profile Query Timeout** 
- **Issue**: After signup, immediate profile query might fail (trigger delay)
- **Fix**: Added 500ms delay to allow trigger to complete

## Step-by-Step Fix

### Step 1: Verify Trigger Exists
Run this in Supabase SQL Editor:
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

If either returns empty, you need to run the schema migration!

### Step 2: Apply Schema Migration
1. **First**, run `supabase/migration-step1-add-columns.sql` (adds columns)
2. **Then**, run `supabase/schema-corrected.sql` (creates trigger)

### Step 3: Test Signup Flow
1. Open browser console (F12)
2. Try to sign up
3. Watch for errors in console
4. Check Network tab for failed requests

### Step 4: Verify Profile Creation
After signup attempt, run in SQL Editor:
```sql
-- Check if user and profile were created
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.role,
  p.email as profile_email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
```

## Common Issues & Solutions

### Issue: "Profile not found after signup"
**Cause**: Trigger didn't fire or failed
**Solution**: 
1. Check if trigger exists (Step 1 above)
2. Manually create profile:
```sql
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 
       COALESCE(raw_user_meta_data->>'role', 'candidate')
FROM auth.users
WHERE id = 'USER_ID_HERE';
```

### Issue: "Unique constraint violation on email"
**Cause**: Trying to insert profile twice
**Solution**: Already fixed in code (removed manual insertion)

### Issue: Login says "Profile not found"
**Cause**: User exists in auth.users but not in profiles
**Solution**: 
1. Delete the auth user
2. Sign up again (trigger will create profile)

Or manually create missing profile:
```sql
-- Create missing profiles for existing users
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'candidate')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

### Issue: Redirect loops
**Cause**: Middleware can't find profile
**Solution**: Ensure profile has valid `role` ('hr' or 'candidate')

## Testing Checklist

- [ ] Database trigger exists
- [ ] Can create new auth user
- [ ] Profile is auto-created with correct role
- [ ] Email is stored correctly
- [ ] Signup redirects to correct dashboard
- [ ] Login works without hanging
- [ ] No console errors
- [ ] No infinite redirects

## Quick Test Script

Run in browser console after opening signup page:
```javascript
// Test signup flow
const testSignup = async () => {
  console.log('Testing signup...')
  
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123!@#',
      fullName: 'Test User',
      role: 'candidate'
    })
  })
  
  console.log('Response:', await response.json())
}

// testSignup() // Uncomment to run
```

## Files Changed
- `app/signup/page.tsx` - Removed duplicate profile insertion
- `app/login/page.tsx` - Better error handling
- `supabase/schema-corrected.sql` - Contains trigger definition
- `supabase/migration-step1-add-columns.sql` - Prepares database

## Next Steps
1. Verify trigger exists in database
2. If missing, run migration scripts
3. Test signup with new email
4. Check browser console for errors
5. Report any new error messages
