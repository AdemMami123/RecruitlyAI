'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, Mail, Phone, Building2, Briefcase, Loader2, Save, Edit, 
  FileText, Users, BarChart3, Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motionVariants } from '@/lib/design-system'

export default function HRProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    testsCreated: 0,
    totalCandidates: 0,
    activeTests: 0,
  })
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
    loadStats()
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

      // Check if user is HR
      if (profile.role !== 'hr') {
        router.push('/candidate/profile')
        return
      }

      setUser(user)
      setProfile(profile)
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setCompany(profile.company || '')
      setIndustry(profile.industry || '')
      setTitle(profile.title || '')
      setLocation(profile.location || '')
      setBio(profile.bio || '')
      setLinkedinUrl(profile.linkedin_url || '')
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get tests created by this HR
      const { count: testsCount } = await supabase
        .from('tests')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)

      // Get active tests (published and not expired)
      const { count: activeCount } = await supabase
        .from('tests')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('is_published', true)

      // Get unique candidates who have taken tests
      // First get all test IDs for this HR
      const { data: testIds } = await supabase
        .from('tests')
        .select('id')
        .eq('created_by', user.id)

      const testIdArray = testIds?.map(t => t.id) || []
      
      let uniqueCandidates = 0
      
      // Only query assignments if there are tests
      if (testIdArray.length > 0) {
        const { data: assignments } = await supabase
          .from('test_assignments')
          .select('candidate_id')
          .in('test_id', testIdArray)

        uniqueCandidates = new Set(assignments?.map(a => a.candidate_id) || []).size
      }

      setStats({
        testsCreated: testsCount || 0,
        totalCandidates: uniqueCandidates,
        activeTests: activeCount || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
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
          company: company,
          industry: industry,
          title: title,
          location: location,
          bio: bio,
          linkedin_url: linkedinUrl,
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
                Manage your company information and recruiter details
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Information
                  </CardTitle>
                  <CardDescription>Details about your organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        disabled={!editing}
                        placeholder="Acme Corporation"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        disabled={!editing}
                        placeholder="Technology, Finance, Healthcare, etc."
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
                      placeholder="e.g. HR Manager, Recruiter"
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
                      placeholder="e.g. New York, NY"
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
                      placeholder="Tell us about yourself and your company..."
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

            {/* Activity Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Recruitment Activity
                  </CardTitle>
                  <CardDescription>Overview of your recruiting activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.testsCreated}
                        </span>
                      </div>
                      <p className="text-sm font-medium">Tests Created</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.activeTests}
                        </span>
                      </div>
                      <p className="text-sm font-medium">Active Tests</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.totalCandidates}
                        </span>
                      </div>
                      <p className="text-sm font-medium">Total Candidates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Stats Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Manage your recruitment tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={() => router.push('/hr/tests/create')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Test
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/hr/candidates')}>
                    <Users className="h-4 w-4 mr-2" />
                    View Candidates
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/hr/tests')}>
                    <Award className="h-4 w-4 mr-2" />
                    Manage Tests
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/hr/dashboard')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Completion */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const fields = [fullName, phone, company, industry]
                    const completed = fields.filter(f => f && f.trim()).length
                    const percentage = Math.round((completed / fields.length) * 100)
                    
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-primary to-accent"
                            />
                          </div>
                        </div>
                        {percentage < 100 && (
                          <p className="text-sm text-muted-foreground">
                            Complete your profile to help candidates learn more about your company!
                          </p>
                        )}
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
