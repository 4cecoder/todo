'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface ConvexErrorBoundaryProps {
  children: ReactNode
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 max-w-md text-center">
        <div className="w-12 h-12 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred while connecting to the database.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConvexErrorBoundary({ children }: ConvexErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.reload()
      }}
      onError={(error) => {
        console.error('Convex Error Boundary caught an error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
