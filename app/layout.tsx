import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { SimpleConvexProvider } from '@/components/SimpleConvexProvider'
import { ConvexErrorBoundary } from '@/components/ConvexErrorBoundary'
import { UserOnboarding } from '@/components/UserOnboarding'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Todo App - Manage Your Tasks Efficiently',
  description:
    'A modern, secure todo application built with Next.js, Clerk authentication, and Convex database. Organize your tasks, track progress, and boost productivity.',
  keywords: ['todo', 'tasks', 'productivity', 'organization', 'management'],
  authors: [{ name: 'Todo App Team' }],
  creator: 'Todo App',
  publisher: 'Todo App',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-todo-app.vercel.app'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Todo App - Manage Your Tasks Efficiently',
    description:
      'A modern, secure todo application built with Next.js, Clerk authentication, and Convex database.',
    url: 'https://your-todo-app.vercel.app',
    siteName: 'Todo App',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Todo App - Manage Your Tasks Efficiently',
    description:
      'A modern, secure todo application built with Next.js, Clerk authentication, and Convex database.',
    creator: '@todoapp', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl="/todos"
      signUpForceRedirectUrl="/todos"
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ConvexErrorBoundary>
            <SimpleConvexProvider>
              {children}
              <UserOnboarding />
            </SimpleConvexProvider>
          </ConvexErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  )
}
