'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Shield, Settings, Bell, Menu } from 'lucide-react'
import { useProfile } from './contexts/ProfileContext'
import { ProfileSection } from './types/profile'
import { cn } from '@/lib/utils'

interface ProfileNavigationProps {
  className?: string
}

const TABS = [
  {
    id: 'personal' as ProfileSection,
    label: 'Personal Info',
    icon: User,
    description: 'Manage your personal information and contact details',
  },
  {
    id: 'security' as ProfileSection,
    label: 'Security',
    icon: Shield,
    description: 'Password, two-factor authentication, and account security',
  },
  {
    id: 'preferences' as ProfileSection,
    label: 'Preferences',
    icon: Settings,
    description: 'Customize your todo app experience',
  },
  {
    id: 'notifications' as ProfileSection,
    label: 'Notifications',
    icon: Bell,
    description: 'Manage your notification preferences',
  },
]

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ className }) => {
  const { state, setActiveTab } = useProfile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleTabChange = (tabId: ProfileSection) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  const getTabIcon = (tabId: ProfileSection) => {
    const tab = TABS.find((t) => t.id === tabId)
    return tab ? tab.icon : User
  }

  return (
    <>
      {/* Desktop Navigation */}
      <Card className={cn('hidden lg:block', className)}>
        <CardContent className="p-0">
          <div className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = state.activeTab === tab.id

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-auto p-4',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Icon
                      className={cn(
                        'w-5 h-5 mt-0.5',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}
                    />
                    <div className="text-left">
                      <div className={cn('font-medium', isActive ? 'text-primary-foreground' : '')}>
                        {tab.label}
                      </div>
                      <div
                        className={cn(
                          'text-xs mt-1',
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}
                      >
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation */}
      <div className={cn('lg:hidden', className)}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {(() => {
              const Icon = getTabIcon(state.activeTab)
              return <Icon className="w-5 h-5 text-muted-foreground" />
            })()}
            <span className="font-medium">{TABS.find((t) => t.id === state.activeTab)?.label}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <Card>
            <CardContent className="p-2">
              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = state.activeTab === tab.id

                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'w-full justify-start h-auto p-3',
                        isActive && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )}
                        />
                        <div className="text-left">
                          <div
                            className={cn(
                              'font-medium text-sm',
                              isActive ? 'text-primary-foreground' : ''
                            )}
                          >
                            {tab.label}
                          </div>
                        </div>
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto">
                            Active
                          </Badge>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Tab Description */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              {(() => {
                const Icon = getTabIcon(state.activeTab)
                return <Icon className="w-5 h-5 text-muted-foreground" />
              })()}
              <span className="font-medium">
                {TABS.find((t) => t.id === state.activeTab)?.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {TABS.find((t) => t.id === state.activeTab)?.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
