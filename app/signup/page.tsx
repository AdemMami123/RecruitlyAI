'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, User, Loader2, Briefcase, UserCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'hr' | 'candidate' | null

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1) // Step 1: Role selection, Step 2: Details
  const [role, setRole] = useState<UserRole>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleNext = () => {
    if (role) {
      setStep(2)
      setError('')
    } else {
      setError('Please select a role to continue')
    }
  }

  const handleBack = () => {
    setStep(1)
    setError('')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!role) {
      setError('Please select a role')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Continue anyway as auth was successful
        }
      }

      // Redirect based on role
      const dashboardPath = role === 'hr' ? '/hr/dashboard' : '/candidate/dashboard'
      router.push(dashboardPath)
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
            </motion.div>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Recruitly AI
            </span>
          </Link>
        </div>

        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {step === 1 ? 'Choose Your Role' : 'Create Your Account'}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {step === 1 
                ? 'Select how you want to use Recruitly AI' 
                : 'Enter your details to get started'}
            </CardDescription>
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 pt-4">
              <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Role Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* HR Role */}
                    <motion.button
                      type="button"
                      onClick={() => setRole('hr')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        role === 'hr'
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          role === 'hr' ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'
                        }`}>
                          <Briefcase className={`h-8 w-8 ${role === 'hr' ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">HR / Recruiter</h3>
                          <p className="text-sm text-muted-foreground">
                            Post jobs, create tests, and evaluate candidates with AI-powered insights
                          </p>
                        </div>
                        {role === 'hr' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>

                    {/* Candidate Role */}
                    <motion.button
                      type="button"
                      onClick={() => setRole('candidate')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        role === 'candidate'
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          role === 'candidate' ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'
                        }`}>
                          <UserCircle className={`h-8 w-8 ${role === 'candidate' ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">Job Seeker</h3>
                          <p className="text-sm text-muted-foreground">
                            Take skill tests, showcase your abilities, and receive personalized feedback
                          </p>
                        </div>
                        {role === 'candidate' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    disabled={!role}
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  {/* Role Badge */}
                  <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                    {role === 'hr' ? <Briefcase className="h-4 w-4 text-primary" /> : <UserCircle className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-medium">
                      Signing up as {role === 'hr' ? 'HR / Recruiter' : 'Job Seeker'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
