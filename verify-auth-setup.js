#!/usr/bin/env node

/**
 * Authentication Setup Verification Script
 * This script verifies that Clerk authentication is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Clerk Authentication Setup...\n');

// Check if .env.example exists
const envExamplePath = path.join(process.cwd(), '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example file created');
} else {
  console.log('❌ .env.example file missing');
}

// Check middleware.ts
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  if (middlewareContent.includes('createRouteMatcher') && middlewareContent.includes('auth.protect')) {
    console.log('✅ Middleware properly configured for route protection');
  } else {
    console.log('❌ Middleware configuration incomplete');
  }
} else {
  console.log('❌ middleware.ts file missing');
}

// Check convex/auth.config.js
const convexAuthPath = path.join(process.cwd(), 'convex/auth.config.js');
if (fs.existsSync(convexAuthPath)) {
  const convexAuthContent = fs.readFileSync(convexAuthPath, 'utf8');
  if (convexAuthContent.includes('process.env.CLERK_DOMAIN')) {
    console.log('✅ Convex auth config updated with environment variable');
  } else {
    console.log('❌ Convex auth config not updated');
  }
} else {
  console.log('❌ convex/auth.config.js file missing');
}

// Check layout.tsx metadata
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('Todo App - Manage Your Tasks') && layoutContent.includes('publishableKey')) {
    console.log('✅ Layout updated with proper metadata and Clerk configuration');
  } else {
    console.log('❌ Layout configuration incomplete');
  }
} else {
  console.log('❌ app/layout.tsx file missing');
}

// Check AuthGuard usage
const todosPagePath = path.join(process.cwd(), 'app/todos/page.tsx');
if (fs.existsSync(todosPagePath)) {
  const todosContent = fs.readFileSync(todosPagePath, 'utf8');
  if (todosContent.includes('AuthGuard')) {
    console.log('✅ Todos page protected with AuthGuard');
  } else {
    console.log('❌ Todos page not protected');
  }
}

const profilePagePath = path.join(process.cwd(), 'app/profile/page.tsx');
if (fs.existsSync(profilePagePath)) {
  const profileContent = fs.readFileSync(profilePagePath, 'utf8');
  if (profileContent.includes('AuthGuard')) {
    console.log('✅ Profile page protected with AuthGuard');
  } else {
    console.log('❌ Profile page not protected');
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Copy .env.example to .env.local');
console.log('2. Add your Clerk keys from https://dashboard.clerk.com/');
console.log('3. Add your Convex URL from https://dashboard.convex.dev/');
console.log('4. Update CLERK_DOMAIN in convex/auth.config.js');
console.log('5. Update metadataBase URL in app/layout.tsx');
console.log('6. Run the app with: npm run dev');
console.log('7. Test authentication flow by visiting /todos');

console.log('\n🔗 Useful Links:');
console.log('- Clerk Dashboard: https://dashboard.clerk.com/');
console.log('- Convex Dashboard: https://dashboard.convex.dev/');
console.log('- Clerk Docs: https://clerk.com/docs');
console.log('- Convex Docs: https://docs.convex.dev/');