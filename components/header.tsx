'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Sparkles, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserProfileMenu } from '@/components/user-profile-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Candidates', href: '/candidates' },
  { name: 'Tests', href: '/tests' },
  { name: 'Analytics', href: '/analytics' },
]

interface UserProfile {
  id: string
  email?: string
  full_name?: string
  role?: 'hr' | 'candidate'
  avatar_url?: string
}

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, avatar_url')
            .eq('id', authUser.id)
            .single()

          if (profile) {
            setUser(profile)
          } else {
            // Fallback to auth user data
            setUser({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name,
              role: authUser.user_metadata?.role,
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile)
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            role: session.user.user_metadata?.role,
          })
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 shadow-sm">
      <nav className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Sparkles className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
          </motion.div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Recruitly AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className={cn(
                  'relative',
                  pathname === item.href &&
                    'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-primary rounded-md -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {!loading && (
              <>
                {user ? (
                  // Authenticated: Show Profile Menu
                  <UserProfileMenu user={user} />
                ) : (
                  // Not Authenticated: Show Login/Signup Buttons
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Recruitly AI
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-3 mt-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={pathname === item.href ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
                
                {/* Mobile Auth Section */}
                {!loading && (
                  <div className="pt-4 border-t space-y-2">
                    {user ? (
                      // Authenticated Mobile View
                      <>
                        <div className="px-2 py-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {user.role && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mt-2">
                              {user.role === 'hr' ? '👔 HR' : '🎯 Candidate'}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const profilePath = user.role === 'hr' ? '/hr/profile' : '/candidate/profile'
                            router.push(profilePath)
                            setIsOpen(false)
                          }}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const dashboardPath = user.role === 'hr' ? '/hr/dashboard' : '/candidate/dashboard'
                            router.push(dashboardPath)
                            setIsOpen(false)
                          }}
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      // Not Authenticated Mobile View
                      <>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full bg-gradient-to-r from-primary to-accent" asChild>
                          <Link href="/signup" onClick={() => setIsOpen(false)}>
                            Get Started
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
