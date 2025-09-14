'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings, Edit, Trash2, Loader2 } from 'lucide-react'

interface Category {
  _id: string
  name: string
  color: string
}

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export function CategoryManager() {
  const categories = useQuery(api.categories.getCategories)
  const updateCategory = useMutation(api.categories.updateCategory)
  const deleteCategory = useMutation(api.categories.deleteCategory)

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory || !editName.trim()) return

    setIsUpdating(true)
    try {
      await updateCategory({
        id: editingCategory._id,
        name: editName.trim(),
        color: editColor,
      })
      setEditingCategory(null)
      setEditName('')
      setEditColor('')
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    setIsDeleting(categoryId)
    try {
      await deleteCategory({ id: categoryId })
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const startEditing = (category: Category) => {
    setEditingCategory(category)
    setEditName(category.name)
    setEditColor(category.color)
  }

  const cancelEditing = () => {
    setEditingCategory(null)
    setEditName('')
    setEditColor('')
  }

  if (categories === undefined) {
    return <div className="h-32 bg-muted animate-pulse rounded" />
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-title flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          Category Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-body text-muted-foreground">
                No categories yet. Default categories will be created automatically.
              </p>
            </div>
          ) : (
            categories.map((category: Category) => (
              <div
                key={category._id}
                className="card-interactive flex items-center justify-between p-4 border rounded-lg hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full ring-2 ring-offset-2 transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: category.color,
                      borderColor: category.color,
                    }}
                  />
                  <span className="text-body font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(category)}
                        className="btn-interactive text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-title">Edit Category</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditCategory} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="edit-category-name" className="text-label font-medium">
                            Category Name
                          </Label>
                          <Input
                            id="edit-category-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Enter category name"
                            className="transition-smooth focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-label font-medium">Color</Label>
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            {CATEGORY_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                  editColor === color
                                    ? 'border-foreground ring-2 ring-offset-2'
                                    : 'border-muted hover:border-foreground/50'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setEditColor(color)}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                            className="btn-interactive"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={!editName.trim() || isUpdating}
                            className="btn-interactive"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Update Category'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category._id)}
                    disabled={isDeleting === category._id}
                    className="btn-interactive text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isDeleting === category._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
