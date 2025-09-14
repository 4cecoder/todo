'use client'

import { CustomUserButton } from '@/components/UserButton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'

interface NavigationProps {
  userName?: string
}

export function Navigation({ userName }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
  }

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-foreground hover:text-primary transition-all duration-200 hover:scale-105"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              Todo App
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {userName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">
                  Welcome, {userName}
                </span>
              </div>
            )}
            <Link href="/todos">
              <Button variant="ghost" size="sm" className="btn-interactive">
                Todos
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="btn-interactive">
                Profile
              </Button>
            </Link>
            <div className="w-px h-6 bg-border mx-1" />
            <CustomUserButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="btn-interactive text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-4 space-y-4">
              {userName && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Welcome, {userName}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <Link href="/todos" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start btn-interactive">
                    Todos
                  </Button>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start btn-interactive">
                    Profile
                  </Button>
                </Link>
                <div className="flex justify-center py-2 border-t border-border/50">
                  <CustomUserButton />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 btn-interactive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
