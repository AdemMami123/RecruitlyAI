# 🎯 Getting Started Checklist

Follow these steps in order to get your Recruitly AI project running!

## ☑️ Pre-Setup (5 minutes)

- [ ] Node.js 18+ installed
- [ ] VS Code (or preferred editor) installed
- [ ] Git installed
- [ ] Terminal/Command line access

## 📝 Step 1: Initial Setup (5 minutes)

- [ ] Navigate to project directory
- [ ] Open terminal in project root
- [ ] Run `npm install` to install dependencies
- [ ] Wait for installation to complete

## 🔑 Step 2: Get Your API Keys (10 minutes)

### Supabase Setup
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create account / Login
- [ ] Click "New Project"
- [ ] Fill in project details:
  - Name: `recruitly-ai`
  - Strong password
  - Choose region
- [ ] Wait for project creation (~2 minutes)
- [ ] Go to Project Settings > API
- [ ] Copy **Project URL**
- [ ] Copy **anon/public key**

### Gemini API Setup
- [ ] Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Sign in with Google account
- [ ] Click "Get API Key"
- [ ] Click "Create API key in new project"
- [ ] Copy the API key

## ⚙️ Step 3: Configure Environment (2 minutes)

- [ ] Open `.env.local` file in project root
- [ ] Replace `your_supabase_url_here` with your Supabase Project URL
- [ ] Replace `your_supabase_anon_key_here` with your Supabase anon key
- [ ] Replace `your_gemini_api_key_here` with your Gemini API key
- [ ] Save the file

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyB...
```

## 🚀 Step 4: Start Development Server (1 minute)

- [ ] Open terminal in project root
- [ ] Run `npm run dev`
- [ ] Wait for "Ready" message
- [ ] Open browser to `http://localhost:3000`

## ✅ Step 5: Test Your Setup (5 minutes)

### Test Landing Page
- [ ] Visit `http://localhost:3000`
- [ ] Page loads without errors
- [ ] Theme toggle works (moon/sun icon)
- [ ] Navigation links visible
- [ ] Animations are smooth

### Test Theme System
- [ ] Click theme toggle in header
- [ ] Colors change smoothly
- [ ] All text remains readable
- [ ] Toggle back to original theme

### Test Signup
- [ ] Click "Get Started" or "Sign Up"
- [ ] Fill in signup form:
  - Full Name
  - Email address
  - Password (min 6 chars)
  - Confirm Password (must match)
- [ ] Click "Create Account"
- [ ] Should redirect to dashboard

### Test Dashboard
- [ ] Dashboard page loads
- [ ] Welcome message shows your name
- [ ] Stats cards are visible (4 cards)
- [ ] Quick actions section visible
- [ ] Logout button works

### Test Login
- [ ] Click "Logout"
- [ ] Go to `/login`
- [ ] Enter your credentials
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard

### Test Protected Routes
- [ ] While logged out, try visiting `/dashboard`
- [ ] Should redirect to `/login`
- [ ] Login
- [ ] Try visiting `/dashboard` again
- [ ] Should now work

### Test Mobile Responsiveness
- [ ] Open browser dev tools (F12)
- [ ] Toggle device toolbar (mobile view)
- [ ] Check all pages look good on mobile
- [ ] Test mobile menu (hamburger icon)

## 🎨 Step 6: Verify Supabase (3 minutes)

- [ ] Go to Supabase Dashboard
- [ ] Click on your project
- [ ] Go to **Authentication** > **Users**
- [ ] See your test user listed
- [ ] Note: Email is not verified yet (that's ok!)

## 📚 Step 7: Review Documentation (10 minutes)

Read through these files to understand the project:

- [ ] `README.md` - Project overview and features
- [ ] `QUICKSTART.md` - Quick reference guide
- [ ] `PROJECT_SUMMARY.md` - What's been built
- [ ] `SUPABASE_SETUP.md` - Detailed database setup (for Phase 2)
- [ ] `GEMINI_SETUP.md` - AI integration guide (for Phase 2)

## 🎯 Step 8: Optional - Explore Code (15 minutes)

Understanding the structure:

### Core Files
- [ ] `app/page.tsx` - Landing page
- [ ] `app/layout.tsx` - Root layout with theme
- [ ] `app/globals.css` - Styles and theme variables

### Authentication
- [ ] `app/login/page.tsx` - Login form
- [ ] `app/signup/page.tsx` - Signup form
- [ ] `middleware.ts` - Route protection
- [ ] `lib/supabase/client.ts` - Browser Supabase client

### Components
- [ ] `components/header.tsx` - Navigation header
- [ ] `components/theme-toggle.tsx` - Dark/light toggle
- [ ] `components/ui/` - Shadcn components

### Dashboard
- [ ] `app/dashboard/page.tsx` - Dashboard with stats

## 🐛 Troubleshooting

If something doesn't work:

### Dev Server Won't Start
- [ ] Check if another process is using port 3000
- [ ] Try `npm install` again
- [ ] Delete `node_modules` and `.next`, then run `npm install`

### Authentication Errors
- [ ] Verify `.env.local` has correct values
- [ ] Restart dev server after changing env vars
- [ ] Check Supabase project is active (not paused)
- [ ] Clear browser cookies/cache

### Theme Not Working
- [ ] Check browser console for errors
- [ ] Verify theme toggle button appears
- [ ] Try hard refresh (Ctrl+F5)

### CSS/Styles Issues
- [ ] Restart dev server
- [ ] Check `tailwind.config.ts` exists
- [ ] Verify `globals.css` is imported in layout

### TypeScript Errors
- [ ] Run `npm install` again
- [ ] Restart VS Code
- [ ] Check `tsconfig.json` exists

## ✨ Success!

If all checkboxes are ticked, you're ready to start building!

### What You Can Do Now:
✅ Browse the landing page
✅ Create user accounts
✅ Login/logout
✅ Access protected dashboard
✅ Toggle dark/light theme
✅ View on mobile/desktop

### What's Next (Phase 2):
- Build candidate management
- Create test generation with AI
- Add analytics dashboard
- Implement team features

## 🎊 Congratulations!

Your **Recruitly AI** development environment is fully set up and ready!

---

**Questions?** Check the documentation files or review the code examples.

**Ready to code?** Start with Phase 2 features!

**Need help?** All setup guides are in the project root.

---

**Built with ❤️ using Next.js, Supabase, and AI**
