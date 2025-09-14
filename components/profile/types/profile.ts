// Profile-related TypeScript interfaces and types

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  phone?: string | undefined
  birthday?: string | undefined
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined
  timezone: string | undefined
  language: string | undefined
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  birthday?: string
  gender?: UserProfile['gender']
  timezone: string
  language: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface TodoPreferences {
  display: {
    defaultView: 'list' | 'grid' | 'kanban'
    sortBy: 'date' | 'priority' | 'category' | 'custom'
    itemsPerPage: number
    showCompleted: boolean
    compactMode: boolean
  }
  notifications: {
    emailReminders: boolean
    pushNotifications: boolean
    dailyDigest: boolean
    weeklySummary: boolean
    dueDateAlerts: boolean
    overdueAlerts: boolean
  }
  behavior: {
    defaultCategory: string | null
    autoArchiveCompleted: boolean
    dueDateDefault: number // days from creation
    timeEstimates: boolean
    priorityDefault: 'low' | 'medium' | 'high'
  }
}

export interface FormErrors {
  [key: string]: string | undefined
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  birthday?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export interface ProfileStats {
  totalTodos: number
  completedTodos: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  memberSince: Date
  lastActive: Date
}

export interface SecurityStatus {
  twoFactorEnabled: boolean
  emailVerified: boolean
  activeSessions: number
  lastPasswordChange: Date | null
  securityScore: number // 0-100
}

export interface ProfileTab {
  id: string
  label: string
  icon: string
  description?: string
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
}

export interface ProfileError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface PasswordStrength {
  score: number
  maxScore: number
  isStrong: boolean
  feedback: string[]
}

export interface Session {
  id: string
  device: string
  browser: string
  location: string
  lastActive: Date
  isCurrent: boolean
}

export type ProfileSection = 'personal' | 'security' | 'preferences' | 'notifications'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ProfileState {
  profile: UserProfile | null
  stats: ProfileStats | null
  security: SecurityStatus | null
  preferences: TodoPreferences
  loading: LoadingState
  error: ProfileError | null
  activeTab: ProfileSection
  formErrors: FormErrors
  isSubmitting: boolean
  showSuccess: boolean
}
