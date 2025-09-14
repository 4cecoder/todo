// Profile-related constants

export const PROFILE_TABS = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: 'User',
    description: 'Manage your personal information and contact details',
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'Shield',
    description: 'Manage your password, two-factor authentication, and account security',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: 'Settings',
    description: 'Customize your todo app experience and preferences',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    description: 'Manage your notification preferences and alert settings',
  },
] as const

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Europe/Berlin', label: 'Central European Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Asia/Shanghai', label: 'China Standard Time' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
] as const

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export const VIEW_OPTIONS = [
  { value: 'list', label: 'List View' },
  { value: 'grid', label: 'Grid View' },
  { value: 'kanban', label: 'Kanban View' },
] as const

export const SORT_OPTIONS = [
  { value: 'date', label: 'Date Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'category', label: 'Category' },
  { value: 'custom', label: 'Custom Order' },
] as const

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
] as const

export const DEFAULT_TODO_PREFERENCES = {
  display: {
    defaultView: 'list' as const,
    sortBy: 'date' as const,
    itemsPerPage: 10,
    showCompleted: false,
    compactMode: false,
  },
  notifications: {
    emailReminders: true,
    pushNotifications: true,
    dailyDigest: false,
    weeklySummary: true,
    dueDateAlerts: true,
    overdueAlerts: true,
  },
  behavior: {
    defaultCategory: null,
    autoArchiveCompleted: true,
    dueDateDefault: 7,
    timeEstimates: false,
    priorityDefault: 'medium' as const,
  },
} as const

export const PROFILE_SECTION_ICONS = {
  personal: 'User',
  security: 'Shield',
  preferences: 'Settings',
  notifications: 'Bell',
} as const

export const SECURITY_SCORE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
} as const

export const PASSWORD_STRENGTH_THRESHOLDS = {
  strong: 4,
  medium: 3,
  weak: 2,
} as const

export const IMAGE_UPLOAD_LIMITS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 4000,
  maxHeight: 4000,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const

export const FORM_VALIDATION_DEBOUNCE = 500 // milliseconds

export const PROFILE_STORAGE_KEYS = {
  preferences: 'todo-preferences',
  lastActiveTab: 'profile-last-tab',
  profileStats: 'profile-stats',
} as const

export const ERROR_MESSAGES = {
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  PASSWORD_UPDATE_FAILED:
    'Failed to update password. Please check your current password and try again.',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_UPDATED: 'Password updated successfully!',
  IMAGE_UPLOADED: 'Profile image updated successfully!',
  PREFERENCES_SAVED: 'Preferences saved successfully!',
} as const

export const LOADING_MESSAGES = {
  UPDATING_PROFILE: 'Updating profile...',
  UPDATING_PASSWORD: 'Updating password...',
  UPLOADING_IMAGE: 'Uploading image...',
  SAVING_PREFERENCES: 'Saving preferences...',
} as const
