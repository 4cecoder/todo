'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface Todo {
  _id: string
  userId: string
  categoryId?: string
  title: string
  description?: string
  completed: boolean
  createdAt: number
  updatedAt: number
}

interface Category {
  _id: string
  name: string
  color: string
}

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  Plus,
  Filter,
  Circle,
  Loader2,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit3,
  Archive,
  X,
} from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'
import { CategorySelector, CategoryBadge } from '@/components/CategorySelector'
import { cn } from '@/lib/utils'

export default function TodosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todos = useQuery(api.todos.getTodos as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = useQuery(api.categories.getCategories as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createTodo = useMutation(api.todos.createTodo as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTodo = useMutation(api.todos.updateTodo as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleteTodo = useMutation(api.todos.deleteTodo as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createDefaultCategories = useMutation(api.categories.createDefaultCategories as any)

  // Enhanced state management
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoDescription, setNewTodoDescription] = useState('')
  const [newTodoCategoryId, setNewTodoCategoryId] = useState<string | undefined>()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>()
  const [updatingTodos, setUpdatingTodos] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'completed'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', categoryId: '' })
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'completed'>('all')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Create default categories on first load if user has none
  useEffect(() => {
    if (categories !== undefined && categories.length === 0) {
      createDefaultCategories()
    }
  }, [categories, createDefaultCategories])

  // Enhanced filtering and sorting with useMemo
  const filteredAndSortedTodos = useMemo(() => {
    if (!todos) return []

    let filtered = todos.filter((todo: Todo) => {
      // Category filter
      if (selectedCategoryFilter) {
        if (selectedCategoryFilter === 'none' && todo.categoryId) return false
        if (selectedCategoryFilter !== 'none' && todo.categoryId !== selectedCategoryFilter)
          return false
      }

      // View mode filter
      if (viewMode === 'active' && todo.completed) return false
      if (viewMode === 'completed' && !todo.completed) return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const titleMatch = todo.title.toLowerCase().includes(query)
        const descriptionMatch = todo.description?.toLowerCase().includes(query)
        if (!titleMatch && !descriptionMatch) return false
      }

      return true
    })

    // Sorting
    filtered.sort((a: Todo, b: Todo) => {
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'completed':
          comparison = a.completed === b.completed ? 0 : a.completed ? 1 : -1
          break
        case 'createdAt':
        default:
          comparison = a.createdAt - b.createdAt
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [todos, selectedCategoryFilter, viewMode, searchQuery, sortBy, sortOrder])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      // Ctrl/Cmd + N to create new todo
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        formRef.current?.querySelector('input')?.focus()
      }

      // Escape to clear search
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('')
        searchInputRef.current?.blur()
      }
    },
    [setSearchQuery]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Bulk actions handlers
  const handleSelectTodo = useCallback((todoId: string) => {
    setSelectedTodos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(todoId)) {
        newSet.delete(todoId)
      } else {
        newSet.add(todoId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedTodos.size === filteredAndSortedTodos.length) {
      setSelectedTodos(new Set())
    } else {
      setSelectedTodos(new Set(filteredAndSortedTodos.map((todo: Todo) => todo._id)))
    }
  }, [filteredAndSortedTodos, selectedTodos.size])

  const handleBulkDelete = useCallback(async () => {
    if (selectedTodos.size === 0) return

    const todoIds = Array.from(selectedTodos)
    setUpdatingTodos((prev) => new Set([...prev, ...todoIds]))

    try {
      await Promise.all(todoIds.map((id) => deleteTodo({ id })))
      setSelectedTodos(new Set())
    } catch (error) {
      console.error('Error bulk deleting todos:', error)
    } finally {
      setUpdatingTodos((prev) => {
        const newSet = new Set(prev)
        todoIds.forEach((id) => newSet.delete(id))
        return newSet
      })
    }
  }, [selectedTodos, deleteTodo])

  const handleBulkToggleComplete = useCallback(
    async (completed: boolean) => {
      if (selectedTodos.size === 0) return

      const todoIds = Array.from(selectedTodos)
      setUpdatingTodos((prev) => new Set([...prev, ...todoIds]))

      try {
        await Promise.all(todoIds.map((id) => updateTodo({ id, completed })))
      } catch (error) {
        console.error('Error bulk updating todos:', error)
      } finally {
        setUpdatingTodos((prev) => {
          const newSet = new Set(prev)
          todoIds.forEach((id) => newSet.delete(id))
          return newSet
        })
      }
    },
    [selectedTodos, updateTodo]
  )

  // Edit todo handlers
  const startEditing = useCallback((todo: Todo) => {
    setEditingTodo(todo._id)
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      categoryId: todo.categoryId || '',
    })
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingTodo(null)
    setEditForm({ title: '', description: '', categoryId: '' })
  }, [])

  const saveEdit = useCallback(
    async (todoId: string) => {
      if (!editForm.title.trim()) return

      setUpdatingTodos((prev) => new Set(prev).add(todoId))

      try {
        await updateTodo({
          id: todoId,
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          categoryId: editForm.categoryId || undefined,
        })
        cancelEditing()
      } catch (error) {
        console.error('Error updating todo:', error)
      } finally {
        setUpdatingTodos((prev) => {
          const newSet = new Set(prev)
          newSet.delete(todoId)
          return newSet
        })
      }
    },
    [editForm, updateTodo, cancelEditing]
  )

  // Toggle todo expansion
  const toggleTodoExpansion = useCallback((todoId: string) => {
    setExpandedTodos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(todoId)) {
        newSet.delete(todoId)
      } else {
        newSet.add(todoId)
      }
      return newSet
    })
  }, [])

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, todoId: string) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', todoId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetTodoId: string) => {
    e.preventDefault()
    setIsDragging(false)

    const draggedTodoId = e.dataTransfer.getData('text/plain')
    if (draggedTodoId === targetTodoId) return

    // This would implement reordering logic
    console.log('Reorder todo:', draggedTodoId, 'to:', targetTodoId)
  }, [])

  // Toggle bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedTodos.size > 0)
  }, [selectedTodos.size])

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return

    setIsCreating(true)
    try {
      await createTodo({
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim() || undefined,
        categoryId: newTodoCategoryId,
      })
      setNewTodoTitle('')
      setNewTodoDescription('')
      setNewTodoCategoryId(undefined)
    } catch (error) {
      console.error('Error creating todo:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleComplete = async (todoId: string, completed: boolean) => {
    setUpdatingTodos((prev) => new Set(prev).add(todoId))
    try {
      await updateTodo({ id: todoId, completed })
    } catch (error) {
      console.error('Error updating todo:', error)
    } finally {
      setUpdatingTodos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(todoId)
        return newSet
      })
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    setUpdatingTodos((prev) => new Set(prev).add(todoId))
    try {
      await deleteTodo({ id: todoId })
    } catch (error) {
      console.error('Error deleting todo:', error)
    } finally {
      setUpdatingTodos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(todoId)
        return newSet
      })
    }
  }

  const getCategoryById = (categoryId?: string) => {
    return categories?.find((cat: Category) => cat._id === categoryId)
  }

  const completedCount = todos?.filter((todo: Todo) => todo.completed).length || 0
  const totalCount = todos?.length || 0
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Statistics for current view
  const viewCompletedCount = filteredAndSortedTodos.filter((todo: Todo) => todo.completed).length
  const viewTotalCount = filteredAndSortedTodos.length

  if (todos === undefined || categories === undefined) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your todos...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Enhanced Header with Search and Controls */}
          <header className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-display mb-2">My Todos</h1>
                <p className="text-body text-muted-foreground mb-4">
                  Stay organized and get things done
                </p>

                {/* Enhanced Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search todos... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 transition-smooth focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="text-caption text-muted-foreground">
                    {completedCount} of {totalCount} completed
                  </div>
                  <div className="progress-bar w-32 h-2">
                    <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
                  </div>
                  <span className="text-label font-medium text-primary">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Controls Bar */}
            <div
              className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/30 backdrop-blur-sm p-4 rounded-lg border transition-all duration-300',
                showBulkActions && 'ring-2 ring-primary/50 bg-primary/5'
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                  {(['all', 'active', 'completed'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                        viewMode === mode
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {mode === 'all' ? 'All' : mode === 'active' ? 'Active' : 'Completed'}
                    </button>
                  ))}
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: 'createdAt' | 'title' | 'completed') => setSortBy(value)}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="completed">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-8 w-8 p-0"
                  >
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedTodos.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedTodos.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkToggleComplete(true)}
                    className="h-8"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkToggleComplete(false)}
                    className="h-8"
                  >
                    <Circle className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTodos(new Set())}
                    className="h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Enhanced Category Statistics */}
          {categories && categories.length > 0 && (
            <Card className="card-elevated mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-title flex items-center gap-2">
                    <Filter className="w-6 h-6 text-primary" />
                    Category Overview
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Archive completed todos functionality
                      const completedTodos = todos?.filter((todo: Todo) => todo.completed) || []
                      if (completedTodos.length > 0) {
                        if (confirm(`Archive ${completedTodos.length} completed todos?`)) {
                          // This would integrate with an archive feature
                          console.log('Archive completed todos')
                        }
                      }
                    }}
                    className="btn-interactive"
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories.map((category: Category) => {
                    const categoryTodos =
                      todos?.filter((todo: Todo) => todo.categoryId === category._id) || []
                    const completedCount = categoryTodos.filter(
                      (todo: Todo) => todo.completed
                    ).length
                    const totalCount = categoryTodos.length
                    const completionRate =
                      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

                    return (
                      <div
                        key={category._id}
                        className={cn(
                          'card-interactive text-center p-4 rounded-lg bg-card border hover:shadow-md cursor-pointer group',
                          selectedCategoryFilter === category._id &&
                            'ring-2 ring-primary/50 bg-primary/5'
                        )}
                        onClick={() =>
                          setSelectedCategoryFilter(
                            selectedCategoryFilter === category._id ? undefined : category._id
                          )
                        }
                      >
                        <div className="flex items-center justify-center mb-3">
                          <div
                            className="w-4 h-4 rounded-full mr-2 ring-2 ring-offset-2 group-hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: category.color,
                              borderColor: category.color,
                            }}
                          />
                          <span className="text-label font-medium truncate group-hover:text-primary transition-colors">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{totalCount}</div>
                        <div className="text-caption text-muted-foreground mb-2">
                          {completedCount}/{totalCount} done
                        </div>
                        <div className="progress-bar h-1.5">
                          <div
                            className="progress-fill group-hover:opacity-80 transition-opacity"
                            style={{
                              width: `${completionRate}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                        {totalCount === 0 && (
                          <div className="text-xs text-muted-foreground mt-2">No todos</div>
                        )}
                      </div>
                    )
                  })}
                  <div
                    className={cn(
                      'card-interactive text-center p-4 rounded-lg bg-card border hover:shadow-md cursor-pointer group',
                      selectedCategoryFilter === 'none' && 'ring-2 ring-primary/50 bg-primary/5'
                    )}
                    onClick={() =>
                      setSelectedCategoryFilter(
                        selectedCategoryFilter === 'none' ? undefined : 'none'
                      )
                    }
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-4 h-4 rounded-full mr-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors" />
                      <span className="text-label font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        No Category
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {todos?.filter((todo: Todo) => !todo.categoryId).length || 0}
                    </div>
                    <div className="text-caption text-muted-foreground">uncategorized</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Category Filter */}
          <Card className="card-elevated mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Filter className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-subheading font-medium">Filter by category</h3>
                    <p className="text-caption text-muted-foreground">
                      Focus on specific categories
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select
                    value={selectedCategoryFilter || 'all'}
                    onValueChange={(val) =>
                      setSelectedCategoryFilter(val === 'all' ? undefined : val)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          All categories
                        </div>
                      </SelectItem>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                          No category
                        </div>
                      </SelectItem>
                      {categories.map((category: Category) => (
                        <SelectItem key={category._id} value={category._id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full ring-1 ring-offset-1"
                              style={{
                                backgroundColor: category.color,
                                borderColor: category.color,
                              }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Additional Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategoryFilter(undefined)
                      setSearchQuery('')
                      setViewMode('all')
                    }}
                    className="btn-interactive whitespace-nowrap"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Create Todo Form */}
          <Card className="card-elevated mb-8 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-smooth">
            <CardHeader className="pb-4">
              <CardTitle className="text-title flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                Add New Todo
                <span className="text-caption text-muted-foreground font-normal ml-auto">
                  Press Ctrl+N to focus
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleCreateTodo} className="space-lg">
                <div className="space-y-2">
                  <label htmlFor="todo-title" className="text-label font-medium">
                    Title *
                  </label>
                  <Input
                    id="todo-title"
                    placeholder="What needs to be done?"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    required
                    aria-describedby="title-help"
                    className="transition-smooth focus:ring-2 focus:ring-primary/20"
                  />
                  <p id="title-help" className="text-helper text-muted-foreground">
                    Enter a clear, actionable title for your todo
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="todo-description" className="text-label font-medium">
                    Description
                  </label>
                  <Textarea
                    id="todo-description"
                    placeholder="Add more details (optional)..."
                    value={newTodoDescription}
                    onChange={(e) => setNewTodoDescription(e.target.value)}
                    rows={3}
                    className="transition-smooth focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <CategorySelector
                  value={newTodoCategoryId}
                  onChange={setNewTodoCategoryId}
                  placeholder="Select category (optional)"
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!newTodoTitle.trim() || isCreating}
                    className="btn-interactive flex-1 sm:flex-none px-8 py-3 text-base font-medium"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Todo
                      </>
                    )}
                  </Button>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewTodoTitle('')
                        setNewTodoDescription('')
                        setNewTodoCategoryId(undefined)
                      }}
                      className="btn-interactive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const sampleTitle = 'Quick todo example'
                        setNewTodoTitle(sampleTitle)
                        setNewTodoDescription('This is a sample todo created with quick action')
                      }}
                      className="btn-interactive"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Quick Add
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Enhanced Todos List with Select All */}
          <div className="space-lg">
            {/* Select All Header */}
            {filteredAndSortedTodos.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border mb-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      selectedTodos.size === filteredAndSortedTodos.length &&
                      filteredAndSortedTodos.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="w-4 h-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    aria-label="Select all todos"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedTodos.size > 0
                      ? `${selectedTodos.size} of ${filteredAndSortedTodos.length} selected`
                      : `${filteredAndSortedTodos.length} items`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{viewCompletedCount} completed</span>
                  <span>•</span>
                  <span>{viewTotalCount - viewCompletedCount} active</span>
                </div>
              </div>
            )}
            {filteredAndSortedTodos.length === 0 ? (
              <Card className="card-elevated border-2 border-dashed border-muted">
                <CardContent className="empty-state">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="empty-state-icon">
                      {searchQuery ? (
                        <Search className="w-full h-full" />
                      ) : viewMode === 'completed' ? (
                        <CheckCircle2 className="w-full h-full" />
                      ) : viewMode === 'active' ? (
                        <Clock className="w-full h-full" />
                      ) : (
                        <Circle className="w-full h-full" />
                      )}
                    </div>
                    <div className="max-w-md text-center">
                      <h3 className="text-heading text-foreground mb-3">
                        {searchQuery
                          ? 'No todos found'
                          : viewMode === 'completed'
                            ? 'No completed todos yet'
                            : viewMode === 'active'
                              ? 'No active todos - great job!'
                              : selectedCategoryFilter
                                ? 'No todos in this category'
                                : 'No todos yet'}
                      </h3>
                      <p className="text-body text-muted-foreground mb-6">
                        {searchQuery
                          ? `No todos match "${searchQuery}". Try a different search term or clear the search.`
                          : viewMode === 'completed'
                            ? 'Complete some todos to see them here.'
                            : viewMode === 'active'
                              ? 'All todos are completed! Time to create new ones.'
                              : selectedCategoryFilter
                                ? 'Try selecting a different category or create a new todo to get started.'
                                : 'Ready to get organized? Create your first todo and start building productive habits.'}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {searchQuery && (
                          <Button
                            onClick={() => setSearchQuery('')}
                            variant="outline"
                            className="btn-interactive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Search
                          </Button>
                        )}
                        {!searchQuery && !selectedCategoryFilter && viewMode === 'all' && (
                          <Button
                            onClick={() => formRef.current?.querySelector('input')?.focus()}
                            className="btn-interactive"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Todo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredAndSortedTodos.map((todo: Todo) => (
                <Card
                  key={todo._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo._id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, todo._id)}
                  className={cn(
                    'card-interactive transition-all duration-300 group',
                    todo.completed && 'opacity-75 bg-muted/30',
                    !todo.completed && 'hover:shadow-lg hover:-translate-y-0.5',
                    selectedTodos.has(todo._id) && 'ring-2 ring-primary/50 bg-primary/5',
                    isDragging && 'opacity-50 cursor-move'
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Bulk Selection Checkbox */}
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedTodos.has(todo._id)}
                          onCheckedChange={() => handleSelectTodo(todo._id)}
                          disabled={updatingTodos.has(todo._id)}
                          className="w-4 h-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          aria-label={`Select todo: ${todo.title}`}
                        />
                        <div className="pt-1">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={(checked) =>
                              handleToggleComplete(todo._id, checked as boolean)
                            }
                            disabled={updatingTodos.has(todo._id)}
                            className="w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Edit Mode */}
                        {editingTodo === todo._id ? (
                          <div className="space-y-3">
                            <Input
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, title: e.target.value }))
                              }
                              placeholder="Todo title"
                              className="transition-smooth focus:ring-2 focus:ring-primary/20"
                              autoFocus
                            />
                            <Textarea
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, description: e.target.value }))
                              }
                              placeholder="Description (optional)"
                              rows={2}
                              className="transition-smooth focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <CategorySelector
                                value={editForm.categoryId}
                                onChange={(categoryId) =>
                                  setEditForm((prev) => ({ ...prev, categoryId: categoryId || '' }))
                                }
                                placeholder="Select category"
                              />
                              <div className="flex gap-2 ml-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="h-8"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(todo._id)}
                                  disabled={!editForm.title.trim() || updatingTodos.has(todo._id)}
                                  className="h-8"
                                >
                                  {updatingTodos.has(todo._id) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Save'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* View Mode */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                              <h3
                                className={cn(
                                  'text-body font-medium break-words transition-all duration-200 cursor-pointer select-none',
                                  todo.completed && 'line-through text-muted-foreground',
                                  !todo.completed && 'text-foreground hover:text-primary'
                                )}
                                onClick={() => toggleTodoExpansion(todo._id)}
                              >
                                {todo.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <CategoryBadge
                                  category={getCategoryById(todo.categoryId)}
                                  size="sm"
                                />
                                {todo.description && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleTodoExpansion(todo._id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {expandedTodos.has(todo._id) ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Expandable Description */}
                            {todo.description && expandedTodos.has(todo._id) && (
                              <p
                                className={cn(
                                  'text-caption break-words mb-3 transition-all duration-200',
                                  todo.completed && 'line-through text-muted-foreground',
                                  !todo.completed && 'text-muted-foreground'
                                )}
                              >
                                {todo.description}
                              </p>
                            )}

                            {/* Actions and Metadata */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-helper text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(todo.createdAt).toLocaleDateString()}
                                </span>
                                {todo.completed && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                  </span>
                                )}
                                {updatingTodos.has(todo._id) && (
                                  <span className="flex items-center gap-1 text-primary">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Updating...
                                  </span>
                                )}
                              </div>

                              {/* Enhanced Action Buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(todo)}
                                  disabled={updatingTodos.has(todo._id)}
                                  className="h-8 w-8 p-0"
                                  aria-label="Edit todo"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // More actions menu - could be expanded to a dropdown
                                    if (confirm('Mark this todo as important?')) {
                                      console.log('Mark as important:', todo.title)
                                    }
                                  }}
                                  disabled={updatingTodos.has(todo._id)}
                                  className="h-8 w-8 p-0"
                                  aria-label="More actions"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTodo(todo._id)}
                                  disabled={updatingTodos.has(todo._id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  aria-label="Delete todo"
                                >
                                  {updatingTodos.has(todo._id) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
