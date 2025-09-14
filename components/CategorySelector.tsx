'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Loader2 } from 'lucide-react'

interface Category {
  _id: string
  name: string
  color: string
}

interface CategorySelectorProps {
  value?: string
  onChange: (categoryId: string | undefined) => void
  placeholder?: string
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

export function CategorySelector({
  value,
  onChange,
  placeholder = 'Select category',
}: CategorySelectorProps) {
  const categories = useQuery(api.categories.getCategories)
  const createCategory = useMutation(api.categories.createCategory)

  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setIsCreating(true)
    try {
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      })
      onChange(categoryId)
      setNewCategoryName('')
      setNewCategoryColor(CATEGORY_COLORS[0])
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const selectedCategory = categories?.find((cat: Category) => cat._id === value)

  if (categories === undefined) {
    return <div className="h-10 bg-muted animate-pulse rounded" />
  }

  return (
    <div className="space-y-2">
      <Label className="text-label font-medium">Category</Label>
      <div className="flex gap-2">
        <Select
          value={value || ''}
          onValueChange={(val) => onChange(val === 'none' ? undefined : val)}
        >
          <SelectTrigger className="flex-1 transition-smooth focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder={placeholder}>
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-offset-1"
                    style={{
                      backgroundColor: selectedCategory.color,
                      borderColor: selectedCategory.color,
                    }}
                  />
                  {selectedCategory.name}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="btn-interactive flex-shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-title">Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category-name" className="text-label font-medium">
                  Category Name
                </Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
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
                        newCategoryColor === color
                          ? 'border-foreground ring-2 ring-offset-2'
                          : 'border-muted hover:border-foreground/50'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="btn-interactive"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newCategoryName.trim() || isCreating}
                  className="btn-interactive"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Category'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

interface CategoryBadgeProps {
  category?: Category
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  if (!category) return null

  return (
    <Badge
      variant="secondary"
      className={`${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{
        backgroundColor: `${category.color}20`,
        borderColor: category.color,
        color: category.color,
      }}
    >
      <div
        className={`w-2 h-2 rounded-full mr-1 ${size === 'sm' ? 'w-1.5 h-1.5' : ''}`}
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </Badge>
  )
}
