# Next.js App Router Setup Guide

## Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- Basic knowledge of React and TypeScript

## Installation

### Create a New Next.js Project

```bash
npx create-next-app@latest bytecats-todo --typescript --tailwind --eslint --app
cd bytecats-todo
```

This creates a new Next.js project with:
- TypeScript configuration
- Tailwind CSS for styling
- ESLint for code linting
- App Router structure

### Project Structure

```
bytecats-todo/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── utils.ts
├── public/
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## Configuration

### Next.js Configuration

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@clerk/clerk-sdk"],
  },
  images: {
    domains: ['images.clerk.dev'],
  },
};

export default nextConfig;
```

### TypeScript Configuration

The `tsconfig.json` is pre-configured for Next.js App Router. Ensure it includes:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## App Router Structure

### Root Layout (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ByteCats Todo App',
  description: 'A modern todo application built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### Home Page (`app/page.tsx`)

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to ByteCats Todo</h1>
      </div>
    </main>
  )
}
```

## Key App Router Concepts

### Server Components vs Client Components

- **Server Components**: Default, run on server, no interactivity
- **Client Components**: Use `'use client'` directive for interactivity

### File-based Routing

- `app/page.tsx` → `/`
- `app/todos/page.tsx` → `/todos`
- `app/todos/[id]/page.tsx` → `/todos/123`

### Layouts

- `app/layout.tsx`: Root layout
- `app/todos/layout.tsx`: Nested layout for todos routes

### Loading and Error States

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}

// app/error.tsx
export default function Error() {
  return <div>Something went wrong!</div>
}
```

## Development Workflow

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm start
```

### Linting and Type Checking

```bash
npm run lint
npm run type-check  # if configured
```

## Best Practices

### Component Organization
- Use Server Components by default
- Extract Client Components for interactivity
- Keep components small and focused

### Data Fetching
- Use Server Components for initial data loading
- Implement proper loading and error states
- Use `cache()` and `revalidatePath()` for caching

### Performance
- Optimize images with Next.js Image component
- Use dynamic imports for code splitting
- Implement proper caching strategies

### TypeScript
- Use strict mode
- Define proper types for props and data
- Leverage Next.js type definitions

## Common Issues & Solutions

### Hydration Errors
- Ensure Server and Client Components render the same content
- Use `useEffect` for client-side only logic

### Routing Issues
- Use `useRouter` hook in Client Components
- Use `redirect()` in Server Components/Actions

### Styling Issues
- Ensure Tailwind classes are properly configured
- Use CSS modules for component-scoped styles

## Next Steps

1. Set up authentication with Clerk.js
2. Configure ConvexDB for data management
3. Implement todo CRUD operations
4. Deploy to Vercel

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Next.js GitHub](https://github.com/vercel/next.js)