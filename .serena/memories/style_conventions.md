# Code Style and Conventions for Todo App

## TypeScript Guidelines
- **Strict Mode**: Always enabled, no implicit any types
- **Type Annotations**: Required for function parameters and return types
- **Interface vs Type**: Use interfaces for object shapes, types for unions
- **Generic Types**: Use generics for reusable components and functions
- **Utility Types**: Leverage built-in types like `Partial<T>`, `Pick<T>`, `Omit<T>`

## Component Patterns
```typescript
// Good: Explicit types and functional component
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// Avoid: Implicit any, missing types
export function TodoItem({ todo, onToggle, onDelete }) {
  // ...
}
```

## Naming Conventions
- **Components**: PascalCase (`TodoItem`, `CategorySelector`)
- **Functions**: camelCase (`handleCreateTodo`, `getCategoryById`)
- **Variables**: camelCase (`newTodoTitle`, `selectedCategory`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TITLE_LENGTH`)
- **Files**: kebab-case for pages (`sign-in`, `user-profile`)
- **Folders**: kebab-case (`auth-guard`, `category-manager`)

## Import Organization
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery, useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';

// 3. Local imports (utilities first, then components)
import { cn } from '@/lib/utils';
import { AuthGuard } from '@/components/AuthGuard';

// 4. Type imports (use type keyword)
import type { Todo, Category } from './types';
```

## Error Handling Patterns
```typescript
// Good: Descriptive error messages and proper typing
try {
  await createTodo({ title, description });
} catch (error) {
  console.error('Failed to create todo:', error);
  // Handle error appropriately
}

// Avoid: Generic error handling
try {
  await createTodo({ title, description });
} catch {
  console.log('Error');
}
```

## Convex Function Patterns
```typescript
// Good: Proper validation and error handling
import { v } from 'convex/values';

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id('categories')),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Business logic with validation
    if (!args.title.trim()) {
      throw new Error('Title is required');
    }

    // Database operations
    return await ctx.db.insert('todos', {
      // ... data
    });
  },
});
```

## Testing Conventions
- **Test Files**: Same name as source with `.test.ts` or `.test.tsx`
- **Test Structure**: Arrange, Act, Assert pattern
- **Mocking**: Mock external dependencies (Convex, Clerk)
- **Coverage**: Aim for >80% coverage
- **Naming**: `describe('ComponentName', () => { it('should do something', () => { ... }) })`

## Performance Best Practices
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Optimistic Updates**: Implement for better UX
- **Lazy Loading**: Use dynamic imports for large components
- **Bundle Splitting**: Leverage Next.js automatic code splitting

## Accessibility Guidelines
- **Semantic HTML**: Use proper heading hierarchy, landmarks
- **ARIA Labels**: Add when needed for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Meet WCAG guidelines
- **Focus Management**: Proper focus indicators and management

## CSS/Styling Conventions
- **Tailwind Classes**: Use utility-first approach
- **Conditional Classes**: Use `cn()` utility for dynamic classes
- **Component Variants**: Leverage shadcn/ui variant system
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Support if implemented

## Git Commit Conventions
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Descriptive Messages**: Clear, concise commit messages
- **Atomic Commits**: One logical change per commit