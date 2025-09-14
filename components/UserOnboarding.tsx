'use client'

import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export function UserOnboarding() {
  const { user } = useUser()
  const createUser = useMutation(api.users.createUser)
  const [currentStep, setCurrentStep] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Todo App!',
      description: "Let's get you set up with your personal task management system.",
      completed: false,
    },
    {
      id: 'create-todo',
      title: 'Create Your First Todo',
      description: 'Add a task to get started with organizing your work.',
      completed: false,
    },
    {
      id: 'categories',
      title: 'Organize with Categories',
      description: 'Create categories to group your todos by project or priority.',
      completed: false,
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description:
        'Start managing your tasks efficiently. You can always access your profile to update settings.',
      completed: false,
    },
  ]

  const setupUser = useCallback(async () => {
    if (!user) return

    try {
      // Create user in Convex database if not exists
      await createUser()
    } catch (error) {
      console.error('Error creating user in Convex:', error)
    }

    // Check if user is new (created recently)
    if (user?.createdAt) {
      const userAge = Date.now() - user.createdAt.getTime()
      const isNewUser = userAge < 24 * 60 * 60 * 1000 // Less than 24 hours old

      // Check if onboarding was completed
      const onboardingCompleted = localStorage.getItem('onboarding-completed')

      if (isNewUser && !onboardingCompleted) {
        setShowOnboarding(true)
      }
    }
  }, [user, createUser])

  useEffect(() => {
    setupUser()
  }, [setupUser])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      localStorage.setItem('onboarding-completed', 'true')
      setShowOnboarding(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  if (!showOnboarding) {
    return null
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">{currentStepData.description}</p>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Head to your todos page to create your first task.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Categories help you organize your todos by project, priority, or type.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm text-muted-foreground">
                You&apos;re ready to start managing your tasks!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
