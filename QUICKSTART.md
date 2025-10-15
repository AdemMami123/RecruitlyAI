# 📋 Quick Start Guide - Recruitly AI

## ⚡ Get Up and Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Project Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | ❌ |
| `/login` | User login | ❌ |
| `/signup` | User registration | ❌ |
| `/dashboard` | Main dashboard | ✅ |
| `/candidates` | Candidate management | ✅ (Coming soon) |
| `/tests` | Test management | ✅ (Coming soon) |
| `/analytics` | Analytics dashboard | ✅ (Coming soon) |

---

## 🎨 UI Components Library

### Already Installed
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Switch
- ✅ Dropdown Menu
- ✅ Avatar
- ✅ Sheet (Mobile menu)

### Add More Components
```bash
npx shadcn@latest add [component-name]
```

Example components to add:
- `dialog` - For modals
- `table` - For data tables
- `form` - For form handling
- `select` - For dropdowns
- `toast` - For notifications
- `tabs` - For tabbed interfaces

---

## 🎯 Component Usage Examples

### Theme Toggle
```tsx
import { ThemeToggle } from '@/components/theme-toggle'

<ThemeToggle />
```

### Button with Gradient
```tsx
<Button className="bg-gradient-to-r from-primary to-accent">
  Click Me
</Button>
```

### Card Component
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Motion Animation
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>
```

---

## 🔐 Authentication Usage

### Client Component
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

---

## 🎨 Using the Luxury Color Palette

### In Tailwind Classes
```tsx
// Primary (Deep Blue)
<div className="bg-primary text-primary-foreground">

// Accent (Gold)
<div className="bg-accent text-accent-foreground">

// Gradient
<div className="bg-gradient-to-r from-primary to-accent">

// Border
<div className="border-2 border-primary/50">
```

### In Custom CSS
```css
.custom-class {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

---

## 📂 Folder Structure Best Practices

```
app/
├── (auth)/              # Route group for auth pages
│   ├── login/
│   └── signup/
├── (dashboard)/         # Route group for protected pages
│   ├── dashboard/
│   ├── candidates/
│   └── tests/
├── api/                 # API routes
│   ├── generate-test/
│   └── analyze/
└── layout.tsx           # Root layout

components/
├── ui/                  # Shadcn components (don't edit)
├── forms/               # Custom form components
├── layouts/             # Layout components
└── features/            # Feature-specific components

lib/
├── supabase/            # Supabase clients
├── gemini.ts            # Gemini AI helpers
├── utils.ts             # Utility functions
└── validators.ts        # Validation schemas
```

---

## 🚀 Deployment Checklist

### Before Deploying
- [ ] Set all environment variables in production
- [ ] Update Supabase redirect URLs
- [ ] Test authentication flow
- [ ] Run `npm run build` locally
- [ ] Check for TypeScript errors
- [ ] Verify API routes work

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Vercel
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

---

## 🐛 Common Issues & Solutions

### Issue: White screen after deployment
**Solution:** Check browser console for errors. Usually related to missing environment variables.

### Issue: Authentication not working
**Solution:** 
1. Verify Supabase credentials
2. Check redirect URLs in Supabase settings
3. Clear browser cache/cookies

### Issue: Tailwind styles not applying
**Solution:**
1. Restart dev server
2. Check `tailwind.config.ts` is correct
3. Verify `globals.css` is imported

### Issue: Components not found
**Solution:**
1. Check import paths use `@/` alias
2. Verify file exists in correct location
3. Restart TypeScript server in VS Code

---

## 📚 Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Shadcn UI
npx shadcn@latest add button    # Add component
npx shadcn@latest init          # Reinitialize config

# Supabase (if using local)
npx supabase init               # Initialize Supabase locally
npx supabase start              # Start local Supabase
npx supabase db push            # Push schema changes

# Git
git add .
git commit -m "message"
git push
```

---

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Shadcn/UI
- [Component Docs](https://ui.shadcn.com/docs/components)
- [Theming Guide](https://ui.shadcn.com/docs/theming)
- [Examples](https://ui.shadcn.com/examples)

### Gemini API
- [Gemini Documentation](https://ai.google.dev/docs)
- [Prompt Guide](https://ai.google.dev/docs/prompt_best_practices)

---

## 💡 Pro Tips

1. **Use TypeScript**: Take advantage of type safety
2. **Component Composition**: Break down complex components
3. **Server Components**: Use them by default, add 'use client' only when needed
4. **Optimize Images**: Use Next.js Image component
5. **Error Boundaries**: Add error handling to protect your app
6. **Loading States**: Always show loading indicators
7. **Responsive Design**: Test on mobile, tablet, and desktop
8. **Accessibility**: Use semantic HTML and ARIA labels
9. **Performance**: Use React.memo and useMemo for optimization
10. **Version Control**: Commit often with clear messages

---

## 🎯 Next Steps

Now that your project is set up:

1. ✅ Configure Supabase (see `SUPABASE_SETUP.md`)
2. ✅ Set up Gemini API (see `GEMINI_SETUP.md`)
3. ✅ Test authentication flow
4. 🚧 Create candidate management
5. 🚧 Build test generation feature
6. 🚧 Add analytics dashboard

**Happy coding!** 🚀
