'use client'

import { UserButton as ClerkUserButton } from '@clerk/nextjs'

export function CustomUserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: 'w-10 h-10 ring-2 ring-border hover:ring-ring transition-colors',
          userButtonPopoverCard: 'shadow-lg border bg-popover text-popover-foreground',
          userButtonPopoverActionButton: 'hover:bg-accent hover:text-accent-foreground',
          userButtonPopoverActionButtonText: 'text-sm',
          userButtonPopoverFooter: 'border-t bg-muted/50',
        }
      }}
      userProfileMode="navigation"
      userProfileUrl="/profile"
      showName={false}
      afterSignOutUrl="/"
    />
  )
}