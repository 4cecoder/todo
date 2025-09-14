'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Camera, Edit, Shield, Calendar, Target } from 'lucide-react'
import { useProfile } from './contexts/ProfileContext'
import { formatProfileName, formatMemberSince, getInitials } from './utils/formatting'
import { cn } from '@/lib/utils'

interface ProfileHeaderProps {
  className?: string
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ className }) => {
  const { state, uploadAvatar } = useProfile()

  if (!state.profile) {
    return <div className="animate-pulse">Loading profile...</div>
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await uploadAvatar(file)
      } catch (error) {
        console.error('Failed to upload avatar:', error)
      }
    }
  }

  const securityScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Overview</span>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {state.profile.avatarUrl ? (
                <img
                  src={state.profile.avatarUrl}
                  alt={formatProfileName(state.profile)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-lg font-semibold text-muted-foreground">
                  {getInitials(state.profile.firstName, state.profile.lastName)}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={state.isSubmitting}
              />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{formatProfileName(state.profile)}</h2>
            <p className="text-muted-foreground">{state.profile.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={state.profile.emailVerified ? 'default' : 'secondary'}>
                {state.profile.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
              {state.profile.twoFactorEnabled && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Shield className="w-3 h-3 mr-1" />
                  2FA Enabled
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {state.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{state.stats.totalTodos}</div>
              <div className="text-sm text-muted-foreground">Total Todos</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{state.stats.completedTodos}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{state.stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{state.stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
          </div>
        )}

        {/* Security Status */}
        {state.security && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Security Score</div>
                <div className="text-sm text-muted-foreground">
                  {state.security.securityScore}/100
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  securityScoreColor(state.security.securityScore)
                )}
              />
              <span className="text-sm font-medium">
                {state.security.securityScore >= 90
                  ? 'Excellent'
                  : state.security.securityScore >= 70
                    ? 'Good'
                    : state.security.securityScore >= 50
                      ? 'Fair'
                      : 'Poor'}
              </span>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Member since:</span>
            <span>{formatMemberSince(state.profile.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Timezone:</span>
            <span>{state.profile.timezone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
