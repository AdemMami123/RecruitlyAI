# 🚀 Quick Start - Fix Infinite Recursion Error

## The Problem
You're getting this error when running queries:
```
ERROR: infinite recursion detected in policy for relation 'profiles'
```

This happens because RLS policies on the `profiles` table were querying the `profiles` table itself to check user roles - creating a circular dependency.

---

## The Solution (Simple - No JWT Setup Needed!)

The fixed schema uses a helper function with `SECURITY DEFINER` that bypasses RLS when checking roles.

---

## Steps to Fix (2 minutes)

### 1. Open Supabase SQL Editor
Go to: **Supabase Dashboard** → **SQL Editor** → **New Query**

### 2. Run the Fixed Schema
Copy and paste the entire contents of `supabase/FINAL-SCHEMA.sql` into the editor and click **Run**.

### 3. Done!
That's it! The schema will:
- ✅ Drop and recreate all tables with fixed policies
- ✅ Create the `public.get_user_role()` helper function
- ✅ Set up all RLS policies without recursion
- ✅ Create missing profiles for existing users
- ✅ Set up all necessary indexes

---

## Test It

After running the schema, try these tests in SQL Editor:

```sql
-- Test 1: Check profiles exist
SELECT id, email, role FROM public.profiles;

-- Test 2: Verify helper function exists
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_role';
-- Should return: get_user_role | DEFINER

-- Test 3: Check your role
SELECT public.get_user_role(auth.uid());
-- Should return: 'hr' or 'candidate'
```

---

## What's Different?

### ❌ Before (Causes Recursion)
```sql
CREATE POLICY "HR can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles  -- Queries profiles inside profiles policy!
      WHERE id = auth.uid() AND role = 'hr'
    )
  );
```

### ✅ After (No Recursion)
```sql
CREATE POLICY "HR can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'hr'  -- Uses helper function instead!
  );
```

The helper function has `SECURITY DEFINER`, so it runs with elevated permissions and bypasses RLS when checking the role.

---

## Now Test Your App

1. **Sign in** to your application
2. You should be redirected to the correct dashboard (HR or Candidate)
3. No more 500 errors or infinite recursion!

---

## If You Still Have Issues

See the full troubleshooting guide in `JWT-CUSTOM-CLAIMS-SETUP.md`

Common issues:
- **Profile not found**: Run the schema again, it creates missing profiles
- **Permission denied**: Make sure the entire schema ran successfully
- **Still getting errors**: Clear your browser cookies and sign in again
