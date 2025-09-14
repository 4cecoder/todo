'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useProfile } from './contexts/ProfileContext'
import { PasswordFormData } from './types/profile'
import { cn } from '@/lib/utils'

interface SecuritySectionProps {
  className?: string
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ className }) => {
  const { state, updatePassword } = useProfile()
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updatePassword(passwordForm)
    // Reset form on success
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const getFieldError = (field: keyof PasswordFormData) => {
    return state.formErrors[field as string]
  }

  const isFieldInvalid = (field: keyof PasswordFormData) => {
    return !!getFieldError(field)
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return 0
    let strength = 0

    // Length check
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25

    // Character variety
    if (/[a-z]/.test(password)) strength += 10
    if (/[A-Z]/.test(password)) strength += 10
    if (/[0-9]/.test(password)) strength += 10
    if (/[^A-Za-z0-9]/.test(password)) strength += 20

    return Math.min(100, strength)
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-500'
    if (strength >= 60) return 'bg-yellow-500'
    if (strength >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength >= 80) return 'Strong'
    if (strength >= 60) return 'Good'
    if (strength >= 40) return 'Fair'
    return 'Weak'
  }

  if (!state.profile) {
    return <div className="animate-pulse">Loading security settings...</div>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className={cn(
                    'pr-10',
                    isFieldInvalid('currentPassword') && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={state.isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {getFieldError('currentPassword') && (
                <p className="text-sm text-red-500">{getFieldError('currentPassword')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className={cn(
                    'pr-10',
                    isFieldInvalid('newPassword') && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={state.isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password Strength</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        getPasswordStrength(passwordForm.newPassword) >= 80
                          ? 'text-green-600'
                          : getPasswordStrength(passwordForm.newPassword) >= 60
                            ? 'text-yellow-600'
                            : getPasswordStrength(passwordForm.newPassword) >= 40
                              ? 'text-orange-600'
                              : 'text-red-600'
                      )}
                    >
                      {getStrengthText(getPasswordStrength(passwordForm.newPassword))}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        getStrengthColor(getPasswordStrength(passwordForm.newPassword))
                      )}
                      style={{ width: `${getPasswordStrength(passwordForm.newPassword)}%` }}
                    />
                  </div>
                </div>
              )}

              {getFieldError('newPassword') && (
                <p className="text-sm text-red-500">{getFieldError('newPassword')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className={cn(
                    'pr-10',
                    isFieldInvalid('confirmPassword') && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={state.isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-sm text-red-500">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              {state.showSuccess && (
                <Badge variant="default" className="bg-green-500">
                  Password updated successfully!
                </Badge>
              )}
              <Button
                type="submit"
                disabled={
                  state.isSubmitting ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
              >
                {state.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Two-Factor Status</span>
                {state.profile.twoFactorEnabled ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={state.profile.twoFactorEnabled ? 'outline' : 'default'}>
                  {state.profile.twoFactorEnabled ? 'Manage' : 'Enable'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {state.profile.twoFactorEnabled
                      ? 'Manage 2FA'
                      : 'Enable Two-Factor Authentication'}
                  </DialogTitle>
                  <DialogDescription>
                    {state.profile.twoFactorEnabled
                      ? 'Manage your two-factor authentication settings'
                      : 'Protect your account with an additional layer of security'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication setup will be handled through Clerk's secure
                    authentication system. This will redirect you to Clerk's 2FA management page.
                  </p>
                  <Button className="w-full">Continue to Clerk 2FA Setup</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Account Security Overview */}
      {state.security && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Email Verification</span>
                </div>
                <Badge variant={state.profile.emailVerified ? 'default' : 'secondary'}>
                  {state.profile.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Last Password Change</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {state.security.lastPasswordChange
                    ? new Date(state.security.lastPasswordChange).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Security Score</span>
                </div>
                <Badge
                  variant={
                    state.security.securityScore >= 80
                      ? 'default'
                      : state.security.securityScore >= 60
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {state.security.securityScore}/100
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Active Sessions</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {state.security.activeSessions} session
                  {state.security.activeSessions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
