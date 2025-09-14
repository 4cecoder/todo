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

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(), // Hex color code like "#FF6B6B"
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  todos: defineTable({
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completed"])
    .index("by_category", ["categoryId"])
    .index("by_user_category", ["userId", "categoryId"]),
});