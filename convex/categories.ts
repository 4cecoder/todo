import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  { name: "Work", color: "#3B82F6" },
  { name: "Personal", color: "#10B981" },
  { name: "Health", color: "#F59E0B" },
  { name: "Learning", color: "#8B5CF6" },
  { name: "Shopping", color: "#EF4444" },
  { name: "Travel", color: "#06B6D4" },
];

export const getCategories = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("categories")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

export const getCategory = query({
  args: { id: v.id("categories") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || category.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return category;
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if category name already exists for this user
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_user_name", (q: any) =>
        q.eq("userId", user._id).eq("name", args.name)
      )
      .first();

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const categoryId = await ctx.db.insert("categories", {
      userId: user._id,
      name: args.name.trim(),
      color: args.color,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || category.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // If updating name, check for duplicates
    if (args.name !== undefined) {
      const existingCategory = await ctx.db
        .query("categories")
        .withIndex("by_user_name", (q: any) =>
          q.eq("userId", user._id).eq("name", args.name)
        )
        .first();

      if (existingCategory && existingCategory._id !== args.id) {
        throw new Error("Category with this name already exists");
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name.trim() }),
      ...(args.color !== undefined && { color: args.color }),
    });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || category.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Check if category is being used by any todos
    const todosUsingCategory = await ctx.db
      .query("todos")
      .withIndex("by_category", (q: any) => q.eq("categoryId", args.id))
      .collect();

    if (todosUsingCategory.length > 0) {
      throw new Error("Cannot delete category that is being used by todos");
    }

    await ctx.db.delete(args.id);
  },
});

export const createDefaultCategories = mutation({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has categories
    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    if (existingCategories.length > 0) {
      return; // User already has categories
    }

    // Create default categories
    const categoryIds = [];
    for (const defaultCategory of DEFAULT_CATEGORIES) {
      const categoryId = await ctx.db.insert("categories", {
        userId: user._id,
        name: defaultCategory.name,
        color: defaultCategory.color,
        createdAt: Date.now(),
      });
      categoryIds.push(categoryId);
    }

    return categoryIds;
  },
});