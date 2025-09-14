import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TodosPage from '@/app/todos/page'

// Create a mock QueryClient
const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

describe('TodosPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createMockQueryClient()
    jest.clearAllMocks()
  })

  it('renders loading state when todos are undefined', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders empty state when no todos exist', () => {
    // Mock the useQuery to return empty array
    const mockUseQuery = require('convex/react').useQuery
    mockUseQuery.mockReturnValue([])

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    expect(screen.getByText('No todos yet. Create your first one above!')).toBeInTheDocument()
  })

  it('renders todos list when todos exist', () => {
    const mockTodos = [
      {
        _id: 'todo-1',
        userId: 'user-1',
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    // Mock the useQuery to return mock todos
    const mockUseQuery = require('convex/react').useQuery
    mockUseQuery.mockReturnValue(mockTodos)

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('allows creating a new todo', async () => {
    const mockCreateTodo = jest.fn()
    const mockUseMutation = require('convex/react').useMutation
    mockUseMutation.mockReturnValue(jest.fn().mockImplementation(() => mockCreateTodo))

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    const titleInput = screen.getByPlaceholderText('Todo title...')
    const descriptionInput = screen.getByPlaceholderText('Description (optional)...')
    const submitButton = screen.getByRole('button', { name: /add todo/i })

    fireEvent.change(titleInput, { target: { value: 'New Todo' } })
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'New Description',
      })
    })
  })

  it('disables submit button when title is empty', () => {
    const mockUseMutation = require('convex/react').useMutation
    mockUseMutation.mockReturnValue(jest.fn().mockImplementation(() => jest.fn()))

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    const submitButton = screen.getByRole('button', { name: /add todo/i })

    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when creating', async () => {
    const mockCreateTodo = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
    const mockUseMutation = require('convex/react').useMutation
    mockUseMutation.mockReturnValue(jest.fn().mockImplementation(() => mockCreateTodo))

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    const titleInput = screen.getByPlaceholderText('Todo title...')
    const submitButton = screen.getByRole('button', { name: /add todo/i })

    fireEvent.change(titleInput, { target: { value: 'New Todo' } })
    fireEvent.click(submitButton)

    expect(submitButton).toHaveTextContent('Creating...')
    expect(submitButton).toBeDisabled()
  })

  it('toggles todo completion', async () => {
    const mockTodos = [
      {
        _id: 'todo-1',
        userId: 'user-1',
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    const mockUpdateTodo = jest.fn()
    const mockUseQuery = require('convex/react').useQuery
    const mockUseMutation = require('convex/react').useMutation

    mockUseQuery.mockReturnValue(mockTodos)
    mockUseMutation.mockReturnValue(jest.fn().mockImplementation(() => mockUpdateTodo))

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledWith({
        id: 'todo-1',
        completed: true,
      })
    })
  })

  it('deletes a todo', async () => {
    const mockTodos = [
      {
        _id: 'todo-1',
        userId: 'user-1',
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    const mockDeleteTodo = jest.fn()
    const mockUseQuery = require('convex/react').useQuery
    const mockUseMutation = require('convex/react').useMutation

    mockUseQuery.mockReturnValue(mockTodos)
    mockUseMutation.mockReturnValue(jest.fn().mockImplementation(() => mockDeleteTodo))

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith({ id: 'todo-1' })
    })
  })

  it('shows error message when creating todo fails', async () => {
    const mockCreateTodo = jest.fn().mockRejectedValue(new Error('Failed to create todo'))
    const mockUseMutation = require('convex/react').useMutation
    mockUseMutation.mockReturnValue(jest.fn().mockImplementation(() => mockCreateTodo))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <QueryClientProvider client={queryClient}>
        <TodosPage />
      </QueryClientProvider>
    )

    const titleInput = screen.getByPlaceholderText('Todo title...')
    const submitButton = screen.getByRole('button', { name: /add todo/i })

    fireEvent.change(titleInput, { target: { value: 'New Todo' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating todo:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
