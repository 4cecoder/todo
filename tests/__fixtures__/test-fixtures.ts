// Test fixtures for unit tests
import { createTodo, createUser } from '../__utils__/test-helpers'

// Common test data fixtures
export const fixtures = {
  // User fixtures
  users: {
    default: createUser(),
    admin: createUser({
      id: 'admin-user-id',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    }),
    unauthenticated: null,
  },

  // Todo fixtures
  todos: {
    default: createTodo(),
    completed: createTodo({
      _id: 'completed-todo-id',
      title: 'Completed Todo',
      completed: true,
    }),
    withDescription: createTodo({
      _id: 'desc-todo-id',
      title: 'Todo with Description',
      description: 'This is a detailed description',
    }),
    multiple: [
      createTodo({ _id: 'todo-1', title: 'First Todo' }),
      createTodo({ _id: 'todo-2', title: 'Second Todo', completed: true }),
      createTodo({ _id: 'todo-3', title: 'Third Todo' }),
    ],
  },

  // Category fixtures
  categories: {
    work: {
      _id: 'work-category-id',
      name: 'Work',
      color: '#FF6B6B',
      userId: 'test-user-id',
    },
    personal: {
      _id: 'personal-category-id',
      name: 'Personal',
      color: '#4ECDC4',
      userId: 'test-user-id',
    },
    shopping: {
      _id: 'shopping-category-id',
      name: 'Shopping',
      color: '#45B7D1',
      userId: 'test-user-id',
    },
  },

  // Form data fixtures
  forms: {
    todo: {
      title: 'Test Todo',
      description: 'Test description',
      categoryId: 'work-category-id',
    },
    user: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    },
  },

  // API response fixtures
  responses: {
    success: {
      status: 200,
      data: { success: true },
    },
    error: {
      status: 400,
      data: { error: 'Bad Request' },
    },
    unauthorized: {
      status: 401,
      data: { error: 'Unauthorized' },
    },
    notFound: {
      status: 404,
      data: { error: 'Not Found' },
    },
  },
}
