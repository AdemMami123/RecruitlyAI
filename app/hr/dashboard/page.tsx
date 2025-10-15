'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, BarChart3, TrendingUp, Loader2, Plus, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motionVariants } from '@/lib/design-system'

const stats = [
  {
    title: 'Total Candidates',
    value: '0',
    change: '+0%',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Active Tests',
    value: '0',
    change: '+0%',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Completed Tests',
    value: '0',
    change: '+0%',
    icon: BarChart3,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Avg Score',
    value: '0%',
    change: '+0%',
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
  },
]

export default function HRDashboardPage() {
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

      // Check if user is HR
      if (profile.role !== 'hr') {
        router.push('/candidate/dashboard')
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
              Welcome back, {profile?.full_name}! 👋
            </motion.h1>
            <p className="text-muted-foreground">
              Here's what's happening with your recruitment today.
            </p>
          </div>
          <div className="flex gap-2">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600 font-semibold">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-auto py-6 flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span>Create Test</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Add Candidate</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                <Search className="h-6 w-6" />
                <span>Browse Candidates</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest recruitment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm mt-2">Start by creating your first test or adding candidates</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
