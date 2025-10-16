'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, Mail, Phone, Upload, FileText, Loader2, Save, Edit, 
  Award, TrendingDown, BarChart3, Download, Eye, X, MapPin, Briefcase, Link2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motionVariants } from '@/lib/design-system'

export default function CandidateProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Check if user is Candidate
      if (profile.role !== 'candidate') {
        router.push('/hr/profile')
        return
      }

      setUser(user)
      setProfile(profile)
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setTitle(profile.title || '')
      setLocation(profile.location || '')
      setExperienceYears(profile.experience_years?.toString() || '')
      setBio(profile.bio || '')
      setLinkedinUrl(profile.linkedin_url || '')
      setGithubUrl(profile.github_url || '')
      setPortfolioUrl(profile.portfolio_url || '')
      setSkills(profile.skills || [])
      
      // Load CV preview URL if CV exists
      if (profile.cv_url) {
        const { data: signedUrl } = await supabase
          .storage
          .from('cvs')
          .createSignedUrl(profile.cv_url, 3600)
        
        if (signedUrl) {
          setCvPreviewUrl(signedUrl.signedUrl)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) {
      alert('User not authenticated')
      return
    }

    setSaving(true)
    try {
      console.log('Updating profile for user:', user.id)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          title: title,
          location: location,
          experience_years: experienceYears ? parseInt(experienceYears) : null,
          bio: bio,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl,
          skills: skills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()

      console.log('Update response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Reload profile
      await loadProfile()
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCvUpload = async () => {
    if (!cvFile || !user) {
      alert('Please select a file and ensure you are logged in')
      return
    }

    setUploading(true)
    try {
      // Generate unique filename
      const fileExt = cvFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, cvFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Update profile with CV URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cv_url: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Reload profile
      await loadProfile()
      setCvFile(null)
    } catch (error) {
      console.error('Error uploading CV:', error)
      alert('Failed to upload CV')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadCv = async () => {
    if (!profile?.cv_url) return

    try {
      const { data, error } = await supabase.storage
        .from('cvs')
        .download(profile.cv_url)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV-${profile.full_name.replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading CV:', error)
      alert('Failed to download CV')
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          {...motionVariants.fadeInDown}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your personal information and career details
              </p>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Your basic profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!editing}
                      className="text-lg"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile?.email || user?.email}
                        disabled
                        className="pl-10 bg-muted/50"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!editing}
                        placeholder="+1 (555) 000-0000"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!editing}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={!editing}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      disabled={!editing}
                      placeholder="e.g. 5"
                      min="0"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!editing}
                      placeholder="Tell us about yourself..."
                      className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      disabled={!editing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={!editing}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  {/* Portfolio */}
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      disabled={!editing}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  {editing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveProfile} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button onClick={() => setEditing(false)} variant="outline" disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skills & Expertise
                  </CardTitle>
                  <CardDescription>Showcase your professional skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Skills Display */}
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20"
                        >
                          <span className="font-medium">{skill}</span>
                          {editing && (
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills added yet. Add your skills to showcase your expertise!</p>
                    )}
                  </div>

                  {/* Add Skill */}
                  {editing && (
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., React, Python)"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* AI-Generated Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance Insights
                  </CardTitle>
                  <CardDescription>AI-powered analysis of your strengths and areas for improvement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-500" />
                      Strengths
                    </h3>
                    {profile?.strengths && profile.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {profile.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">Complete tests to unlock AI-powered strength analysis</p>
                    )}
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-500" />
                      Areas for Improvement
                    </h3>
                    {profile?.weaknesses && profile.weaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {profile.weaknesses.map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                            <span className="text-muted-foreground">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">Complete tests to unlock AI-powered improvement recommendations</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - CV Upload & Stats */}
          <div className="space-y-6">
            {/* CV Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Curriculum Vitae
                  </CardTitle>
                  <CardDescription>Upload your CV for HR review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.cv_url ? (
                    <>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-700 dark:text-green-300">CV Uploaded</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400">Your CV is visible to recruiters</p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {cvPreviewUrl && (
                          <Button variant="outline" className="w-full" onClick={() => window.open(cvPreviewUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View CV
                          </Button>
                        )}
                        <Button variant="outline" className="w-full" onClick={handleDownloadCv}>
                          <Download className="h-4 w-4 mr-2" />
                          Download CV
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <Label htmlFor="cvFile" className="text-sm text-muted-foreground">
                          Upload new CV to replace current
                        </Label>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-600 dark:text-orange-400">No CV uploaded yet. Upload your CV to increase visibility!</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Input
                      id="cvFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                    />
                    {cvFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {cvFile.name}
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={handleCvUpload} 
                    disabled={!cvFile || uploading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CV
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tests Completed</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {profile?.tests_completed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {profile?.average_score || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tests In Progress</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {profile?.tests_in_progress || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
