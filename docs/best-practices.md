# Todo App Best Practices

This document outlines best practices for developing, maintaining, and using the Todo App effectively.

## Development Best Practices

### Code Quality

#### TypeScript Usage

```typescript
// ✅ Good: Use strict typing
interface Todo {
  _id: string
  title: string
  completed: boolean
  createdAt: number
}

// ❌ Bad: Avoid any types
const todo: any = { title: "Test" }

// ✅ Good: Use union types for specific values
type Priority = 'low' | 'medium' | 'high'

// ✅ Good: Use generics for reusable components
interface ApiResponse<T> {
  data: T
  error?: string
}
```

#### Component Structure

```typescript
// ✅ Good: Functional components with proper typing
interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo._id)}
      />
      <span>{todo.title}</span>
      <button onClick={() => onDelete(todo._id)}>Delete</button>
    </div>
  )
}
```

#### Error Handling

```typescript
// ✅ Good: Comprehensive error handling
try {
  await createTodo({ title: "" })
} catch (error) {
  if (error instanceof ValidationError) {
    showToast("Please enter a title", "error")
  } else if (error instanceof AuthenticationError) {
    redirectToSignIn()
  } else {
    console.error("Unexpected error:", error)
  }
}
```

### Database Best Practices

#### Query Optimization

```typescript
// ✅ Good: Use indexed queries
const todos = useQuery(api.todos.getTodosByUser, { userId })

// ✅ Good: Use compound indexes for filtered queries
const completedTodos = useQuery(api.todos.getTodosByStatus, {
  userId,
  completed: true
})

// ❌ Bad: Avoid filtering in client
const allTodos = useQuery(api.todos.getTodos)
const completedTodos = allTodos.filter(todo => todo.completed)
```

#### Data Validation

```typescript
// ✅ Good: Validate data at API level
function validateTodo(data: unknown): TodoInput {
  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    categoryId: z.string().optional()
  })

  return schema.parse(data)
}
```

### Performance Optimization

#### Component Optimization

```typescript
// ✅ Good: Use React.memo for expensive components
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  )
})

// ✅ Good: Use useCallback for event handlers
const handleToggle = useCallback((id: string) => {
  updateTodo({ id, completed: !completed })
}, [updateTodo, completed])
```

#### Image Optimization

```typescript
// ✅ Good: Use Next.js Image component
import Image from 'next/image'

<Image
  src={todo.imageUrl}
  alt={todo.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

## User Experience Best Practices

### Loading States

```typescript
// ✅ Good: Show loading states
function TodoList() {
  const todos = useQuery(api.todos.getTodos)

  if (todos === undefined) {
    return <div className="animate-pulse">Loading todos...</div>
  }

  return (
    <div>
      {todos?.map(todo => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  )
}
```

### Error States

```typescript
// ✅ Good: Handle error states gracefully
function TodoForm() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: TodoInput) => {
    try {
      setError(null)
      await createTodo(data)
    } catch (error) {
      setError("Failed to create todo. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      {/* Form fields */}
    </form>
  )
}
```

### Accessibility

```typescript
// ✅ Good: Proper ARIA labels and keyboard navigation
<button
  onClick={handleDelete}
  aria-label={`Delete todo: ${todo.title}`}
  className="focus:outline-none focus:ring-2 focus:ring-red-500"
>
  <TrashIcon aria-hidden="true" />
</button>

// ✅ Good: Semantic HTML
<main role="main">
  <h1>My Todos</h1>
  <ul role="list">
    {todos.map(todo => (
      <li key={todo._id} role="listitem">
        {/* Todo content */}
      </li>
    ))}
  </ul>
</main>
```

## Security Best Practices

### Input Sanitization

```typescript
// ✅ Good: Sanitize user inputs
import DOMPurify from 'dompurify'

const sanitizedDescription = DOMPurify.sanitize(userInput)

// ✅ Good: Use parameterized queries
const todos = useQuery(api.todos.getTodosByCategory, {
  categoryId: selectedCategory
})
```

### Authentication Checks

```typescript
// ✅ Good: Verify authentication on protected routes
export default function ProtectedPage() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in to access this page.</div>
  }

  return <div>Welcome, {user.firstName}!</div>
}
```

## Testing Best Practices

### Unit Tests

```typescript
// ✅ Good: Test component behavior
describe('TodoItem', () => {
  it('calls onToggle when checkbox is clicked', () => {
    const mockOnToggle = jest.fn()
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockOnToggle).toHaveBeenCalledWith(mockTodo._id)
  })
})
```

### Integration Tests

```typescript
// ✅ Good: Test user workflows
describe('Todo Creation Flow', () => {
  it('creates a todo when form is submitted', async () => {
    render(<App />)

    // Sign in user
    // Navigate to todos page
    // Fill form and submit
    // Verify todo appears in list
  })
})
```

### API Testing

```typescript
// ✅ Good: Test ConvexDB functions
describe('Todos API', () => {
  it('creates todo successfully', async () => {
    const mockDb = createMockDb()
    const ctx = createMockCtx({ db: mockDb })

    const result = await createTodo(ctx, {
      title: "Test Todo",
      description: "Test description"
    })

    expect(result).toBeDefined()
    expect(mockDb.insert).toHaveBeenCalled()
  })
})
```

## API Design Best Practices

### RESTful Endpoints

```typescript
// ✅ Good: Consistent API patterns
// GET /api/todos - List todos
// POST /api/todos - Create todo
// GET /api/todos/:id - Get specific todo
// PUT /api/todos/:id - Update todo
// DELETE /api/todos/:id - Delete todo
```

### Response Format

```typescript
// ✅ Good: Consistent response structure
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page: number
    limit: number
    total: number
  }
}
```

## Deployment Best Practices

### Environment Configuration

```typescript
// ✅ Good: Environment-specific configuration
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true
  },
  production: {
    apiUrl: 'https://my-app.com',
    debug: false
  }
}

export const currentConfig = config[process.env.NODE_ENV || 'development']
```

### Build Optimization

```javascript
// ✅ Good: Optimize production builds
// next.config.js
module.exports = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  experimental: {
    optimizeCss: true
  }
}
```

## Monitoring and Logging

### Error Tracking

```typescript
// ✅ Good: Comprehensive error logging
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Sanitize sensitive data
    return event
  }
})
```

### Performance Monitoring

```typescript
// ✅ Good: Track performance metrics
const trackPerformance = (metric: string, value: number) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log(`${metric}: ${value}ms`)
  }
}

// Usage
const startTime = Date.now()
// ... some operation
trackPerformance('todo_creation', Date.now() - startTime)
```

## Code Organization

### File Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Next.js pages
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

### Naming Conventions

```typescript
// ✅ Good: Consistent naming
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

type UserRole = 'admin' | 'user' | 'moderator'

const getUserById = (id: string): Promise<User> => {
  // Implementation
}

const handleUserUpdate = (user: User) => {
  // Implementation
}
```

## Documentation Best Practices

### Code Comments

```typescript
// ✅ Good: Meaningful comments
/**
 * Creates a new todo item for the authenticated user
 * @param data - The todo data to create
 * @returns Promise resolving to the created todo ID
 * @throws ValidationError if title is empty or too long
 * @throws AuthenticationError if user is not authenticated
 */
export const createTodo = mutation({
  args: todoCreateSchema,
  handler: async (ctx, args): Promise<Id<"todos">> => {
    // Validate user authentication
    const user = await getAuthenticatedUser(ctx)

    // Validate input data
    validateTodoTitle(args.title)

    // Create the todo
    const todoId = await ctx.db.insert("todos", {
      userId: user._id,
      title: args.title.trim(),
      completed: false,
      createdAt: Date.now()
    })

    return todoId
  }
})
```

### README Updates

```markdown
<!-- ✅ Good: Keep README current -->
# My Project

Brief description of what the project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install
```

## Usage

```javascript
import { myFunction } from 'my-project'

myFunction()
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
```

## Git Best Practices

### Commit Messages

```bash
# ✅ Good: Descriptive commit messages
git commit -m "feat: add todo completion functionality

- Add checkbox to mark todos as complete
- Update todo status in database
- Add visual feedback for completed todos
- Update progress calculation"

# ❌ Bad: Vague commit messages
git commit -m "fix bug"
git commit -m "update code"
```

### Branch Naming

```bash
# ✅ Good: Descriptive branch names
git checkout -b feature/add-todo-categories
git checkout -b bugfix/fix-authentication-flow
git checkout -b refactor/optimize-database-queries

# ❌ Bad: Generic branch names
git checkout -b my-feature
git checkout -b fix
```

## Performance Best Practices

### Bundle Size Optimization

```javascript
// ✅ Good: Lazy load components
const TodoForm = lazy(() => import('./components/TodoForm'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TodoForm />
    </Suspense>
  )
}
```

### Database Query Optimization

```typescript
// ✅ Good: Use pagination for large datasets
const todos = usePaginatedQuery(
  api.todos.getTodos,
  {},
  { initialNumItems: 20 }
)

// ✅ Good: Use caching strategies
const todos = useQuery(api.todos.getTodos, {}, {
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000 // 5 minutes
})
```

## Accessibility Best Practices

### Keyboard Navigation

```typescript
// ✅ Good: Ensure keyboard accessibility
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleToggle()
  }
}

return (
  <div
    role="button"
    tabIndex={0}
    onClick={handleToggle}
    onKeyDown={handleKeyDown}
    aria-pressed={completed}
  >
    {title}
  </div>
)
```

### Screen Reader Support

```typescript
// ✅ Good: Provide screen reader context
return (
  <div>
    <label htmlFor="todo-title">Todo Title</label>
    <input
      id="todo-title"
      type="text"
      aria-describedby="title-help"
      aria-required="true"
    />
    <span id="title-help" className="sr-only">
      Enter a clear, actionable title for your todo
    </span>
  </div>
)
```

## Mobile Responsiveness

### Responsive Design

```css
/* ✅ Good: Mobile-first approach */
.todo-item {
  padding: 1rem;
}

@media (min-width: 768px) {
  .todo-item {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .todo-item {
    padding: 2rem;
  }
}
```

### Touch Interactions

```typescript
// ✅ Good: Handle touch events properly
const handleTouchStart = (event: TouchEvent) => {
  // Handle touch start
}

const handleTouchEnd = (event: TouchEvent) => {
  // Handle touch end
}

return (
  <div
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    style={{ touchAction: 'none' }}
  >
    Swipeable content
  </div>
)
```

Following these best practices will ensure your Todo App is maintainable, performant, accessible, and provides an excellent user experience.