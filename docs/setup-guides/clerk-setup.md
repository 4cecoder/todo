# Clerk.js Authentication Setup Guide

## Prerequisites

- Next.js project with App Router
- Clerk account (free tier available)
- Basic understanding of authentication concepts

## Account Setup

### Create Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up with email or GitHub
3. Create a new application

### Application Configuration

1. **Application Type**: Choose "Next.js"
2. **Authentication Methods**: Enable desired sign-in options
3. **Social Providers**: Configure OAuth providers (Google, GitHub, etc.)
4. **Redirect URLs**: Set up allowed URLs for your application

## Installation

### Install Clerk Packages

```bash
npm install @clerk/nextjs
```

For additional features:

```bash
npm install @clerk/clerk-sdk  # Backend SDK
```

## Environment Configuration

### Get API Keys

From Clerk Dashboard → API Keys:

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# For production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Additional Environment Variables

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Basic Setup

### Root Layout Configuration

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Middleware Setup

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/todos(.*)',
  '/profile(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

## Authentication Pages

### Custom Sign-In Page

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          }
        }}
      />
    </div>
  )
}
```

### Custom Sign-Up Page

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-green-600 hover:bg-green-700',
          }
        }}
      />
    </div>
  )
}
```

## User Management Components

### User Profile

```tsx
// app/profile/page.tsx
import { UserProfile } from '@clerk/nextjs'

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <UserProfile
        appearance={{
          elements: {
            card: 'shadow-lg',
          }
        }}
      />
    </div>
  )
}
```

### User Button

```tsx
// components/UserButton.tsx
'use client'

import { UserButton } from '@clerk/nextjs'

export function CustomUserButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'w-10 h-10',
        }
      }}
    />
  )
}
```

## Authentication Hooks

### Client-Side Authentication

```tsx
// components/AuthGuard.tsx
'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!userId) {
    return null
  }

  return <>{children}</>
}
```

### Server-Side Authentication

```tsx
// app/todos/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default function TodosPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div>
      <h1>My Todos</h1>
      {/* Todo content */}
    </div>
  )
}
```

## Integration with ConvexDB

For a complete guide on integrating Clerk with ConvexDB, including JWT templates, provider hierarchy, and advanced authentication patterns, see the [Clerk + ConvexDB Integration Guide](./clerk-convexdb-integration.md).

### Quick ConvexDB Integration

```javascript
// convex/auth.config.js
export default {
  providers: [
    {
      domain: "your-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
}
```

```typescript
// convex/todos.ts
import { query } from "./_generated/server";

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Use identity.subject as user ID
    const userId = identity.subject;

    // Query logic here
    return await ctx.db
      .query("todos")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

## Advanced Features

### Organization Management

```tsx
// app/organizations/page.tsx
import { OrganizationSwitcher, CreateOrganization } from '@clerk/nextjs'

export default function OrganizationsPage() {
  return (
    <div>
      <OrganizationSwitcher />
      <CreateOrganization />
    </div>
  )
}
```

### Role-Based Access Control

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isAdminRoute(req)) {
    auth().protect({ role: 'org:admin' })
  }
})
```

### Custom Claims and Metadata

```typescript
// app/api/webhook/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local')
  }

  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created') {
    // Handle user creation
    console.log('User created:', id)
  }

  return new Response('', { status: 200 })
}
```

## Customization

### Appearance Customization

```tsx
// lib/clerk-appearance.ts
export const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: '#3b82f6',
    colorBackground: '#ffffff',
    colorInputBackground: '#f9fafb',
    colorInputText: '#111827',
  },
  elements: {
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
    card: 'shadow-lg border border-gray-200',
    headerTitle: 'text-2xl font-bold text-gray-900',
    headerSubtitle: 'text-gray-600',
  },
}
```

### Custom Sign-In Form

```tsx
// app/sign-in/page.tsx
import { SignIn, useSignIn } from '@clerk/nextjs'
import { useState } from 'react'

export default function CustomSignInPage() {
  const { signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn.create({
        identifier: email,
        password,
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Sign In
        </button>
      </form>
    </div>
  )
}
```

## Security Features

### Multi-Factor Authentication

Enable MFA in Clerk Dashboard:
- Settings → Authentication → Multi-factor
- Choose verification methods (SMS, TOTP, etc.)

### Password Policies

Configure in Clerk Dashboard:
- Settings → Authentication → Password
- Set complexity requirements
- Enable password reset

### Session Management

```typescript
// app/api/sign-out/route.ts
import { auth, signOut } from '@clerk/nextjs/server'

export async function POST() {
  const { userId } = auth()

  if (!userId) {
    return new Response('Not signed in', { status: 401 })
  }

  await signOut()
  return new Response('Signed out successfully')
}
```

## Testing

### Testing Authentication

```typescript
// __tests__/auth.test.ts
import { createClerkClient } from '@clerk/clerk-sdk-node'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
})

describe('Authentication', () => {
  it('should create a user', async () => {
    const user = await clerkClient.users.createUser({
      emailAddress: ['test@example.com'],
      password: 'password123',
    })

    expect(user.id).toBeDefined()
  })
})
```

## Troubleshooting

### Common Issues

1. **Middleware Not Working**
   - Check file location (root of project)
   - Verify matcher patterns
   - Ensure proper export

2. **Authentication Errors**
   - Verify API keys
   - Check environment variables
   - Confirm domain configuration

3. **Redirect Loops**
   - Check redirect URL configuration
   - Verify middleware setup
   - Ensure proper route protection

4. **Webhook Issues**
   - Verify webhook secret
   - Check payload structure
   - Handle events properly

### Debug Mode

Enable debug logging:

```env
CLERK_LOG_LEVEL=debug
```

## Best Practices

### Security
- Always validate user input
- Use HTTPS in production
- Implement proper error handling
- Keep dependencies updated

### User Experience
- Provide clear error messages
- Implement loading states
- Use consistent styling
- Test on multiple devices

### Performance
- Lazy load Clerk components
- Use server-side rendering when possible
- Optimize bundle size
- Cache authentication state

### Development
- Use TypeScript for type safety
- Implement proper testing
- Document authentication flows
- Use environment-specific configurations

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/references/nextjs/overview)
- [Clerk API Reference](https://clerk.com/docs/references/backend/overview)
- [Clerk Community](https://clerk.com/community)