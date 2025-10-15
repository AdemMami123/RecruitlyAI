# Profile Management System

## Overview
Complete profile management system for both Candidate and HR users with editable fields, CV upload/download functionality, and AI-powered insights.

## Features Implemented

### ✅ Candidate Profile (`/candidate/profile`)

#### Personal Information
- **Full Name**: Editable text field
- **Email**: Read-only (from auth)
- **Phone Number**: Editable with icon

#### Skills & Expertise
- Dynamic skills management
- Add/remove skills with animated tags
- Visual skill badges with gradient styling
- Real-time updates to database

#### CV Management
- **Upload**: Support for PDF, DOC, DOCX files
- **Preview**: View CV in new tab
- **Download**: Download CV with proper filename
- **Status Indicator**: Visual confirmation when CV is uploaded
- **Storage**: Secured in Supabase Storage with RLS policies

#### AI-Powered Insights
- **Strengths**: Display AI-analyzed strong points from test results
- **Weaknesses**: Show areas for improvement with AI recommendations
- **Unlocked after test completion**: Motivates candidates to take tests

#### Quick Stats Sidebar
- Tests Completed counter
- Average Score percentage
- Tests In Progress tracker

### ✅ HR Profile (`/hr/profile`)

#### Personal Information
- **Full Name**: Editable text field
- **Email**: Read-only (from auth)
- **Phone Number**: Editable with icon

#### Company Information
- **Company Name**: Editable with company icon
- **Industry**: Editable industry selector/input
- Helps candidates learn about the organization

#### Recruitment Activity Overview
- **Tests Created**: Total number of tests authored
- **Active Tests**: Currently published tests
- **Total Candidates**: Unique candidates who took tests
- Color-coded stats cards with gradients

#### Quick Actions Sidebar
- Create New Test (links to test creation)
- View Candidates (links to candidates list)
- Manage Tests (links to test management)
- View Dashboard (back to dashboard)

#### Profile Completion Widget
- Progress bar showing completion percentage
- Calculated from filled fields (name, phone, company, industry)
- Animated progress bar with gradient
- Encouragement message when incomplete

## Technical Implementation

### Database Schema

```sql
-- Profiles table includes all necessary fields:
CREATE TABLE profiles (
  -- Shared fields
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('hr', 'candidate')),
  phone TEXT,
  
  -- Candidate-specific
  skills TEXT[],
  cv_url TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  total_tests_taken INTEGER,
  average_score DECIMAL,
  
  -- HR-specific
  company TEXT,
  industry TEXT,
  
  -- Timestamps
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Storage Configuration

```sql
-- CVs bucket for secure file storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false);

-- RLS Policies:
-- 1. Users can upload/update/delete their own CVs
-- 2. Users can view their own CVs
-- 3. HR users can view all candidate CVs
```

### File Structure

```
app/
├── candidate/
│   └── profile/
│       └── page.tsx          # Candidate profile page (700+ lines)
└── hr/
    └── profile/
        └── page.tsx          # HR profile page (500+ lines)

supabase/
└── schema.sql                # Updated with storage policies
```

### Key Functions

#### Candidate Profile
```typescript
loadProfile()              // Load user data from database
handleSaveProfile()        // Update profile information
handleCvUpload()           // Upload CV to Supabase Storage
handleDownloadCv()         // Download CV from storage
addSkill()                 // Add skill to array
removeSkill()              // Remove skill from array
```

#### HR Profile
```typescript
loadProfile()              // Load user data
loadStats()                // Calculate recruitment statistics
handleSaveProfile()        // Update profile information
```

### UI/UX Features

#### Design Elements
- **Gradient Cards**: Luxury design with `from-background to-primary/5`
- **Glass Morphism**: Subtle backdrop blur on cards
- **Hover Effects**: Shadow and scale animations
- **Motion Animations**: Framer Motion for smooth transitions
- **Icon Integration**: Lucide React icons throughout
- **Responsive Layout**: Mobile-first with lg:col-span-2 grid

#### User Experience
- **Edit Mode Toggle**: Clean separation between view and edit
- **Loading States**: Spinner during data fetching
- **Save/Cancel Actions**: Clear CTAs with loading indicators
- **Visual Feedback**: Success/error states for uploads
- **Role-based Routing**: Automatic redirect if wrong role

## Usage

### For Candidates

1. **Access Profile**: Click "Profile" button in dashboard header
2. **Edit Information**: Click "Edit Profile" button
3. **Update Details**: Modify name, phone as needed
4. **Manage Skills**: Add skills one by one, remove with X button
5. **Upload CV**: 
   - Click file input, select PDF/DOC/DOCX
   - Click "Upload CV" button
   - Wait for confirmation
6. **View Insights**: Check strengths/weaknesses after completing tests

### For HR Users

1. **Access Profile**: Click "Profile" button in dashboard header
2. **Edit Information**: Click "Edit Profile" button
3. **Update Details**: Modify name, phone, company, industry
4. **Save Changes**: Click "Save Changes" button
5. **View Stats**: Check recruitment activity overview
6. **Quick Actions**: Use sidebar buttons for common tasks

## Security

### Row Level Security (RLS)
- ✅ Users can only update their own profile
- ✅ Users can only upload CVs to their own folder
- ✅ HR can view all candidate CVs (read-only)
- ✅ Candidates cannot access HR profiles and vice versa

### File Upload Security
- ✅ File validation (PDF, DOC, DOCX only)
- ✅ Filename sanitization with user ID prefix
- ✅ Unique filenames using timestamp
- ✅ Secure signed URLs for temporary access
- ✅ Folder-based organization (user_id/filename)

## API Integration Points

### Supabase Operations

```typescript
// Profile queries
supabase.from('profiles').select('*').eq('id', user.id).single()
supabase.from('profiles').update({ ... }).eq('id', user.id)

// Storage operations
supabase.storage.from('cvs').upload(filePath, file)
supabase.storage.from('cvs').download(cv_url)
supabase.storage.from('cvs').createSignedUrl(cv_url, 3600)

// Stats queries (HR only)
supabase.from('tests').select('*', { count: 'exact' }).eq('created_by', user.id)
supabase.from('test_assignments').select('candidate_id')
```

## Future Enhancements (Pending)

### Gemini AI Integration
- [ ] Analyze test results to generate strengths
- [ ] Identify weaknesses based on performance patterns
- [ ] Provide personalized improvement recommendations
- [ ] Generate skill gap analysis

### Additional Features
- [ ] Profile picture upload
- [ ] Social media links
- [ ] Certificate uploads
- [ ] Public profile URLs
- [ ] Export profile as PDF

## Navigation Integration

Both dashboards now include profile access:

**HR Dashboard:**
```tsx
<Button onClick={() => router.push('/hr/profile')}>
  <User className="h-4 w-4 mr-2" />
  Profile
</Button>
```

**Candidate Dashboard:**
```tsx
<Button onClick={() => router.push('/candidate/profile')}>
  <User className="h-4 w-4 mr-2" />
  Profile
</Button>
```

## Testing Checklist

- [x] Candidate can view their profile
- [x] Candidate can edit personal information
- [x] Candidate can add/remove skills
- [x] Candidate can upload CV
- [x] Candidate can view uploaded CV
- [x] Candidate can download CV
- [x] HR can view their profile
- [x] HR can edit company information
- [x] HR can see recruitment statistics
- [x] Profile completion percentage updates
- [x] Role-based redirects work correctly
- [x] Edit mode toggle works properly
- [x] All animations render smoothly

## Known Limitations

1. **AI Analysis**: Currently displays placeholder data until Gemini integration is complete
2. **Stats Accuracy**: Stats rely on database aggregation queries that require test data
3. **File Size**: No explicit file size limit enforced (Supabase default applies)
4. **File Preview**: PDF preview opens in new tab, no inline viewer

## Performance Considerations

- Profile data cached in component state
- Signed URLs expire after 1 hour (3600 seconds)
- Stats loaded separately to avoid blocking main profile load
- Optimistic UI updates for better perceived performance
- Lazy loading of CV preview URLs

---

**Status**: ✅ Core functionality complete | 🔄 AI integration pending
**Last Updated**: October 15, 2025
