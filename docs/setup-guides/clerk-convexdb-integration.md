# Clerk and ConvexDB Integration Guide

## Overview

This guide provides a comprehensive walkthrough for integrating Clerk authentication with ConvexDB backend in a Next.js application. Clerk handles user authentication and session management, while ConvexDB serves as the real-time database backend that leverages Clerk's JWT tokens for secure data access.

### Key Integration Concepts

- **JWT Token Flow**: Clerk generates JWT tokens that ConvexDB validates for authentication
- **Provider Hierarchy**: Clerk acts as the primary authentication provider, with ConvexDB consuming its tokens
- **Real-time Sync**: ConvexDB provides real-time data synchronization with authenticated user context
- **Type Safety**: Full TypeScript integration between Clerk user data and ConvexDB schemas

### Benefits of This Integration

- Secure authentication with minimal configuration
- Real-time database operations with automatic user context
- Type-safe data access patterns
- Seamless session management across client and server
- Built-in security features (CSRF protection, token refresh, etc.)

## Prerequisites

- **Next.js 15+** project with App Router
- **Node.js 18+** installed
- **Clerk Account**: Sign up at [clerk.com](https://clerk.com)
- **Convex Account**: Sign up at [convex.dev](https://convex.dev)
- **Basic Knowledge**: React, TypeScript, and database concepts

### Required Packages

```bash
npm install @clerk/nextjs convex
```

## Step-by-Step Setup Guide

### Step 1: Initialize ConvexDB

1. **Install Convex CLI globally**:
   ```bash
   npm install -g convex
   convex login
   ```

2. **Initialize Convex in your project**:
   ```bash
   npx convex dev --once
   ```

3. **Configure environment variables** (add to `.env.local`):
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
   ```

### Step 2: Configure Clerk Authentication

1. **Install Clerk packages**:
   ```bash
   npm install @clerk/nextjs
   ```

2. **Set up Clerk environment variables**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

3. **Configure Clerk in root layout**:
   ```tsx
   // app/layout.tsx
   import { ClerkProvider } from '@clerk/nextjs'
   import { ConvexProvider, ConvexReactClient } from 'convex/react'

   const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <ClerkProvider>
         <ConvexProvider client={convex}>
           <html lang="en">
             <body>{children}</body>
           </html>
         </ConvexProvider>
       </ClerkProvider>
     )
   }
   ```

### Step 3: Set Up JWT Template in Clerk

1. **Create JWT Template**:
   - Go to Clerk Dashboard → JWT Templates
   - Click "Create Template"
   - Choose "Convex" as the template type
   - Name it "convex"

2. **Configure Template Claims**:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "name": "{{user.first_name}} {{user.last_name}}",
     "role": "{{user.public_metadata.role}}"
   }
   ```

3. **Copy the JWKS endpoint** from the template for Convex configuration.

### Step 4: Configure ConvexDB Authentication

1. **Create auth configuration**:
   ```javascript
   // convex/auth.config.js
   export default {
     providers: [
       {
         domain: "your-domain.clerk.accounts.dev",
         applicationID: "convex",
         verifier: "https://your-domain.clerk.accounts.dev/.well-known/jwks.json"
       }
     ]
   }
   ```

2. **Update Convex deployment**:
   ```bash
   npx convex deploy
   ```

### Step 5: Define Database Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  todos: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completed"])
})
```

### Step 6: Implement ConvexDB Functions

```typescript
// convex/users.ts
import { mutation } from "./_generated/server"

export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (existingUser) {
      return existingUser._id
    }

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name,
      role: identity.role,
      createdAt: Date.now(),
    })

    return userId
  },
})
```

```typescript
// convex/todos.ts
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      return []
    }

    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
  },
})

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const todoId = await ctx.db.insert("todos", {
      userId: user._id,
      title: args.title,
      description: args.description,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return todoId
  },
})
```

### Step 7: Set Up Middleware for Route Protection

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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

## Configuration Details

### JWT Template Configuration

The JWT template in Clerk defines what user information is included in the token that ConvexDB receives:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.first_name}} {{user.last_name}}",
  "role": "{{user.public_metadata.role}}",
  "iat": "{{jwt.iat}}",
  "exp": "{{jwt.exp}}"
}
```

### Provider Hierarchy

1. **Clerk Provider**: Top-level authentication provider
2. **Convex Provider**: Database client with authentication context
3. **Auth Context**: Available in all Convex functions via `ctx.auth`

### Auth State Management

```tsx
// Client-side auth state
'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

function ProtectedComponent() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const userData = useQuery(api.users.getCurrentUser)

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!userId) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Your data: {JSON.stringify(userData)}</p>
    </div>
  )
}
```

### ConvexDB Function Integration

All Convex functions receive authentication context through the `ctx.auth` object:

```typescript
// In any Convex function
const identity = await ctx.auth.getUserIdentity()

if (!identity) {
  throw new Error("Not authenticated")
}

// Access user information
console.log('User ID:', identity.subject)
console.log('User Email:', identity.email)
console.log('User Name:', identity.name)
console.log('Custom Role:', identity.role)
```

## Common Issues and Solutions

### 1. JWT Token Verification Errors

**Problem**: `Error: Invalid JWT token`

**Solutions**:
- Verify JWKS endpoint URL in `auth.config.js`
- Ensure JWT template is published in Clerk Dashboard
- Check token expiration (default: 1 hour)
- Confirm domain matches Clerk application domain

### 2. Authentication Context Not Available

**Problem**: `ctx.auth.getUserIdentity()` returns null

**Solutions**:
- Ensure ClerkProvider wraps ConvexProvider in layout
- Check middleware configuration for route protection
- Verify user is signed in before making Convex calls
- Confirm JWT template includes required claims

### 3. Real-time Updates Not Working

**Problem**: Data doesn't update in real-time

**Solutions**:
- Ensure ConvexProvider is properly configured
- Check network connectivity
- Verify query subscriptions are active
- Look for console errors in Convex functions

### 4. Schema Deployment Issues

**Problem**: Schema changes not reflected

**Solutions**:
- Run `npx convex deploy` after schema changes
- Check for schema validation errors
- Ensure all indexes are properly defined
- Verify data types match between schema and functions

### 5. CORS Issues

**Problem**: Cross-origin requests blocked

**Solutions**:
- Add your domain to Clerk Dashboard allowed origins
- Configure Convex CORS settings if needed
- Ensure HTTPS in production

### 6. Token Expiration Handling

**Problem**: Users getting logged out unexpectedly

**Solutions**:
- Implement token refresh logic
- Handle token expiration gracefully in UI
- Set appropriate session timeouts in Clerk
- Use Clerk's built-in token refresh mechanism

## Code Examples

### Complete Todo Application

```tsx
// app/todos/page.tsx
'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/nextjs'

export default function TodosPage() {
  const { userId } = useAuth()
  const todos = useQuery(api.todos.getTodos)
  const createTodo = useMutation(api.todos.createTodo)
  const updateTodo = useMutation(api.todos.updateTodo)
  const deleteTodo = useMutation(api.todos.deleteTodo)

  if (!userId) {
    return <div>Please sign in to view todos</div>
  }

  if (todos === undefined) {
    return <div>Loading todos...</div>
  }

  const handleCreateTodo = async () => {
    try {
      await createTodo({
        title: 'New Todo',
        description: 'Add description here'
      })
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Todos</h1>
      
      <button
        onClick={handleCreateTodo}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Add Todo
      </button>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo._id} className="flex items-center space-x-2 p-2 border rounded">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => updateTodo({
                id: todo._id,
                completed: !todo.completed
              })}
            />
            <span className={todo.completed ? 'line-through' : ''}>
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo({ id: todo._id })}
              className="text-red-600 ml-auto"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### User Profile Management

```tsx
// app/profile/page.tsx
'use client'

import { UserProfile } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function ProfilePage() {
  const userData = useQuery(api.users.getCurrentUser)
  const updateUser = useMutation(api.users.updateUser)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Clerk Profile</h2>
          <UserProfile
            appearance={{
              elements: {
                card: 'shadow-lg',
                headerTitle: 'text-xl font-bold'
              }
            }}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom User Data</h2>
          {userData && (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {userData.clerkId}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Role:</strong> {userData.role}</p>
              <p><strong>Joined:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Server-Side Authentication Check

```tsx
// app/api/protected/route.ts
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'

export async function GET() {
  const { userId } = auth()
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  
  try {
    const userData = await convex.query(api.users.getCurrentUser)
    return Response.json(userData)
  } catch (error) {
    return new Response('Server error', { status: 500 })
  }
}
```

## Best Practices

### Security Best Practices

1. **Always Validate Authentication**:
   ```typescript
   const identity = await ctx.auth.getUserIdentity()
   if (!identity) {
     throw new Error("Not authenticated")
   }
   ```

2. **Implement Proper Authorization**:
   ```typescript
   // Check ownership before operations
   const todo = await ctx.db.get(args.id)
   if (todo.userId !== user._id) {
     throw new Error("Unauthorized")
   }
   ```

3. **Use HTTPS in Production**:
   - Enable HTTPS for all Clerk and Convex connections
   - Configure proper SSL certificates

4. **Handle Token Expiration Gracefully**:
   ```tsx
   // Client-side token refresh handling
   import { useAuth } from '@clerk/nextjs'

   function App() {
     const { isLoaded, userId, getToken } = useAuth()
     
     // Token will be automatically refreshed by Clerk
     const handleApiCall = async () => {
       const token = await getToken()
       // Use token for authenticated requests
     }
   }
   ```

### Performance Best Practices

1. **Use Indexes Effectively**:
   ```typescript
   // Good: Indexed query
   .withIndex("by_user", (q) => q.eq("userId", user._id))

   // Avoid: Non-indexed query
   .filter((q) => q.eq("userId", user._id))
   ```

2. **Implement Pagination for Large Datasets**:
   ```typescript
   export const getTodosPaginated = query({
     args: { limit: v.number(), cursor: v.optional(v.string()) },
     handler: async (ctx, args) => {
       return await ctx.db
         .query("todos")
         .paginate({
           numItems: args.limit,
           cursor: args.cursor,
         })
     },
   })
   ```

3. **Optimize Real-time Queries**:
   ```tsx
   // Use specific queries instead of broad ones
   const activeTodos = useQuery(api.todos.getActiveTodos)
   const completedTodos = useQuery(api.todos.getCompletedTodos)
   ```

### Error Handling Best Practices

1. **Implement Comprehensive Error Handling**:
   ```typescript
   try {
     const result = await ctx.db.insert("todos", todoData)
     return result
   } catch (error) {
     console.error("Failed to create todo:", error)
     throw new Error("Unable to create todo. Please try again.")
   }
   ```

2. **Handle Authentication Errors Gracefully**:
   ```tsx
   const todos = useQuery(api.todos.getTodos, {
     onError: (error) => {
       if (error.message.includes("Not authenticated")) {
         // Redirect to sign-in
         router.push('/sign-in')
       }
     }
   })
   ```

### Development Best Practices

1. **Use TypeScript Strictly**:
   - Enable strict mode in `tsconfig.json`
   - Define proper types for all data structures
   - Use Convex's generated types

2. **Implement Proper Testing**:
   ```typescript
   // Test authentication flow
   describe('Todo Creation', () => {
     it('should create todo for authenticated user', async () => {
       const mockAuth = { getUserIdentity: () => mockIdentity }
       const ctx = { db: mockDb, auth: mockAuth }
       
       const result = await createTodo(ctx, { title: 'Test Todo' })
       expect(result).toBeDefined()
     })
   })
   ```

3. **Monitor and Debug Effectively**:
   - Use Convex Dashboard for function monitoring
   - Implement structured logging
   - Set up error tracking (Sentry, LogRocket, etc.)

4. **Version Control and Deployment**:
   - Keep schema changes in version control
   - Use environment-specific configurations
   - Implement proper CI/CD pipelines

### Maintenance Best Practices

1. **Regular Dependency Updates**:
   - Keep Clerk and Convex packages updated
   - Monitor for security vulnerabilities
   - Test updates in staging environment

2. **Database Schema Evolution**:
   ```typescript
   // Use migrations for schema changes
   import { migration } from "./_generated/server"

   export default migration({
     up: async (ctx) => {
       // Add new field to existing table
       const todos = await ctx.db.query("todos").collect()
       for (const todo of todos) {
         await ctx.db.patch(todo._id, { priority: "medium" })
       }
     },
   })
   ```

3. **Performance Monitoring**:
   - Monitor query performance in Convex Dashboard
   - Set up alerts for slow queries
   - Optimize based on usage patterns

This integration provides a robust foundation for building secure, real-time applications with seamless authentication and data management.</content>
<parameter name="filePath">/root/bytecats/sites/todo/docs/setup-guides/clerk-convexdb-integration.md