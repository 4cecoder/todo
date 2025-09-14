'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Settings, LayoutGrid, List, KanbanSquare, Bell, Save, Loader2 } from 'lucide-react'
import { useProfile } from './contexts/ProfileContext'
import { TodoPreferences } from './types/profile'
import {
  VIEW_OPTIONS,
  SORT_OPTIONS,
  PRIORITY_OPTIONS,
  DEFAULT_TODO_PREFERENCES,
} from './utils/constants'
import { cn } from '@/lib/utils'

interface TodoPreferencesSectionProps {
  className?: string
}

interface ViewOption {
  value: string
  label: string
}

interface SortOption {
  value: string
  label: string
}

interface PriorityOption {
  value: string
  label: string
}

export const TodoPreferencesSection: React.FC<TodoPreferencesSectionProps> = ({ className }) => {
  const { state, updatePreferences } = useProfile()
  const [preferences, setPreferences] = useState<TodoPreferences>(DEFAULT_TODO_PREFERENCES)

  // Initialize preferences from state
  useEffect(() => {
    if (state.preferences) {
      setPreferences(state.preferences)
    }
  }, [state.preferences])

  const handleDisplayChange = (key: keyof TodoPreferences['display'], value: any) => {
    setPreferences((prev) => ({
      ...prev,
      display: { ...prev.display, [key]: value },
    }))
  }

  const handleNotificationChange = (
    key: keyof TodoPreferences['notifications'],
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  const handleBehaviorChange = (key: keyof TodoPreferences['behavior'], value: any) => {
    setPreferences((prev) => ({
      ...prev,
      behavior: { ...prev.behavior, [key]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updatePreferences(preferences)
  }

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'grid':
        return <LayoutGrid className="w-4 h-4" />
      case 'kanban':
        return <KanbanSquare className="w-4 h-4" />
      default:
        return <List className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5" />
            <span>Display Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default View */}
          <div className="space-y-2">
            <Label>Default View</Label>
            <Select
              value={preferences.display.defaultView}
              onValueChange={(value) => handleDisplayChange('defaultView', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default view" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_OPTIONS.map((option: ViewOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      {getViewIcon(option.value)}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={preferences.display.sortBy}
              onValueChange={(value) => handleDisplayChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sort option" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option: SortOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Per Page */}
          <div className="space-y-2">
            <Label htmlFor="itemsPerPage">Items Per Page</Label>
            <Input
              id="itemsPerPage"
              type="number"
              min="5"
              max="100"
              value={preferences.display.itemsPerPage}
              onChange={(e) => handleDisplayChange('itemsPerPage', parseInt(e.target.value) || 10)}
            />
            <p className="text-sm text-muted-foreground">
              Number of todos to show per page (5-100)
            </p>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showCompleted"
                checked={preferences.display.showCompleted}
                onCheckedChange={(checked) =>
                  handleDisplayChange('showCompleted', checked as boolean)
                }
              />
              <Label htmlFor="showCompleted" className="cursor-pointer">
                Show completed todos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="compactMode"
                checked={preferences.display.compactMode}
                onCheckedChange={(checked) =>
                  handleDisplayChange('compactMode', checked as boolean)
                }
              />
              <Label htmlFor="compactMode" className="cursor-pointer">
                Use compact mode
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailReminders"
                checked={preferences.notifications.emailReminders}
                onCheckedChange={(checked) =>
                  handleNotificationChange('emailReminders', checked as boolean)
                }
              />
              <Label htmlFor="emailReminders" className="cursor-pointer">
                Email reminders
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pushNotifications"
                checked={preferences.notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange('pushNotifications', checked as boolean)
                }
              />
              <Label htmlFor="pushNotifications" className="cursor-pointer">
                Push notifications
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dailyDigest"
                checked={preferences.notifications.dailyDigest}
                onCheckedChange={(checked) =>
                  handleNotificationChange('dailyDigest', checked as boolean)
                }
              />
              <Label htmlFor="dailyDigest" className="cursor-pointer">
                Daily digest
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="weeklySummary"
                checked={preferences.notifications.weeklySummary}
                onCheckedChange={(checked) =>
                  handleNotificationChange('weeklySummary', checked as boolean)
                }
              />
              <Label htmlFor="weeklySummary" className="cursor-pointer">
                Weekly summary
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dueDateAlerts"
                checked={preferences.notifications.dueDateAlerts}
                onCheckedChange={(checked) =>
                  handleNotificationChange('dueDateAlerts', checked as boolean)
                }
              />
              <Label htmlFor="dueDateAlerts" className="cursor-pointer">
                Due date alerts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdueAlerts"
                checked={preferences.notifications.overdueAlerts}
                onCheckedChange={(checked) =>
                  handleNotificationChange('overdueAlerts', checked as boolean)
                }
              />
              <Label htmlFor="overdueAlerts" className="cursor-pointer">
                Overdue alerts
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Behavior Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Category */}
          <div className="space-y-2">
            <Label>Default Category</Label>
            <Select
              value={preferences.behavior.defaultCategory || ''}
              onValueChange={(value) => handleBehaviorChange('defaultCategory', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-muted-foreground">No default category</span>
                </SelectItem>
                {/* This would be populated with actual categories from the app */}
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default Priority */}
          <div className="space-y-2">
            <Label>Default Priority</Label>
            <Select
              value={preferences.behavior.priorityDefault}
              onValueChange={(value) => handleBehaviorChange('priorityDefault', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option: PriorityOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span className={cn('font-medium', getPriorityColor(option.value))}>
                        {option.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDateDefault">Default Due Date (days from creation)</Label>
            <Input
              id="dueDateDefault"
              type="number"
              min="0"
              max="365"
              value={preferences.behavior.dueDateDefault}
              onChange={(e) =>
                handleBehaviorChange('dueDateDefault', parseInt(e.target.value) || 0)
              }
            />
            <p className="text-sm text-muted-foreground">
              Number of days from creation to set as default due date (0 = no due date)
            </p>
          </div>

          {/* Behavior Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoArchiveCompleted"
                checked={preferences.behavior.autoArchiveCompleted}
                onCheckedChange={(checked) =>
                  handleBehaviorChange('autoArchiveCompleted', checked as boolean)
                }
              />
              <Label htmlFor="autoArchiveCompleted" className="cursor-pointer">
                Auto-archive completed todos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="timeEstimates"
                checked={preferences.behavior.timeEstimates}
                onCheckedChange={(checked) =>
                  handleBehaviorChange('timeEstimates', checked as boolean)
                }
              />
              <Label htmlFor="timeEstimates" className="cursor-pointer">
                Enable time estimates
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-4">
        {state.showSuccess && (
          <Badge variant="default" className="bg-green-500">
            Preferences saved successfully!
          </Badge>
        )}
        <Button type="submit" disabled={state.isSubmitting}>
          {state.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
