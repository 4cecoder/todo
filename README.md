# Todo App

A modern, full-stack todo application built with Next.js 15, TypeScript, ConvexDB, and Clerk authentication. Features real-time synchronization, category organization, and a beautiful responsive UI.

![Todo App Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Todo+App+Screenshot)

## ✨ Features

- ✅ **Real-time Synchronization** - Changes sync instantly across all devices
- ✅ **Secure Authentication** - Powered by Clerk.js with social login support
- ✅ **Category Organization** - Organize todos with customizable categories
- ✅ **Progress Tracking** - Visual progress bars and completion statistics
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **TypeScript** - Full type safety throughout the application
- ✅ **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- ✅ **Database** - Real-time database with ConvexDB
- ✅ **API** - RESTful API with comprehensive documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, bun, or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_SECRET_KEY=sk_test_your_secret
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Clerk Authentication**
   - Create account at [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Copy API keys to your `.env.local`

5. **Set up Convex Database**
   ```bash
   npx convex dev --once
   npx convex deploy
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

7. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account or sign in

## 📖 Documentation

### User Guides

- **[User Guide](docs/user-guide.md)** - Complete user manual with screenshots and examples
- **[Setup Guide](docs/setup-guide.md)** - Step-by-step setup instructions for development and production
- **[Deployment Guide](docs/deployment-guide.md)** - Deploy to Vercel, Netlify, AWS, and more

### Developer Documentation

- **[API Documentation](docs/api-docs.md)** - Complete API reference with examples
- **[Best Practices](docs/best-practices.md)** - Development guidelines and patterns
- **[Troubleshooting](docs/other/troubleshooting.md)** - Common issues and solutions

### Project Documentation

- **[Product Requirements](docs/PRD.md)** - Product vision and requirements
- **[Research Notes](docs/research-notes.md)** - Technical research and decisions
- **[Calendar Sync](docs/calendar-sync/)** - Calendar integration documentation

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide Icons** - Beautiful icon library

### Backend
- **ConvexDB** - Real-time database
- **Clerk** - Authentication and user management
- **Next.js API Routes** - Server-side functionality

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Playwright** - End-to-end testing
- **Vitest** - Fast unit testing

## 📁 Project Structure

```
todo-app/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── profile/           # User profile page
│   ├── sign-in/           # Authentication pages
│   ├── sign-up/
│   └── todos/             # Main todos page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── AuthGuard.tsx     # Authentication guard
├── convex/               # ConvexDB backend
│   ├── todos.ts          # Todo operations
│   ├── categories.ts     # Category operations
│   ├── schema.ts         # Database schema
│   └── auth.config.js    # Authentication config
├── docs/                 # Documentation
├── lib/                  # Utility functions
├── public/               # Static assets
└── tests/                # Test files
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm test            # Run unit tests
npm run test:ui     # Run tests with UI
npm run test:coverage # Generate coverage report

# Database
npx convex dev       # Start Convex development
npx convex deploy    # Deploy Convex functions
npx convex dashboard # Open Convex dashboard

# Verification
node verify-auth-setup.js # Verify authentication setup
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main

### Other Platforms

- **[Netlify](docs/deployment-guide.md#netlify-deployment)**
- **[Railway](docs/deployment-guide.md#railway-deployment)**
- **[AWS](docs/deployment-guide.md#aws-deployment)**
- **[Docker](docs/deployment-guide.md#docker-deployment)**

## 🔐 Authentication

The app uses Clerk for authentication with the following features:

- **Email/Password** authentication
- **Social login** (Google, GitHub, etc.)
- **User profiles** with avatars
- **Session management**
- **Secure API access**

## 💾 Database Schema

### Users Table
```typescript
{
  _id: Id<"users">
  clerkId: string
  email: string
  name?: string
  createdAt: number
}
```

### Categories Table
```typescript
{
  _id: Id<"categories">
  userId: Id<"users">
  name: string
  color: string
  createdAt: number
}
```

### Todos Table
```typescript
{
  _id: Id<"todos">
  userId: Id<"users">
  categoryId?: Id<"categories">
  title: string
  description?: string
  completed: boolean
  createdAt: number
  updatedAt: number
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npx playwright test
```

### Test Coverage
```bash
npm run test:coverage
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add your feature'`
6. **Push to the branch**: `git push origin feature/your-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write comprehensive tests
- Update documentation as needed
- Use TypeScript for all new code
- Follow conventional commit messages

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 200KB gzipped

## 🔒 Security

- **HTTPS Only**: All communications encrypted
- **Secure Headers**: CSP, HSTS, and other security headers
- **Input Validation**: All inputs validated and sanitized
- **Authentication**: JWT-based secure authentication
- **Authorization**: Row-level security with ConvexDB

## 📈 Analytics & Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Convex Dashboard**: Database monitoring and logs
- **Clerk Dashboard**: Authentication monitoring
- **Error Tracking**: Sentry integration for error monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Clerk configuration
   - Verify environment variables
   - Clear browser cache

2. **Database connection issues**
   - Verify Convex URL
   - Check network connectivity
   - Review Convex dashboard

3. **Build failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

See **[Troubleshooting Guide](docs/other/troubleshooting.md)** for detailed solutions.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ConvexDB Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Convex** for the real-time database
- **Clerk** for authentication
- **shadcn** for the beautiful UI components
- **Tailwind CSS** for the styling system

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Happy todo-ing! 🎉**
