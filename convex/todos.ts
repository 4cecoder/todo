import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Constants for validation
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

// Custom error types for better error handling
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Not authenticated") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ""} not found`);
    this.name = "NotFoundError";
  }
}

// Validation schemas
const todoCreateSchema = {
  title: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("categories")),
};

const todoUpdateSchema = {
  id: v.id("todos"),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  completed: v.optional(v.boolean()),
  categoryId: v.optional(v.id("categories")),
};

// Helper function to get authenticated user
async function getAuthenticatedUser(ctx: any): Promise<any> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new AuthenticationError();
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

// Helper function to validate todo ownership
async function validateTodoOwnership(ctx: any, todoId: string, userId: string): Promise<any> {
  const todo = await ctx.db.get(todoId);
  if (!todo) {
    throw new NotFoundError("Todo", todoId);
  }

  if (todo.userId !== userId) {
    throw new AuthorizationError("You don't have permission to access this todo");
  }

  return todo;
}

// Helper function to validate category ownership
async function validateCategoryOwnership(ctx: any, categoryId: string, userId: string): Promise<any> {
  if (!categoryId) return null;

  const category = await ctx.db.get(categoryId);
  if (!category) {
    throw new NotFoundError("Category", categoryId);
  }

  if (category.userId !== userId) {
    throw new AuthorizationError("You don't have permission to use this category");
  }

  return category;
}

// Input validation functions
function validateTodoTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError("Title is required", "title");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(`Title must be ${MAX_TITLE_LENGTH} characters or less`, "title");
  }
}

function validateTodoDescription(description?: string): void {
  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`, "description");
  }
}

export const getTodos = query({
  args: {},
  handler: async (ctx: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);

      // Use optimized query with index
      const todos = await ctx.db
        .query("todos")
        .withIndex("by_user", (q: any) => q.eq("userId", user._id))
        .collect();

      return todos;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error fetching todos:", error);
      throw new Error("Failed to fetch todos");
    }
  },
});

export const getTodosByCategory = query({
  args: { categoryId: v.optional(v.id("categories")) },
  handler: async (ctx: any, args: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);

      if (args.categoryId) {
        // Validate category ownership first
        await validateCategoryOwnership(ctx, args.categoryId, user._id);

        // Get todos for specific category
        return await ctx.db
          .query("todos")
          .withIndex("by_user_category", (q: any) =>
            q.eq("userId", user._id).eq("categoryId", args.categoryId)
          )
          .collect();
      } else {
        // Get todos without category
        return await ctx.db
          .query("todos")
          .withIndex("by_user", (q: any) => q.eq("userId", user._id))
          .filter((q: any) => q.eq(q.field("categoryId"), undefined))
          .collect();
      }
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error fetching todos by category:", error);
      throw new Error("Failed to fetch todos by category");
    }
  },
});

export const getTodo = query({
  args: { id: v.id("todos") },
  handler: async (ctx: any, args: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const todo = await validateTodoOwnership(ctx, args.id, user._id);

      return todo;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error fetching todo:", error);
      throw new Error("Failed to fetch todo");
    }
  },
});

export const createTodo = mutation({
  args: todoCreateSchema,
  handler: async (ctx: any, args: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);

      // Validate inputs
      validateTodoTitle(args.title);
      validateTodoDescription(args.description);

      // Validate category ownership if provided
      if (args.categoryId) {
        await validateCategoryOwnership(ctx, args.categoryId, user._id);
      }

      const now = Date.now();
      const todoId = await ctx.db.insert("todos", {
        userId: user._id,
        categoryId: args.categoryId || undefined,
        title: args.title.trim(),
        description: args.description?.trim() || undefined,
        completed: false,
        createdAt: now,
        updatedAt: now,
      });

      return todoId;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error creating todo:", error);
      throw new Error("Failed to create todo");
    }
  },
});

export const updateTodo = mutation({
  args: todoUpdateSchema,
  handler: async (ctx: any, args: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      await validateTodoOwnership(ctx, args.id, user._id);

      // Validate inputs if provided
      if (args.title !== undefined) {
        validateTodoTitle(args.title);
      }
      if (args.description !== undefined) {
        validateTodoDescription(args.description);
      }

      // Validate category ownership if provided
      if (args.categoryId !== undefined) {
        if (args.categoryId) {
          await validateCategoryOwnership(ctx, args.categoryId, user._id);
        }
        // If categoryId is null, that's fine (removing category)
      }

      const updateData: any = {
        updatedAt: Date.now(),
      };

      // Only include fields that are provided
      if (args.title !== undefined) {
        updateData.title = args.title.trim();
      }
      if (args.description !== undefined) {
        updateData.description = args.description?.trim() || undefined;
      }
      if (args.completed !== undefined) {
        updateData.completed = args.completed;
      }
      if (args.categoryId !== undefined) {
        updateData.categoryId = args.categoryId || undefined;
      }

      await ctx.db.patch(args.id, updateData);

      // Return the updated todo for optimistic updates
      return await ctx.db.get(args.id);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error updating todo:", error);
      throw new Error("Failed to update todo");
    }
  },
});

export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx: any, args: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      await validateTodoOwnership(ctx, args.id, user._id);

      await ctx.db.delete(args.id);

      return { success: true };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error deleting todo:", error);
      throw new Error("Failed to delete todo");
    }
  },
});

// Bulk operations for better performance
export const toggleTodosCompleted = mutation({
  args: {
    ids: v.array(v.id("todos")),
    completed: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);

      // Validate all todos belong to user
      await Promise.all(
        args.ids.map((id: string) => validateTodoOwnership(ctx, id, user._id))
      );

      // Update all todos in batch
      const updatePromises = args.ids.map((id: string) =>
        ctx.db.patch(id, {
          completed: args.completed,
          updatedAt: Date.now(),
        })
      );

      await Promise.all(updatePromises);

      return { success: true, updatedCount: args.ids.length };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error toggling todos completed:", error);
      throw new Error("Failed to update todos");
    }
  },
});

export const deleteCompletedTodos = mutation({
  args: {},
  handler: async (ctx: any) => {
    try {
      const user = await getAuthenticatedUser(ctx);

      // Find all completed todos for this user
      const completedTodos = await ctx.db
        .query("todos")
        .withIndex("by_user_completed", (q: any) =>
          q.eq("userId", user._id).eq("completed", true)
        )
        .collect();

      if (completedTodos.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      // Delete all completed todos
      const deletePromises = completedTodos.map((todo: any) => ctx.db.delete(todo._id));
      await Promise.all(deletePromises);

      return { success: true, deletedCount: completedTodos.length };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error deleting completed todos:", error);
      throw new Error("Failed to delete completed todos");
    }
  },
});