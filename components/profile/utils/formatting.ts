// Profile formatting utilities and helpers

import { UserProfile, ProfileStats, SecurityStatus } from '../types/profile'

export const formatProfileName = (user: UserProfile): string => {
  if (!user.firstName && !user.lastName) return 'User'
  return `${user.firstName || ''} ${user.lastName || ''}`.trim()
}

export const formatMemberSince = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const formatLastActive = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

  return formatMemberSince(date)
}

export const formatCompletionRate = (completed: number, total: number): string => {
  if (total === 0) return '0%'
  const rate = Math.round((completed / total) * 100)
  return `${rate}%`
}

export const formatStreak = (days: number): string => {
  if (days === 0) return 'No streak'
  if (days === 1) return '1 day'
  return `${days} days`
}

export const formatSecurityScore = (score: number): string => {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Poor'
}

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = Math.round((bytes / Math.pow(1024, i)) * 100) / 100

  return `${size} ${sizes[i]}`
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Basic formatting for US numbers
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    return `+1 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`
  }

  // Return original if can't format
  return phone
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return formatLastActive(date)
  } catch {
    return dateString
  }
}

export const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0).toUpperCase() || ''
  const lastInitial = lastName?.charAt(0).toUpperCase() || ''
  return `${firstInitial}${lastInitial}`.trim() || 'U'
}

export const calculateProfileStats = (user: UserProfile, todoData?: any): ProfileStats => {
  // Mock stats - in real app, this would come from your todo data
  const stats: ProfileStats = {
    totalTodos: todoData?.total || 0,
    completedTodos: todoData?.completed || 0,
    completionRate: todoData?.total ? Math.round((todoData.completed / todoData.total) * 100) : 0,
    currentStreak: todoData?.currentStreak || 0,
    longestStreak: todoData?.longestStreak || 0,
    memberSince: user.createdAt,
    lastActive: user.updatedAt,
  }

  return stats
}

export const getSecurityStatus = (user: UserProfile): SecurityStatus => {
  const securityScore = calculateSecurityScore(user)

  return {
    twoFactorEnabled: user.twoFactorEnabled,
    emailVerified: user.emailVerified,
    activeSessions: 1, // Mock - would come from Clerk API
    lastPasswordChange: null, // Mock - would come from Clerk API
    securityScore,
  }
}

const calculateSecurityScore = (user: UserProfile): number => {
  let score = 0

  // Email verification
  if (user.emailVerified) score += 30

  // Two-factor authentication
  if (user.twoFactorEnabled) score += 40

  // Phone number (additional security)
  if (user.phone) score += 15

  // Birthday (additional verification)
  if (user.birthday) score += 15

  return Math.min(100, score)
}

export const validateProfileImage = (file: File): Promise<string | null> => {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return Promise.resolve('Image size must be less than 5MB')
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return Promise.resolve('Only JPEG, PNG, GIF, and WebP images are allowed')
  }

  // Check image dimensions (max 4000x4000)
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      if (img.width > 4000 || img.height > 4000) {
        resolve('Image dimensions must be 4000x4000 pixels or less')
      } else {
        resolve(null)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('Invalid image file')
    }

    img.src = url
  })
}
