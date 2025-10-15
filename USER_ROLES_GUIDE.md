# 🎭 User Roles & Authentication Guide

## Overview

Recruitly AI supports two distinct user roles with separate dashboards and permissions:
- **HR / Recruiter** - Create tests, manage candidates, analyze results
- **Job Seeker / Candidate** - Take tests, view results, get feedback

---

## 🎯 Features Implemented

### ✅ Multi-Step Signup Process
1. **Step 1: Role Selection** - User chooses between HR or Candidate
2. **Step 2: Account Details** - User enters name, email, and password

### ✅ Role-Based Routing
- Automatic redirection based on user role after login
- Protected routes prevent unauthorized access
- Middleware enforces role-based access control

### ✅ Separate Dashboards
- **HR Dashboard** (`/hr/dashboard`) - Recruitment management interface
- **Candidate Dashboard** (`/candidate/dashboard`) - Test-taking interface

### ✅ Database Schema
- `profiles` table stores user roles and metadata
- Row Level Security (RLS) policies for data protection
- Automatic profile creation on signup

---

## 📊 Database Schema

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,          -- References auth.users.id
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,           -- 'hr' or 'candidate'
  avatar_url TEXT,
  company TEXT,
  position TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Setup Instructions

1. **Navigate to Supabase SQL Editor**
   - Go to your project dashboard
   - Click on "SQL Editor" in the sidebar

2. **Run the Schema**
   - Copy the contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Table Creation**
   - Go to "Table Editor"
   - Confirm `profiles` table exists
   - Check that RLS is enabled

---

## 🔐 Authentication Flow

### Signup Flow

```
User visits /signup
  ↓
Step 1: Selects role (HR or Candidate)
  ↓
Step 2: Fills in details (name, email, password)
  ↓
Account created in Supabase Auth
  ↓
Profile created in profiles table
  ↓
User redirected to role-specific dashboard
```

### Login Flow

```
User visits /login
  ↓
Enters email and password
  ↓
Supabase Auth verification
  ↓
Fetch user profile from profiles table
  ↓
Redirect to role-specific dashboard
  (/hr/dashboard or /candidate/dashboard)
```

---

## 🛣️ Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup with role selection

### Protected Routes (HR Only)
- `/hr/dashboard` - HR dashboard
- `/hr/candidates` - Candidate management (coming soon)
- `/hr/tests` - Test creation & management (coming soon)
- `/hr/analytics` - Analytics dashboard (coming soon)

### Protected Routes (Candidate Only)
- `/candidate/dashboard` - Candidate dashboard
- `/candidate/tests` - Available & completed tests (coming soon)
- `/candidate/profile` - Profile management (coming soon)
- `/candidate/results` - Test results & feedback (coming soon)

### Legacy Route
- `/dashboard` - Auto-redirects to role-specific dashboard

---

## 🔒 Security & Permissions

### Row Level Security (RLS) Policies

#### View Own Profile
```sql
Users can view their own profile
USING (auth.uid() = id)
```

#### Update Own Profile
```sql
Users can update their own profile
USING (auth.uid() = id)
```

#### HR View Candidates
```sql
HR can view candidate profiles
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'hr'
  AND role = 'candidate'
)
```

### Middleware Protection

The middleware (`lib/supabase/middleware.ts`) enforces:
1. **Authentication Check** - Redirects to `/login` if not authenticated
2. **Role-Based Access** - Prevents HR from accessing candidate routes and vice versa
3. **Auto-Redirect** - Sends `/dashboard` to appropriate role-specific dashboard

---

## 🎨 UI/UX Design Enhancements

### Design System
- **File**: `lib/design-system.ts`
- Comprehensive design tokens (spacing, typography, colors)
- Reusable animation variants
- Responsive design utilities

### Animations
- Page transitions with Framer Motion
- Card hover effects
- Smooth element entrances
- Staggered animations for lists

### CSS Enhancements
- Glass morphism effects
- Gradient text utilities
- Custom animations (fadeIn, slideIn, scaleIn)
- Smooth transitions for interactive elements

---

##  💻 Code Examples

### Check User Role (Client Component)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Get current user's role
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  console.log('User role:', profile?.role)
}
```

### Protected Page Template

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile.role !== 'hr') {
        router.push('/candidate/dashboard')
        return
      }

      setProfile(profile)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>

  return <div>Protected Content</div>
}
```

### Using Design System

```typescript
import { motionVariants, responsive } from '@/lib/design-system'
import { motion } from 'framer-motion'

// Fade in animation
<motion.div {...motionVariants.fadeInUp}>
  Content
</motion.div>

// Responsive grid
<div className={responsive.grid.threeCol}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>
```

---

## 🧪 Testing Your Implementation

### 1. Test Signup Flow

**As HR:**
```
1. Go to /signup
2. Select "HR / Recruiter" role
3. Fill in details
4. Submit
5. Verify redirect to /hr/dashboard
6. Check Supabase profiles table for new entry
```

**As Candidate:**
```
1. Go to /signup
2. Select "Job Seeker" role
3. Fill in details
4. Submit
5. Verify redirect to /candidate/dashboard
6. Check profile role is 'candidate'
```

### 2. Test Login Flow

```
1. Logout if logged in
2. Go to /login
3. Enter credentials
4. Verify redirect to correct dashboard based on role
5. Try accessing opposite role's dashboard (should redirect)
```

### 3. Test Route Protection

```
1. While logged in as HR:
   - Try visiting /candidate/dashboard
   - Should redirect to /hr/dashboard

2. While logged in as Candidate:
   - Try visiting /hr/dashboard
   - Should redirect to /candidate/dashboard

3. While logged out:
   - Try visiting any protected route
   - Should redirect to /login
```

### 4. Test Animations

```
1. Navigate between pages
2. Watch for smooth transitions
3. Hover over cards for effects
4. Check mobile menu animations
5. Test theme toggle animation
```

---

## 🐛 Troubleshooting

### Issue: "Table 'profiles' does not exist"
**Solution:** Run the schema.sql file in Supabase SQL Editor

### Issue: User can access wrong dashboard
**Solution:** 
- Clear browser cache
- Check middleware is running
- Verify profiles table has correct role value

### Issue: Signup creates user but not profile
**Solution:**
- Check Supabase logs for errors
- Verify RLS policies allow INSERT
- Check browser console for errors

### Issue: Animations not working
**Solution:**
- Verify Framer Motion is installed
- Check that components are client components ('use client')
- Clear .next folder and rebuild

---

## 📝 Next Steps

### Phase 3: Core Features (Coming Soon)

1. **Candidate Management (HR)**
   - Add/edit candidates
   - Search & filter
   - Bulk actions

2. **Test Creation (HR)**
   - AI-powered question generation
   - Test templates
   - Question bank

3. **Test Taking (Candidate)**
   - Timer functionality
   - Auto-save
   - Submit & review

4. **Analytics**
   - Performance metrics
   - Skill breakdown
   - Comparison reports

---

## 🎓 Best Practices

### Security
- ✅ Always verify user role server-side
- ✅ Use RLS policies for database access
- ✅ Never trust client-side role checks alone
- ✅ Validate all user inputs

### Performance
- ✅ Cache user profile data
- ✅ Use React.memo for expensive components
- ✅ Implement pagination for large lists
- ✅ Optimize images and assets

### User Experience
- ✅ Show loading states
- ✅ Provide clear error messages
- ✅ Use smooth animations
- ✅ Make mobile-first designs

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Built with ❤️ by the Recruitly AI Team**
