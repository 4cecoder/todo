'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/use-toast'
import {
  UserProfile,
  ProfileFormData,
  PasswordFormData,
  TodoPreferences,
  ProfileState,
  ProfileSection,
  FormErrors,
  ProfileError,
} from '../types/profile'
import { validateForm, validatePasswordForm, sanitizeInput } from '../utils/validation'
import { DEFAULT_TODO_PREFERENCES, PROFILE_STORAGE_KEYS } from '../utils/constants'
import { calculateProfileStats, getSecurityStatus } from '../utils/formatting'

// Action types
type ProfileAction =
  | { type: 'SET_LOADING'; payload: 'loading' | 'success' | 'error' }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_STATS'; payload: any }
  | { type: 'SET_SECURITY'; payload: any }
  | { type: 'SET_PREFERENCES'; payload: TodoPreferences }
  | { type: 'SET_ACTIVE_TAB'; payload: ProfileSection }
  | { type: 'SET_FORM_ERRORS'; payload: FormErrors }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ProfileError | null }
  | {
      type: 'UPDATE_FORM_FIELD'
      payload: { field: keyof ProfileFormData; value: string | undefined }
    }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_FORM' }

// Initial state
const initialState: ProfileState = {
  profile: null,
  stats: null,
  security: null,
  preferences: DEFAULT_TODO_PREFERENCES,
  loading: 'idle',
  error: null,
  activeTab: 'personal',
  formErrors: {},
  isSubmitting: false,
  showSuccess: false,
}

// Reducer
const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_SECURITY':
      return { ...state, security: action.payload }
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_FORM_ERRORS':
      return { ...state, formErrors: action.payload }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload }
    case 'SET_SUCCESS':
      return { ...state, showSuccess: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: 'error' }
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        formErrors: {
          ...state.formErrors,
          [action.payload.field]: undefined,
        },
      }
    case 'CLEAR_ERRORS':
      return { ...state, formErrors: {}, error: null }
    case 'RESET_FORM':
      return { ...state, formErrors: {}, showSuccess: false, error: null }
    default:
      return state
  }
}

// Context
interface ProfileContextType {
  state: ProfileState
  dispatch: React.Dispatch<ProfileAction>
  updateProfile: (data: ProfileFormData) => Promise<void>
  updatePassword: (data: PasswordFormData) => Promise<void>
  updatePreferences: (preferences: TodoPreferences) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  refreshData: () => Promise<void>
  setActiveTab: (tab: ProfileSection) => void
  updateFormField: (field: keyof ProfileFormData, value: string | undefined) => void
  clearErrors: () => void
  resetForm: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// Provider component
interface ProfileProviderProps {
  children: React.ReactNode
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser()
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(profileReducer, initialState)

  // Load profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      if (!user) throw new Error('User not found')

      return {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        avatarUrl: user.imageUrl,
        phone: (user.unsafeMetadata?.phone as string) || '',
        birthday: (user.unsafeMetadata?.birthday as string) || '',
        gender: user.unsafeMetadata?.gender as UserProfile['gender'],
        timezone: (user.unsafeMetadata?.timezone as string) || 'UTC',
        language: (user.unsafeMetadata?.language as string) || 'en',
        emailVerified: user.primaryEmailAddress?.verification?.status === 'verified',
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
        metadata: user.unsafeMetadata || {},
      }
    },
    enabled: !!user && isLoaded,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEYS.preferences)
        if (stored) {
          const preferences = JSON.parse(stored)
          dispatch({ type: 'SET_PREFERENCES', payload: preferences })
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }
  }, [])

  // Update state when profile data loads
  useEffect(() => {
    if (profileData) {
      dispatch({ type: 'SET_PROFILE', payload: profileData })
      dispatch({ type: 'SET_STATS', payload: calculateProfileStats(profileData) })
      dispatch({ type: 'SET_SECURITY', payload: getSecurityStatus(profileData) })
    }
  }, [profileData])

  // Update loading state
  useEffect(() => {
    if (profileLoading) {
      dispatch({ type: 'SET_LOADING', payload: 'loading' })
    } else if (profileData) {
      dispatch({ type: 'SET_LOADING', payload: 'success' })
    }
  }, [profileLoading, profileData])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData): Promise<UserProfile> => {
      if (!user) throw new Error('User not found')

      // Sanitize input
      const sanitizedData = {
        firstName: sanitizeInput(data.firstName),
        lastName: sanitizeInput(data.lastName),
        primaryEmailAddressId: user.primaryEmailAddressId,
      }

      // Update basic profile info
      await user.update({
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
      })

      // Update metadata for additional fields
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phone: data.phone,
          birthday: data.birthday,
          gender: data.gender,
          timezone: data.timezone,
          language: data.language,
        },
      })

      // Return updated profile
      return {
        ...profileData!,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        phone: data.phone || '',
        birthday: data.birthday || '',
        gender: data.gender || 'prefer_not_to_say',
        timezone: data.timezone || 'UTC',
        language: data.language || 'en',
        updatedAt: new Date(),
      }
    },
    onSuccess: (updatedProfile) => {
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile })
      dispatch({ type: 'SET_SUCCESS', payload: true })
      toast({ title: 'Profile updated successfully!', variant: 'default' })
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      // Hide success message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'SET_SUCCESS', payload: false })
      }, 3000)
    },
    onError: (error: any) => {
      const profileError: ProfileError = {
        code: 'PROFILE_UPDATE_FAILED',
        message: error.message || 'Failed to update profile',
      }
      dispatch({ type: 'SET_ERROR', payload: profileError })
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    },
  })

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData): Promise<void> => {
      if (!user) throw new Error('User not found')

      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    },
    onSuccess: () => {
      dispatch({ type: 'SET_SUCCESS', payload: true })
      toast({ title: 'Password updated successfully!', variant: 'default' })

      // Hide success message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'SET_SUCCESS', payload: false })
      }, 3000)
    },
    onError: (error: any) => {
      const profileError: ProfileError = {
        code: 'PASSWORD_UPDATE_FAILED',
        message: error.message || 'Failed to update password',
      }
      dispatch({ type: 'SET_ERROR', payload: profileError })
      toast({ title: 'Failed to update password', variant: 'destructive' })
    },
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: TodoPreferences): Promise<void> => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILE_STORAGE_KEYS.preferences, JSON.stringify(preferences))
      }
    },
    onSuccess: () => {
      dispatch({ type: 'SET_SUCCESS', payload: true })
      toast({ title: 'Preferences saved successfully!', variant: 'default' })

      // Hide success message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'SET_SUCCESS', payload: false })
      }, 3000)
    },
    onError: (error: any) => {
      const profileError: ProfileError = {
        code: 'PREFERENCES_UPDATE_FAILED',
        message: error.message || 'Failed to save preferences',
      }
      dispatch({ type: 'SET_ERROR', payload: profileError })
      toast({ title: 'Failed to save preferences', variant: 'destructive' })
    },
  })

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!user) throw new Error('User not found')

      const result = await user.setProfileImage({ file })
      if (!result) {
        throw new Error('Failed to upload avatar')
      }

      return user.imageUrl
    },
    onSuccess: () => {
      if (state.profile) {
        const updatedProfile = {
          ...state.profile,
          updatedAt: new Date(),
        }
        dispatch({ type: 'SET_PROFILE', payload: updatedProfile })
        dispatch({ type: 'SET_SUCCESS', payload: true })
        toast({ title: 'Profile image updated successfully!', variant: 'default' })

        // Hide success message after 3 seconds
        setTimeout(() => {
          dispatch({ type: 'SET_SUCCESS', payload: false })
        }, 3000)
      }
    },
    onError: (error: any) => {
      const profileError: ProfileError = {
        code: 'AVATAR_UPLOAD_FAILED',
        message: error.message || 'Failed to upload avatar',
      }
      dispatch({ type: 'SET_ERROR', payload: profileError })
      toast({ title: 'Failed to upload avatar', variant: 'destructive' })
    },
  })

  // Context value
  const { toast } = useToast()

  const contextValue: ProfileContextType = {
    state,
    dispatch,
    updateProfile: async (data: ProfileFormData) => {
      const errors = validateForm(data)
      if (Object.keys(errors).length > 0) {
        dispatch({ type: 'SET_FORM_ERRORS', payload: errors })
        return
      }

      dispatch({ type: 'SET_SUBMITTING', payload: true })
      dispatch({ type: 'CLEAR_ERRORS' })

      try {
        await updateProfileMutation.mutateAsync(data)
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false })
      }
    },
    updatePassword: async (data: PasswordFormData) => {
      const errors = validatePasswordForm(data)
      if (Object.keys(errors).length > 0) {
        dispatch({ type: 'SET_FORM_ERRORS', payload: errors })
        return
      }

      dispatch({ type: 'SET_SUBMITTING', payload: true })
      dispatch({ type: 'CLEAR_ERRORS' })

      try {
        await updatePasswordMutation.mutateAsync(data)
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false })
      }
    },
    updatePreferences: async (preferences: TodoPreferences) => {
      dispatch({ type: 'SET_SUBMITTING', payload: true })

      try {
        await updatePreferencesMutation.mutateAsync(preferences)
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false })
      }
    },
    uploadAvatar: async (file: File) => {
      dispatch({ type: 'SET_SUBMITTING', payload: true })

      try {
        const result = await uploadAvatarMutation.mutateAsync(file)
        return result
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false })
      }
    },
    refreshData: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    setActiveTab: (tab: ProfileSection) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
    },
    updateFormField: (field: keyof ProfileFormData, value: string | undefined) => {
      dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field, value } })
    },
    clearErrors: () => {
      dispatch({ type: 'CLEAR_ERRORS' })
    },
    resetForm: () => {
      dispatch({ type: 'RESET_FORM' })
    },
  }

  return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}

// Hook to use the context
export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
