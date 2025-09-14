# Suggested Commands for Todo App Development

## Development Workflow
```bash
# Start development server (with Turbopack for faster builds)
npm run dev

# Run tests in watch mode during development
npm run test:watch

# Run linting to check code style
npm run lint

# Build for production
npm run build
```

## Testing Commands
```bash
# Run all tests once
npm run test

# Run tests with coverage report
npm run test:coverage

# Run Vitest UI for interactive testing
npm run test:ui

# Run specific test file
npm run test -- app/todos/page.test.tsx
```

## Code Quality Commands
```bash
# Lint all files
npm run lint

# Lint and fix auto-fixable issues
npm run lint -- --fix

# Type check (built into Next.js build)
npm run build
```

## Convex Development
```bash
# Deploy Convex functions (when connected to Convex cloud)
npx convex deploy

# Run Convex locally for development
npx convex dev
```

## Setup and Verification
```bash
# Verify authentication setup
node verify-auth-setup.js

# Install dependencies
npm install

# Clean install (if needed)
rm -rf node_modules package-lock.json && npm install
```

## Git Workflow
```bash
# Check git status
git status

# Add changes
git add .

# Commit with conventional message
git commit -m "feat: add optimistic updates to todo operations"

# Push changes
git push origin main
```

## Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
# Add Clerk keys and Convex URL to .env.local
```

## Performance and Debugging
```bash
# Build with bundle analyzer
npm run build -- --analyze

# Start production server locally
npm run start

# Debug with React DevTools
# Open browser dev tools and use React tab
```

## Deployment Commands
```bash
# Deploy to Vercel
npx vercel

# Deploy to Vercel production
npx vercel --prod

# Check Vercel deployment status
npx vercel ls
```