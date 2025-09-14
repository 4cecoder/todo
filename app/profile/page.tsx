import { AuthGuard } from '@/components/AuthGuard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProfileProvider, useProfile } from '@/components/profile/contexts/ProfileContext'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileNavigation } from '@/components/profile/ProfileNavigation'
import { PersonalInfoSection } from '@/components/profile/PersonalInfoSection'
import { SecuritySection } from '@/components/profile/SecuritySection'
import { TodoPreferencesSection } from '@/components/profile/TodoPreferencesSection'

function ProfileContent() {
  const { state } = useProfile()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/todos">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Todos
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <ProfileNavigation />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Header */}
            <ProfileHeader />

            {/* Dynamic Content Based on Active Tab */}
            {state.activeTab === 'personal' && <PersonalInfoSection />}
            {state.activeTab === 'security' && <SecuritySection />}
            {state.activeTab === 'preferences' && <TodoPreferencesSection />}
            {state.activeTab === 'notifications' && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Notification settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileProvider>
        <ProfileContent />
      </ProfileProvider>
    </AuthGuard>
  )
}
