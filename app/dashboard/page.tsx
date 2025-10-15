'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, BarChart3, TrendingUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const stats = [
  {
    title: 'Total Candidates',
    value: '0',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Active Tests',
    value: '0',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Completed Tests',
    value: '0',
    icon: BarChart3,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Average Score',
    value: '0%',
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

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
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              Welcome back, {user?.user_metadata?.full_name || 'User'}!
            </motion.h1>
            <p className="text-muted-foreground">
              Here's what's happening with your recruitment today.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No data available yet
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
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your recruitment workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-auto py-6 flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Add Candidate</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Create Test</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">More Features Coming Soon</CardTitle>
              <CardDescription className="text-base">
                We're building amazing AI-powered features to revolutionize your recruitment process
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
