'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Target, Brain, BarChart3, Zap, Shield, Users } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Test Generation',
    description: 'Generate tailored skill tests using Gemini AI based on job descriptions and candidate profiles.',
  },
  {
    icon: Target,
    title: 'Candidate Analysis',
    description: 'Analyze performance to identify strengths and weaknesses with detailed AI insights.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track recruitment metrics and candidate performance with comprehensive dashboards.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Streamline your recruitment process with automated workflows and instant results.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with Supabase ensuring your data is always protected.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team to find the perfect candidates efficiently.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="container px-4 py-24 mx-auto md:py-32 lg:py-40">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 mr-2 text-accent" />
              <span className="text-sm font-medium">AI-Powered Recruitment Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
            >
              Find Perfect Candidates with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl md:text-xl"
            >
              Revolutionize your recruitment process with AI-generated skill tests and intelligent candidate analysis. 
              Make data-driven hiring decisions faster than ever.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                <Link href="/signup">
                  Get Started Free
                  <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
            >
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                modern recruitment
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Powerful features designed to streamline your hiring process and find the best talent.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10 bg-gradient-to-br from-background to-primary/5">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="container px-4 mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl drop-shadow-lg">
              Ready to transform your recruitment?
            </h2>
            <p className="text-lg text-primary-foreground/90 drop-shadow">
              Join companies using Recruitly AI to find and hire top talent faster.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 shadow-2xl hover:scale-105 transition-transform">
              <Link href="/signup">
                Start Free Trial
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
