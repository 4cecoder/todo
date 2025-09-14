import { SignUp } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/clerk-appearance'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        appearance={clerkAppearance}
      />
    </div>
  )
}