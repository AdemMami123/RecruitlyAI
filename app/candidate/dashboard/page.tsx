'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Award, Clock, TrendingUp, Loader2, Play, Eye, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motionVariants } from '@/lib/design-system'

const stats = [
  {
    title: 'Tests Available',
    value: '0',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Tests Completed',
    value: '0',
    icon: Award,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'In Progress',
    value: '0',
    icon: Clock,
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Average Score',
    value: '0%',
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
  },
]

export default function CandidateDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
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

      if (error || !profile) {
        console.error('Profile error:', error)
        router.push('/login')
        return
      }

      // Check if user is Candidate
      if (profile.role !== 'candidate') {
        router.push('/hr/dashboard')
        return
      }

      setUser(user)
      setProfile(profile)
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
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
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <motion.h1
              {...motionVariants.fadeInDown}
              className="text-3xl font-bold mb-2"
            >
              Welcome, {profile?.full_name}! 🎯
            </motion.h1>
            <p className="text-muted-foreground">
              Ready to showcase your skills? Let's get started!
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/candidate/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 card-hover hover:shadow-xl hover:shadow-primary/10 bg-gradient-to-br from-background to-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Available Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Available Tests</CardTitle>
              <CardDescription>
                Tests assigned to you by recruiters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tests available yet</p>
                <p className="text-sm mt-2">Check back soon for new opportunities!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Your completed tests and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed tests yet</p>
                <p className="text-sm mt-2">Start taking tests to see your results here</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-2 border-dashed border-primary/50">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Add more information to help recruiters find you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile completion</span>
                <span className="text-sm font-bold">30%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: '30%' }} />
              </div>
              <Button variant="outline" className="w-full">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
