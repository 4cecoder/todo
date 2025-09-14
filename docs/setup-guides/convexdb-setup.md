# ConvexDB Setup Guide

## Prerequisites

- Node.js project with Next.js
- Convex account (free tier available)
- Basic understanding of database concepts

## Account Setup

### Create Convex Account

1. Go to [convex.dev](https://convex.dev)
2. Sign up with GitHub or email
3. Create a new project

### Install Convex CLI

```bash
npm install -g convex
convex login
```

## Project Initialization

### Initialize Convex in Your Project

```bash
npx convex dev --once
```

This will:
- Create a `convex/` directory
- Generate initial configuration files
- Set up your Convex deployment

### Project Structure

```
convex/
├── _generated/
│   ├── dataModel.d.ts
│   ├── schema.ts
│   └── server.d.ts
├── schema.ts
├── users.ts
├── todos.ts
└── ...
```

## Database Schema

### Define Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
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
    .index("by_user_completed", ["userId", "completed"]),
});
```

### Generate Types

```bash
npx convex codegen
```

This generates TypeScript types in `convex/_generated/`.

## Database Functions

### Query Functions

```typescript
// convex/todos.ts
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getTodo = query({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || todo.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return todo;
  },
});
```

### Mutation Functions

```typescript
// convex/todos.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const todoId = await ctx.db.insert("todos", {
      userId: user._id,
      title: args.title,
      description: args.description,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return todoId;
  },
});

export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || todo.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.completed !== undefined && { completed: args.completed }),
      updatedAt: Date.now(),
    });
  },
});

export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || todo.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
```

### User Management

```typescript
// convex/users.ts
import { mutation } from "./_generated/server";

export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name,
      createdAt: Date.now(),
    });

    return userId;
  },
});
```

## Client Integration

### Install Convex React

```bash
npm install convex
```

### Configure ConvexProvider

```tsx
// app/layout.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}
```

### Use Convex Hooks

```tsx
// app/todos/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TodosPage() {
  const todos = useQuery(api.todos.getTodos);
  const createTodo = useMutation(api.todos.createTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const handleCreateTodo = async () => {
    await createTodo({
      title: "New Todo",
      description: "Description",
    });
  };

  if (todos === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={handleCreateTodo}>Create Todo</button>
      {todos.map((todo) => (
        <div key={todo._id}>
          <h3>{todo.title}</h3>
          <p>{todo.description}</p>
          <button
            onClick={() => updateTodo({
              id: todo._id,
              completed: !todo.completed
            })}
          >
            {todo.completed ? "Mark Incomplete" : "Mark Complete"}
          </button>
          <button onClick={() => deleteTodo({ id: todo._id })}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Authentication Integration

For a complete guide on integrating ConvexDB with Clerk authentication, including JWT templates, provider hierarchy, and advanced authentication patterns, see the [Clerk + ConvexDB Integration Guide](./clerk-convexdb-integration.md).

### Quick Clerk Integration

```typescript
// convex/auth.config.js
export default {
  providers: [
    {
      domain: "your-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};
```

```typescript
// In any Convex function
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Not authenticated");
}
```

## Deployment

### Deploy to Convex

```bash
npx convex deploy
```

This will:
- Deploy your functions to Convex
- Update your schema
- Generate new types

### Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

## Real-time Features

### Live Queries

Convex automatically provides real-time updates:

```tsx
const todos = useQuery(api.todos.getTodos); // Updates automatically
```

### Optimistic Updates

Mutations are optimistic by default:

```tsx
const createTodo = useMutation(api.todos.createTodo);

const handleCreate = async () => {
  // UI updates immediately
  await createTodo({ title: "New Todo" });
};
```

## Advanced Features

### File Storage

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      name: args.name,
      fileId: args.fileId,
    });
    return fileId;
  },
});
```

### Scheduled Functions

```typescript
// convex/cron.ts
import { cronJobs } from "./_generated/server";

const crons = cronJobs();

crons.interval(
  "clean-up-old-todos",
  { minutes: 60 }, // every hour
  "cleanUpOldTodos"
);

export default crons;
```

### Vector Search

```typescript
// convex/search.ts
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const searchTodos = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // Implement vector search logic
    const results = await ctx.vectorSearch("todos", "embedding", {
      vector: await generateEmbedding(args.query),
      limit: 10,
    });
    return results;
  },
});
```

## Monitoring & Debugging

### Convex Dashboard

- View function performance
- Monitor database usage
- Debug queries and mutations
- View real-time metrics

### Logging

```typescript
// In functions
console.log("Debug info:", data);
```

### Error Handling

```typescript
try {
  // Function logic
} catch (error) {
  console.error("Error:", error);
  throw new Error("Something went wrong");
}
```

## Best Practices

### Schema Design
- Use indexes for frequently queried fields
- Keep schemas simple and focused
- Use appropriate data types

### Function Organization
- Group related functions in files
- Use descriptive names
- Implement proper error handling

### Security
- Always check authentication
- Validate user permissions
- Use parameterized queries

### Performance
- Use indexes effectively
- Limit query results
- Implement pagination for large datasets

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Clerk configuration
   - Verify JWT tokens
   - Ensure proper middleware setup

2. **Schema Errors**
   - Run `npx convex codegen` after schema changes
   - Check for type mismatches
   - Verify index definitions

3. **Real-time Issues**
   - Check network connectivity
   - Verify query subscriptions
   - Look for mutation errors

4. **Deployment Issues**
   - Check build logs
   - Verify environment variables
   - Ensure schema compatibility

### Support Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Discord](https://convex.dev/community)
- [GitHub Issues](https://github.com/get-convex/convex/issues)

## Migration Guide

### From Other Databases

1. **Export Data**: Export from current database
2. **Transform Data**: Convert to Convex schema format
3. **Import Data**: Use Convex mutations to import
4. **Update Application**: Replace database calls with Convex

### Schema Migration

```typescript
// convex/migrations.ts
import { migration } from "./_generated/server";

export default migration({
  up: async (ctx) => {
    // Migration logic
    const todos = await ctx.db.query("todos").collect();
    for (const todo of todos) {
      await ctx.db.patch(todo._id, { updatedAt: Date.now() });
    }
  },
  down: async (ctx) => {
    // Rollback logic
  },
});
```

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Quickstart](https://docs.convex.dev/quickstart)
- [Convex API Reference](https://docs.convex.dev/api)
- [Convex Blog](https://convex.dev/blog)