# Supabase Setup Guide for Recruitly AI

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the details:
   - **Name**: recruitly-ai
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient for development

## 2. Get Your Project Credentials

1. Once your project is created, go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
4. Paste these into your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 3. Set Up Authentication

Supabase Auth is already configured! The following providers are enabled by default:
- ✅ Email/Password authentication
- ✅ Magic Links (optional)

### Email Configuration (Optional but Recommended)

1. Go to **Authentication** > **Providers** > **Email**
2. Enable "Confirm email" if you want email verification
3. For production, configure your own SMTP settings in **Project Settings** > **Auth**

### Custom Email Templates (Optional)

1. Go to **Authentication** > **Email Templates**
2. Customize the following:
   - Confirmation email
   - Reset password email
   - Magic link email

## 4. Database Schema (Future Phases)

You'll need to create these tables in Phase 2:

### Candidates Table
```sql
create table candidates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  full_name text not null,
  email text not null,
  phone text,
  position text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table candidates enable row level security;

-- Create policy
create policy "Users can manage their own candidates"
  on candidates for all
  using (auth.uid() = user_id);
```

### Tests Table
```sql
create table tests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  candidate_id uuid references candidates(id),
  title text not null,
  description text,
  questions jsonb,
  duration integer, -- in minutes
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table tests enable row level security;

-- Create policy
create policy "Users can manage their own tests"
  on tests for all
  using (auth.uid() = user_id);
```

### Test Results Table
```sql
create table test_results (
  id uuid default uuid_generate_v4() primary key,
  test_id uuid references tests(id) not null,
  candidate_id uuid references candidates(id) not null,
  answers jsonb,
  score numeric,
  ai_analysis jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table test_results enable row level security;

-- Create policy
create policy "Users can view results for their tests"
  on test_results for select
  using (
    test_id in (
      select id from tests where user_id = auth.uid()
    )
  );
```

## 5. Storage (For Future Use)

1. Go to **Storage** in Supabase dashboard
2. Create the following buckets:
   - `candidate-resumes` - For storing candidate CVs/resumes
   - `test-attachments` - For test-related files

### Set Bucket Policies

For `candidate-resumes`:
```sql
-- Allow authenticated users to upload
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'candidate-resumes');

-- Allow authenticated users to view
create policy "Allow authenticated access"
on storage.objects for select
to authenticated
using (bucket_id = 'candidate-resumes');
```

## 6. Security Best Practices

### Row Level Security (RLS)
- ✅ Always enable RLS on your tables
- ✅ Create policies that restrict access based on `auth.uid()`
- ✅ Test your policies thoroughly

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use different projects for development and production
- ✅ Rotate your API keys if they're exposed

### API Keys
- ✅ The `anon` key is safe for client-side use
- ✅ The `service_role` key should NEVER be exposed to clients
- ✅ Use server-side functions for sensitive operations

## 7. Testing Your Setup

### Test Authentication
1. Run your Next.js app: `npm run dev`
2. Navigate to `/signup`
3. Create a test account
4. Check Supabase **Authentication** > **Users** to see your new user

### Verify Database Connection
1. Go to Supabase **SQL Editor**
2. Run: `SELECT * FROM auth.users;`
3. You should see your test user

## 8. Next Steps

Once authentication is working:
1. Create the database schema (tables from step 4)
2. Set up storage buckets
3. Implement the candidate management features
4. Integrate Gemini API for AI features

## 9. Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 10. Troubleshooting

### Issue: Can't connect to Supabase
- ✅ Verify your `.env.local` file has the correct credentials
- ✅ Make sure you restarted your Next.js dev server after adding env vars
- ✅ Check if your Supabase project is active (not paused)

### Issue: Authentication not working
- ✅ Check browser console for errors
- ✅ Verify email provider is enabled in Supabase
- ✅ Check if email confirmations are required
- ✅ Look at Supabase **Logs** for auth errors

### Issue: Database queries failing
- ✅ Ensure RLS policies are correctly configured
- ✅ Check if tables exist in your database
- ✅ Verify you're using the correct user context

---

**Need Help?** Check the [Supabase Discord](https://discord.supabase.com/) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)
