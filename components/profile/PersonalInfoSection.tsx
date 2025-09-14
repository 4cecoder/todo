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
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, User, Mail, Phone, Calendar, Globe, Languages } from 'lucide-react'
import { useProfile } from './contexts/ProfileContext'
import { ProfileFormData } from './types/profile'
import { TIMEZONES, LANGUAGES, GENDER_OPTIONS } from './utils/constants'
import { cn } from '@/lib/utils'

interface PersonalInfoSectionProps {
  className?: string
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ className }) => {
  const { state, updateProfile, updateFormField, resetForm } = useProfile()
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    gender: 'prefer_not_to_say',
    timezone: 'UTC',
    language: 'en',
  })

  // Initialize form with profile data
  useEffect(() => {
    if (state.profile) {
      setFormData({
        firstName: state.profile.firstName,
        lastName: state.profile.lastName,
        email: state.profile.email,
        phone: state.profile.phone || '',
        birthday: state.profile.birthday || '',
        gender: state.profile.gender || 'prefer_not_to_say',
        timezone: state.profile.timezone || 'UTC',
        language: state.profile.language || 'en',
      })
    }
  }, [state.profile])

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    updateFormField(field, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(formData)
  }

  const getFieldError = (field: keyof ProfileFormData) => {
    return state.formErrors[field as string]
  }

  const isFieldInvalid = (field: keyof ProfileFormData) => {
    return !!getFieldError(field)
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>First Name</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={cn(isFieldInvalid('firstName') && 'border-red-500 focus:border-red-500')}
                disabled={state.isSubmitting}
              />
              {getFieldError('firstName') && (
                <p className="text-sm text-red-500">{getFieldError('firstName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Last Name</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={cn(isFieldInvalid('lastName') && 'border-red-500 focus:border-red-500')}
                disabled={state.isSubmitting}
              />
              {getFieldError('lastName') && (
                <p className="text-sm text-red-500">{getFieldError('lastName')}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(isFieldInvalid('email') && 'border-red-500 focus:border-red-500')}
              disabled={state.isSubmitting}
              readOnly // Email changes should be handled through Clerk's email management
            />
            <div className="flex items-center space-x-2">
              <Badge variant={state.profile?.emailVerified ? 'default' : 'secondary'}>
                {state.profile?.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Email changes must be made through account security settings
              </p>
            </div>
            {getFieldError('email') && (
              <p className="text-sm text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Phone Number</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={cn(isFieldInvalid('phone') && 'border-red-500 focus:border-red-500')}
              disabled={state.isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Optional: For account recovery and notifications
            </p>
            {getFieldError('phone') && (
              <p className="text-sm text-red-500">{getFieldError('phone')}</p>
            )}
          </div>

          {/* Birthday */}
          <div className="space-y-2">
            <Label htmlFor="birthday" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Birthday</span>
            </Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              className={cn(isFieldInvalid('birthday') && 'border-red-500 focus:border-red-500')}
              disabled={state.isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Optional: Helps us personalize your experience
            </p>
            {getFieldError('birthday') && (
              <p className="text-sm text-red-500">{getFieldError('birthday')}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Gender</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
              disabled={state.isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Optional: For personalization purposes</p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Timezone</span>
            </Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
              disabled={state.isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <span>Language</span>
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
              disabled={state.isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={state.isSubmitting}
            >
              Reset
            </Button>
            <div className="flex items-center space-x-2">
              {state.showSuccess && (
                <Badge variant="default" className="bg-green-500">
                  Saved successfully!
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
