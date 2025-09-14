// Profile validation utilities and rules

import {
  ProfileFormData,
  PasswordFormData,
  FormErrors,
  ValidationRule,
  PasswordStrength,
} from '../types/profile'

export const validationRules: Record<keyof ProfileFormData, ValidationRule> = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'First name must contain only letters, spaces, hyphens, and apostrophes',
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Last name must contain only letters, spaces, hyphens, and apostrophes',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    required: false,
    pattern: /^\+?[\d\s\-()]+$/,
    message: 'Please enter a valid phone number',
  },
  birthday: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'Please enter a valid date (YYYY-MM-DD)',
  },
  gender: {
    required: false,
    message: '',
  },
  timezone: {
    required: true,
    message: 'Please select a timezone',
  },
  language: {
    required: true,
    message: 'Please select a language',
  },
}

export const passwordValidationRules: Record<keyof PasswordFormData, ValidationRule> = {
  currentPassword: {
    required: true,
    minLength: 8,
    message: 'Current password is required',
  },
  newPassword: {
    required: true,
    minLength: 8,
    message: 'New password must be at least 8 characters long',
  },
  confirmPassword: {
    required: true,
    message: 'Please confirm your new password',
  },
}

export const validateField = (
  field: keyof ProfileFormData,
  value: string | undefined
): string | null => {
  const rule = validationRules[field]
  if (!rule) return null

  if (rule.required && (!value || !value.trim())) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
  }

  if (value) {
    if (rule.minLength && value.length < rule.minLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters`
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `Invalid ${field} format`
    }
  }

  return null
}

export const validatePassword = (
  field: keyof PasswordFormData,
  value: string,
  formData?: PasswordFormData
): string | null => {
  const rule = passwordValidationRules[field]
  if (!rule) return null

  if (rule.required && !value.trim()) {
    return `${
      field.charAt(0).toUpperCase() +
      field
        .slice(1)
        .replace(/([A-Z])/g, ' $1')
        .trim()
    } is required`
  }

  if (rule.minLength && value.length < rule.minLength) {
    return `${
      field.charAt(0).toUpperCase() +
      field
        .slice(1)
        .replace(/([A-Z])/g, ' $1')
        .trim()
    } must be at least ${rule.minLength} characters`
  }

  // Special validation for password confirmation
  if (field === 'confirmPassword' && formData && value !== formData.newPassword) {
    return 'Passwords do not match'
  }

  return null
}

export const validateForm = (data: ProfileFormData): FormErrors => {
  const errors: FormErrors = {}

  Object.keys(data).forEach((field) => {
    const error = validateField(
      field as keyof ProfileFormData,
      data[field as keyof ProfileFormData]
    )
    if (error) {
      errors[field as keyof ProfileFormData] = error
    }
  })

  return errors
}

export const validatePasswordForm = (data: PasswordFormData): FormErrors => {
  const errors: FormErrors = {}

  Object.keys(data).forEach((field) => {
    const error = validatePassword(
      field as keyof PasswordFormData,
      data[field as keyof PasswordFormData],
      data
    )
    if (error) {
      errors[field as keyof PasswordFormData] = error
    }
  })

  return errors
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) score++
  else feedback.push('Password must be at least 8 characters')

  if (password.length >= 12) score++
  else feedback.push('Use 12 or more characters for a stronger password')

  // Character variety checks
  if (/[a-z]/.test(password)) score++
  else feedback.push('Include lowercase letters')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Include uppercase letters')

  if (/\d/.test(password)) score++
  else feedback.push('Include numbers')

  if (/[^a-zA-Z\d]/.test(password)) score++
  else feedback.push('Include special characters')

  // Pattern checks
  if (/(.)\1{2,}/.test(password)) {
    score--
    feedback.push('Avoid repeating characters')
  }

  if (
    /123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(
      password
    )
  ) {
    score--
    feedback.push('Avoid common sequences')
  }

  if (/password|123456|qwerty|admin|welcome|letmein/i.test(password)) {
    score--
    feedback.push('Avoid common passwords')
  }

  return {
    score: Math.max(0, score),
    maxScore: 5,
    isStrong: score >= 4,
    feedback,
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s\-()]+$/.test(phone)
}

export const isValidDate = (date: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false

  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime()) && dateObj.toISOString().split('T')[0] === date
}
