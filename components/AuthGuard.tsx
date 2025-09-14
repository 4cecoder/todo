'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireUser?: boolean
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requireUser = true, fallback }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const router = useRouter()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading state while auth is being determined
  if (!isLoaded || (requireUser && !userLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-80">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we verify your authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user is not signed in and we're not showing a custom fallback
  if (!isSignedIn) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-80">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              You need to sign in to access this page.
            </p>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If we require user data but it's not loaded yet
  if (requireUser && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-80">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Profile...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we load your profile information.
            </p>
            {!showRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowRetry(true)}
              >
                Taking too long?
              </Button>
            )}
            {showRetry && (
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/sign-in')}>
                  Sign In Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
