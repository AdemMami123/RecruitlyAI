'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Candidates', href: '/candidates' },
  { name: 'Tests', href: '/tests' },
  { name: 'Analytics', href: '/analytics' },
]

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

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
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Link href="/signup">Get Started</Link>
            </Button>
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
                <div className="pt-4 border-t space-y-2">
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
