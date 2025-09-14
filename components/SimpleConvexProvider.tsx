'use client'

import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ReactNode, useEffect, useState } from 'react'

interface SimpleConvexProviderProps {
  children: ReactNode
}

export function SimpleConvexProvider({ children }: SimpleConvexProviderProps) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize Convex client once on mount
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      console.error('NEXT_PUBLIC_CONVEX_URL is not configured')
      return
    }

    try {
      const client = new ConvexReactClient(convexUrl)
      setConvex(client)
      setIsInitialized(true)
      console.log('Convex client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Convex client:', error)
    }

    // Cleanup on unmount
    return () => {
      if (convex) {
        convex.close()
      }
    }
  }, [])

  if (!isInitialized || !convex) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Initializing connection...</p>
        </div>
      </div>
    )
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
