# API Documentation for ByteCats Todo App

## Overview

This document outlines the API endpoints and data structures used in the ByteCats Todo application, built with Next.js, ConvexDB, and Clerk.js.

## Authentication

All API endpoints require authentication via Clerk.js JWT tokens. The authentication is handled automatically by ConvexDB's auth integration.

### Authentication Flow

1. User signs in via Clerk.js
2. Clerk provides JWT token
3. ConvexDB validates token in functions
4. User data is accessible via `ctx.auth.getUserIdentity()`

## Database Schema

### Users Table

```typescript
interface User {
  _id: Id<"users">
  clerkId: string
  email: string
  name?: string
  role: 'user' | 'admin'
  createdAt: number
  updatedAt: number
}
```

### Todos Table

```typescript
interface Todo {
  _id: Id<"todos">
  userId: Id<"users">
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: number
  createdAt: number
  updatedAt: number
}
```

## ConvexDB Functions

### Query Functions

#### `getTodos`

Retrieves all todos for the authenticated user.

**Parameters:**
- None (uses authenticated user context)

**Returns:**
```typescript
Todo[]
```

**Example:**
```typescript
const todos = useQuery(api.todos.getTodos)
```

#### `getTodo`

Retrieves a specific todo by ID.

**Parameters:**
```typescript
{
  id: Id<"todos">
}
```

**Returns:**
```typescript
Todo | null
```

**Example:**
```typescript
const todo = useQuery(api.todos.getTodo, { id: todoId })
```

#### `getTodosByStatus`

Retrieves todos filtered by completion status.

**Parameters:**
```typescript
{
  completed: boolean
}
```

**Returns:**
```typescript
Todo[]
```

#### `getTodosByPriority`

Retrieves todos filtered by priority level.

**Parameters:**
```typescript
{
  priority: 'low' | 'medium' | 'high'
}
```

**Returns:**
```typescript
Todo[]
```

#### `getUpcomingTodos`

Retrieves todos due within the next week.

**Parameters:**
```typescript
{
  limit?: number
}
```

**Returns:**
```typescript
Todo[]
```

### Mutation Functions

#### `createTodo`

Creates a new todo item.

**Parameters:**
```typescript
{
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: number
}
```

**Returns:**
```typescript
Id<"todos">
```

**Example:**
```typescript
const todoId = await createTodo({
  title: "Buy groceries",
  description: "Milk, bread, eggs",
  priority: "high"
})
```

#### `updateTodo`

Updates an existing todo item.

**Parameters:**
```typescript
{
  id: Id<"todos">
  title?: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: number
}
```

**Returns:**
```typescript
void
```

**Example:**
```typescript
await updateTodo({
  id: todoId,
  completed: true,
  title: "Buy groceries - Updated"
})
```

#### `deleteTodo`

Deletes a todo item.

**Parameters:**
```typescript
{
  id: Id<"todos">
}
```

**Returns:**
```typescript
void
```

**Example:**
```typescript
await deleteTodo({ id: todoId })
```

#### `createUser`

Creates a user record (called automatically on first sign-in).

**Parameters:**
- None (uses Clerk identity)

**Returns:**
```typescript
Id<"users">
```

## Next.js API Routes

### Webhook Endpoints

#### `POST /api/webhooks/clerk`

Handles Clerk webhook events for user management.

**Events Handled:**
- `user.created`
- `user.updated`
- `user.deleted`

**Request Body:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_123",
    "email_addresses": [{"email_address": "user@example.com"}],
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Response:**
```json
{
  "status": "success"
}
```

## Client-Side Hooks

### Authentication Hooks

#### `useAuth()`

Provides authentication state.

```typescript
const { isLoaded, userId, sessionId, getToken } = useAuth()
```

#### `useUser()`

Provides user data.

```typescript
const { user, isSignedIn, isLoaded } = useUser()
```

### ConvexDB Hooks

#### `useQuery(api.functionName, args?)`

Fetches data from ConvexDB.

```typescript
const todos = useQuery(api.todos.getTodos)
const todo = useQuery(api.todos.getTodo, { id: todoId })
```

#### `useMutation(api.functionName)`

Performs mutations on ConvexDB.

```typescript
const createTodo = useMutation(api.todos.createTodo)
const updateTodo = useMutation(api.todos.updateTodo)
const deleteTodo = useMutation(api.todos.deleteTodo)
```

#### `usePaginatedQuery(api.functionName, args?, options?)`

Provides paginated data fetching.

```typescript
const {
  results,
  status,
  loadMore
} = usePaginatedQuery(api.todos.getTodos, {}, { initialNumItems: 10 })
```

## Error Handling

### ConvexDB Errors

All ConvexDB functions throw errors for invalid operations:

```typescript
try {
  await createTodo({ title: "" })
} catch (error) {
  console.error("Failed to create todo:", error.message)
  // Handle error (show toast, etc.)
}
```

### Common Error Types

- `Not authenticated` - User not signed in
- `User not found` - User record missing
- `Todo not found` - Todo doesn't exist
- `Unauthorized` - User doesn't own the resource
- `Validation error` - Invalid input data

## Data Validation

### Input Validation

All mutations validate input data:

```typescript
// Title: 1-200 characters
if (args.title.length < 1 || args.title.length > 200) {
  throw new Error("Title must be between 1 and 200 characters")
}

// Due date: must be in future
if (args.dueDate && args.dueDate < Date.now()) {
  throw new Error("Due date must be in the future")
}
```

### Type Safety

All functions use Convex's type system for runtime validation:

```typescript
args: {
  title: v.string(),
  description: v.optional(v.string()),
  completed: v.boolean(),
  priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
  dueDate: v.optional(v.number()),
}
```

## Real-time Updates

### Automatic Subscriptions

ConvexDB automatically provides real-time updates:

```typescript
// This component re-renders when todos change
function TodoList() {
  const todos = useQuery(api.todos.getTodos)

  return (
    <div>
      {todos?.map(todo => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  )
}
```

### Optimistic Updates

Mutations provide immediate UI feedback:

```typescript
function TodoItem({ todo }) {
  const updateTodo = useMutation(api.todos.updateTodo)

  const handleToggle = () => {
    // UI updates immediately
    updateTodo({
      id: todo._id,
      completed: !todo.completed
    })
  }

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
      {todo.title}
    </div>
  )
}
```

## Rate Limiting

### ConvexDB Limits

- Query functions: Cached for performance
- Mutation functions: Rate limited per user
- File uploads: Size and count limits

### Clerk.js Limits

- Authentication requests: Rate limited
- API calls: Per-plan limits
- Webhooks: Retry logic included

## Security Considerations

### Authentication
- All functions verify user identity
- User isolation enforced
- JWT tokens validated

### Authorization
- Users can only access their own data
- Admin role for special operations
- Resource ownership validation

### Data Privacy
- User data encrypted at rest
- Secure communication (HTTPS)
- Minimal data collection

## Performance Optimization

### Query Optimization

Use appropriate indexes for efficient queries:

```typescript
// Indexed query
.withIndex("by_user_completed", (q) =>
  q.eq("userId", userId).eq("completed", false)
)
```

### Caching Strategy

- Static data: ISR with revalidation
- User data: Real-time with ConvexDB
- API responses: Appropriate cache headers

### Bundle Optimization

- Code splitting with dynamic imports
- Tree shaking for unused code
- Image optimization with Next.js

## Monitoring & Logging

### Error Tracking

```typescript
// Global error handler
import { captureException } from '@sentry/nextjs'

export function handleError(error: Error) {
  captureException(error)
  console.error('Application error:', error)
}
```

### Performance Monitoring

```typescript
// Vercel Analytics
import { track } from '@vercel/analytics'

track('todo_created', {
  priority: 'high',
  user_id: userId
})
```

### Database Monitoring

ConvexDB dashboard provides:
- Query performance metrics
- Error rates
- Usage statistics
- Real-time monitoring

## Testing

### Unit Tests

```typescript
// __tests__/todos.test.ts
import { mockConvexReactClient } from 'convex-test'
import { renderHook } from '@testing-library/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

describe('Todos', () => {
  it('fetches todos successfully', async () => {
    const mockClient = mockConvexReactClient()
    mockClient.mockQuery(api.todos.getTodos, [])

    const { result } = renderHook(() => useQuery(api.todos.getTodos), {
      wrapper: ({ children }) => (
        <ConvexProvider client={mockClient}>
          {children}
        </ConvexProvider>
      )
    })

    expect(result.current).toEqual([])
  })
})
```

### Integration Tests

```typescript
// Test full user flow
describe('Todo Creation Flow', () => {
  it('creates todo when form is submitted', async () => {
    // Sign in user
    // Navigate to todos page
    // Fill form
    // Submit
    // Verify todo appears in list
  })
})
```

## Deployment Considerations

### Environment Variables

Required environment variables:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Build Configuration

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@clerk/clerk-sdk'],
  },
  images: {
    domains: ['images.clerk.dev'],
  },
}
```

### Database Migrations

```typescript
// convex/migrations.ts
import { migration } from "./_generated/server";

export default migration({
  up: async (ctx) => {
    // Add new field to existing todos
    const todos = await ctx.db.query("todos").collect();
    for (const todo of todos) {
      await ctx.db.patch(todo._id, { priority: 'medium' });
    }
  },
  down: async (ctx) => {
    // Rollback logic
  },
});
```

## Support & Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Clerk configuration
   - Verify JWT tokens
   - Ensure proper middleware

2. **Database Connection Issues**
   - Verify Convex URL
   - Check network connectivity
   - Review function logs

3. **Real-time Update Problems**
   - Check query subscriptions
   - Verify mutation success
   - Review browser console

### Getting Help

- [Convex Documentation](https://docs.convex.dev)
- [Clerk Support](https://clerk.com/support)
- [Next.js Community](https://nextjs.org/community)
- [Vercel Support](https://vercel.com/help)

## Version History

### v1.0.0
- Initial release
- Basic CRUD operations
- User authentication
- Real-time updates

### Future Versions
- Todo categories
- File attachments
- Team collaboration
- Advanced filtering
- Mobile app