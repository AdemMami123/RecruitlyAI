# Schema Setup Instructions for RecruitlyAI

## Problem Solved
The previous schema had **infinite recursion** in RLS policies because policies on the `profiles` table were querying the `profiles` table itself to check user roles. This created a circular dependency.

## Solution
Use a helper function `public.get_user_role()` with `SECURITY DEFINER` that bypasses RLS when checking roles, preventing the infinite recursion.

---

## Setup Instructions

### Step 1: Apply the Final Schema

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Open `supabase/FINAL-SCHEMA.sql` and copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**

This will:
- Drop all existing tables and policies
- Recreate everything with fixed RLS policies
- Create missing profiles for existing users
- Set up the `public.get_user_role()` helper function with SECURITY DEFINER

**That's it!** No JWT hooks or custom claims needed. The schema is now complete and ready to use.

---

## How It Works

The helper function uses `SECURITY DEFINER` to bypass RLS when checking roles:

```sql
CREATE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'candidate');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

Policies use this function to check roles without recursion:

```sql
CREATE POLICY "HR can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');
```

Since the function has `SECURITY DEFINER`, it runs with the permissions of the function owner (bypassing RLS), so it can query the profiles table without triggering the policies again.

---

## Step 2: Test the Setup

### A. Test Profile Access

1. Go to **SQL Editor** and run:

```sql
-- Check if profiles exist
SELECT id, email, role FROM public.profiles;

-- Check if the helper function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_role';
```

### B. Test Login Flow

1. **Sign in** to your application
2. Check the console for any errors
3. Verify you're redirected to the correct dashboard (HR or Candidate)

---

## Step 3: Verify Middleware (Optional)

Your middleware can query the profile role safely (it uses the helper function internally):

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, check role from profiles table
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const role = profile?.role || 'candidate'
    
    // Protect HR routes
    if (request.nextUrl.pathname.startsWith('/hr') && role !== 'hr') {
      return NextResponse.redirect(new URL('/candidate', request.url))
    }
    
    // Protect candidate routes
    if (request.nextUrl.pathname.startsWith('/candidate') && role !== 'candidate') {
      return NextResponse.redirect(new URL('/hr', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/hr/:path*', '/candidate/:path*', '/api/:path*'],
}
```

---

## Troubleshooting

### Issue: "infinite recursion detected in policy"
**Solution**: Make sure you ran the FINAL-SCHEMA.sql completely and the custom access token hook is enabled.

### Issue: "Profile not found"
**Solution**: The FINAL-SCHEMA.sql includes a statement that creates profiles for existing users. If you still have issues:

```sql
-- Manually create missing profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'candidate'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

### Issue: "Permission denied" errors
**Solution**: Make sure the `public.get_user_role()` function was created successfully:

```sql
-- Verify function exists
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_role';
-- Should show security_type = 'DEFINER'
```

---

## Next Steps

After completing this setup:

✅ RLS policies will work without infinite recursion
✅ Login/signup will complete successfully  
✅ Users will be redirected to correct dashboards
✅ Profile queries will return 200 instead of 500
✅ All CRUD operations will respect role-based access control

---

## Quick Reference

**Function to read role in policies:**
```sql
public.get_user_role(auth.uid())
```

**Example policy:**
```sql
CREATE POLICY "HR only"
  ON table_name FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'hr');
```

**Check current user role in SQL:**
```sql
SELECT public.get_user_role(auth.uid());
```

**Check any user's role:**
```sql
SELECT public.get_user_role('user-uuid-here');
```
