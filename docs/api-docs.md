# Todo App API Documentation

## Overview

The Todo App uses ConvexDB as its backend, providing real-time database functionality with automatic authentication through Clerk.js. This document covers all available API endpoints, data structures, and usage examples.

## Authentication

All API calls require user authentication via Clerk.js. The authentication is handled automatically by ConvexDB's auth integration.

### Authentication Flow

1. User authenticates with Clerk.js
2. Clerk provides JWT token to the client
3. ConvexDB validates the token on each request
4. User identity is available in all functions via `ctx.auth.getUserIdentity()`

## Database Schema

### Users Table

```typescript
interface User {
  _id: Id<"users">
  clerkId: string
  email: string
  name?: string
  createdAt: number
}
```

### Categories Table

```typescript
interface Category {
  _id: Id<"categories">
  userId: Id<"users">
  name: string
  color: string
  createdAt: number
}
```

### Todos Table

```typescript
interface Todo {
  _id: Id<"todos">
  userId: Id<"users">
  categoryId?: Id<"categories">
  title: string
  description?: string
  completed: boolean
  createdAt: number
  updatedAt: number
}
```

## API Endpoints

### Todos API

#### `getTodos`

Retrieves all todos for the authenticated user.

**Parameters:** None

**Returns:** `Todo[]`

**Usage:**
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

**Returns:** `Todo | null`

**Usage:**
```typescript
const todo = useQuery(api.todos.getTodo, { id: todoId })
```

#### `getTodosByCategory`

Retrieves todos filtered by category.

**Parameters:**
```typescript
{
  categoryId?: Id<"categories">
}
```

**Returns:** `Todo[]`

**Usage:**
```typescript
// Get todos for specific category
const workTodos = useQuery(api.todos.getTodosByCategory, {
  categoryId: workCategoryId
})

// Get todos without category
const uncategorizedTodos = useQuery(api.todos.getTodosByCategory, {
  categoryId: undefined
})
```

#### `createTodo`

Creates a new todo item.

**Parameters:**
```typescript
{
  title: string          // Required, 1-200 characters
  description?: string   // Optional, max 1000 characters
  categoryId?: Id<"categories"> // Optional category reference
}
```

**Returns:** `Id<"todos">`

**Usage:**
```typescript
const createTodo = useMutation(api.todos.createTodo)

const todoId = await createTodo({
  title: "Buy groceries",
  description: "Milk, bread, eggs",
  categoryId: shoppingCategoryId
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
  categoryId?: Id<"categories"> | null
}
```

**Returns:** Updated `Todo` object

**Usage:**
```typescript
const updateTodo = useMutation(api.todos.updateTodo)

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

**Returns:** `{ success: true }`

**Usage:**
```typescript
const deleteTodo = useMutation(api.todos.deleteTodo)

await deleteTodo({ id: todoId })
```

#### `toggleTodosCompleted`

Toggles completion status for multiple todos.

**Parameters:**
```typescript
{
  ids: Id<"todos">[]
  completed: boolean
}
```

**Returns:** `{ success: true, updatedCount: number }`

**Usage:**
```typescript
const toggleTodosCompleted = useMutation(api.todos.toggleTodosCompleted)

await toggleTodosCompleted({
  ids: [todoId1, todoId2],
  completed: true
})
```

#### `deleteCompletedTodos`

Deletes all completed todos for the user.

**Parameters:** None

**Returns:** `{ success: true, deletedCount: number }`

**Usage:**
```typescript
const deleteCompletedTodos = useMutation(api.todos.deleteCompletedTodos)

const result = await deleteCompletedTodos()
console.log(`Deleted ${result.deletedCount} todos`)
```

### Categories API

#### `getCategories`

Retrieves all categories for the authenticated user.

**Parameters:** None

**Returns:** `Category[]`

**Usage:**
```typescript
const categories = useQuery(api.categories.getCategories)
```

#### `getCategory`

Retrieves a specific category by ID.

**Parameters:**
```typescript
{
  id: Id<"categories">
}
```

**Returns:** `Category | null`

**Usage:**
```typescript
const category = useQuery(api.categories.getCategory, { id: categoryId })
```

#### `createCategory`

Creates a new category.

**Parameters:**
```typescript
{
  name: string   // Required, unique per user
  color: string  // Hex color code (e.g., "#FF6B6B")
}
```

**Returns:** `Id<"categories">`

**Usage:**
```typescript
const createCategory = useMutation(api.categories.createCategory)

const categoryId = await createCategory({
  name: "Urgent",
  color: "#EF4444"
})
```

#### `updateCategory`

Updates an existing category.

**Parameters:**
```typescript
{
  id: Id<"categories">
  name?: string
  color?: string
}
```

**Returns:** void

**Usage:**
```typescript
const updateCategory = useMutation(api.categories.updateCategory)

await updateCategory({
  id: categoryId,
  name: "High Priority",
  color: "#F59E0B"
})
```

#### `deleteCategory`

Deletes a category (only if no todos are assigned to it).

**Parameters:**
```typescript
{
  id: Id<"categories">
}
```

**Returns:** void

**Usage:**
```typescript
const deleteCategory = useMutation(api.categories.deleteCategory)

await deleteCategory({ id: categoryId })
```

#### `createDefaultCategories`

Creates default categories for new users.

**Parameters:** None

**Returns:** `Id<"categories">[]`

**Usage:**
```typescript
const createDefaultCategories = useMutation(api.categories.createDefaultCategories)

const categoryIds = await createDefaultCategories()
```

### Users API

#### `getCurrentUser`

Retrieves the current user's profile information.

**Parameters:** None

**Returns:** `User | null`

**Usage:**
```typescript
const user = useQuery(api.users.getCurrentUser)
```

#### `updateUser`

Updates user profile information.

**Parameters:**
```typescript
{
  name?: string
}
```

**Returns:** Updated `User` object

**Usage:**
```typescript
const updateUser = useMutation(api.users.updateUser)

await updateUser({
  name: "John Doe"
})
```

## Error Handling

### Error Types

All API functions can throw the following custom error types:

- **AuthenticationError**: User is not authenticated
- **AuthorizationError**: User doesn't have permission for the operation
- **NotFoundError**: Requested resource doesn't exist
- **ValidationError**: Input data is invalid

### Error Handling Example

```typescript
try {
  await createTodo({ title: "" })
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:", error.message)
    // Show validation error to user
  } else if (error instanceof AuthenticationError) {
    // Redirect to sign-in
  } else {
    console.error("Unexpected error:", error)
  }
}
```

## Data Validation

### Todo Validation Rules

- **Title**: Required, 1-200 characters
- **Description**: Optional, max 1000 characters
- **Category**: Must exist and belong to the user (if provided)

### Category Validation Rules

- **Name**: Required, unique per user, 1-50 characters
- **Color**: Required, valid hex color code

### Input Sanitization

All string inputs are automatically trimmed. HTML and potentially dangerous content is sanitized.

## Real-time Updates

### Automatic Synchronization

ConvexDB provides real-time updates automatically:

```typescript
function TodoList() {
  const todos = useQuery(api.todos.getTodos)

  // Component re-renders automatically when todos change
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

  const handleToggle = async () => {
    // UI updates immediately, then syncs with server
    await updateTodo({
      id: todo._id,
      completed: !todo.completed
    })
  }

  return (
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={handleToggle}
    />
  )
}
```

## Rate Limiting

### ConvexDB Limits

- **Queries**: Cached for performance, no strict rate limits
- **Mutations**: Rate limited per user to prevent abuse
- **File operations**: Size and count limits apply

### Best Practices

1. **Batch Operations**: Use bulk operations when possible
2. **Debounce Updates**: Avoid rapid successive updates
3. **Optimistic UI**: Show changes immediately, let sync happen in background

## Security

### Authentication

- All functions verify user identity before proceeding
- JWT tokens are validated on each request
- User data is completely isolated

### Authorization

- Users can only access their own data
- Category ownership is validated for todo operations
- Resource ownership checks prevent unauthorized access

### Data Privacy

- All data is encrypted at rest
- Communications use HTTPS encryption
- Minimal data collection principle followed

## Performance Optimization

### Query Optimization

Use appropriate database indexes for efficient queries:

```typescript
// Efficient indexed query
.withIndex("by_user", (q) => q.eq("userId", userId))

// Efficient compound index query
.withIndex("by_user_category", (q) =>
  q.eq("userId", userId).eq("categoryId", categoryId)
)
```

### Caching Strategy

- **Static data**: ISR with appropriate revalidation
- **User data**: Real-time with ConvexDB
- **API responses**: Proper cache headers

## Testing

### Unit Tests

```typescript
import { mockConvexReactClient } from 'convex-test'
import { renderHook } from '@testing-library/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

describe('Todos API', () => {
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
describe('Todo Creation Flow', () => {
  it('creates todo when form is submitted', async () => {
    // Sign in user
    // Navigate to todos page
    // Fill form and submit
    // Verify todo appears in list
  })
})
```

## Migration Guide

### From v0.x to v1.0

1. **Category Support**: All existing todos will be uncategorized
2. **New Indexes**: Database performance improved with new indexes
3. **Validation**: Stricter input validation now enforced

### Breaking Changes

- `priority` field removed (use categories instead)
- `dueDate` field removed (will be added in future version)
- Some query parameters changed for consistency

## Support

### Getting Help

- [ConvexDB Documentation](https://docs.convex.dev)
- [Clerk.js Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Common Issues

1. **Authentication Errors**
   - Verify Clerk configuration
   - Check JWT token validity
   - Ensure proper middleware setup

2. **Database Connection Issues**
   - Verify Convex URL
   - Check network connectivity
   - Review function logs in Convex dashboard

3. **Real-time Update Problems**
   - Check query subscriptions
   - Verify mutation success
   - Review browser console for errors

## Version History

### v1.0.0
- Complete rewrite with ConvexDB
- Category support added
- Real-time synchronization
- Improved error handling
- Enhanced security

### Future Versions
- Due dates and reminders
- File attachments
- Team collaboration
- Advanced filtering
- Mobile app support</content>
<parameter name="filePath">/root/bytecats/sites/todo/docs/api-docs.md