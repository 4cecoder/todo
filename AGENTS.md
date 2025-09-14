# Agent Guidelines for Todo App

## Commands
- **Build**: `npm run build` (uses Turbopack)
- **Dev**: `npm run dev` (uses Turbopack)
- **Lint**: `npm run lint` (ESLint with Next.js rules)
- **Start**: `npm start`
- **Test**: No test framework configured yet

## Code Style
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Imports**: Use path aliases `@/*` for root imports
- **Types**: Strict TypeScript with full type annotations
- **Components**: Functional components with explicit return types
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Utilities**: Use `cn()` from `@/lib/utils` for conditional classes
- **Error Handling**: Use try/catch blocks, throw descriptive errors
- **Formatting**: Follow ESLint rules, no semicolons at line ends

## Project Structure
- `app/`: Next.js app router pages and layouts
- `lib/`: Utility functions and shared code
- `components/`: Reusable UI components (when added)
- `docs/`: Project documentation and guides

## Dependencies
- React 19, Next.js 15, TypeScript 5
- Tailwind CSS 4, shadcn/ui, Lucide icons
- ESLint 9 with Next.js configuration