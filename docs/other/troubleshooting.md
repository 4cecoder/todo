# Troubleshooting Guide for ByteCats Todo App

## Common Issues & Solutions

### Next.js App Router Issues

#### Build Errors

**Problem:** `Module not found` errors during build

**Solutions:**
1. Check import paths - ensure correct relative paths
2. Verify package.json dependencies
3. Clear Next.js cache: `rm -rf .next`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

**Problem:** TypeScript compilation errors

**Solutions:**
1. Check tsconfig.json configuration
2. Run `npm run type-check` to see detailed errors
3. Ensure all required types are installed
4. Use `// @ts-ignore` as temporary fix (not recommended for production)

#### Runtime Errors

**Problem:** Hydration mismatch errors

**Solutions:**
1. Ensure Server and Client Components render the same content
2. Avoid using browser-only APIs in Server Components
3. Use `useEffect` for client-side data fetching
4. Check for dynamic imports or conditional rendering

**Problem:** Routing issues

**Solutions:**
1. Verify file structure matches App Router conventions
2. Check dynamic route parameters
3. Ensure proper `page.tsx` and `layout.tsx` placement
4. Use `redirect()` in Server Components, `useRouter` in Client Components

### Vercel Deployment Issues

#### Build Failures

**Problem:** Build fails on Vercel but works locally

**Solutions:**
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify Node.js version compatibility
4. Check for platform-specific dependencies

**Problem:** Environment variables not working

**Solutions:**
1. Ensure variables are set in Vercel dashboard (not .env.local)
2. Use `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding new variables
4. Check variable names match exactly

#### Performance Issues

**Problem:** Slow cold starts

**Solutions:**
1. Use Edge Runtime for API routes: `export const runtime = 'edge'`
2. Optimize bundle size with code splitting
3. Use ISR for static content
4. Monitor with Vercel Analytics

**Problem:** Image optimization not working

**Solutions:**
1. Ensure images are in `public/` directory or external domains
2. Add domains to `next.config.js` images configuration
3. Use proper `width` and `height` attributes
4. Check Vercel Image Optimization limits

### Clerk.js Authentication Issues

#### Sign-in/Sign-up Problems

**Problem:** Users can't sign in

**Solutions:**
1. Verify API keys in environment variables
2. Check Clerk application configuration
3. Ensure correct redirect URLs
4. Clear browser cookies and local storage

**Problem:** Middleware not protecting routes

**Solutions:**
1. Ensure `middleware.ts` is in project root
2. Check matcher patterns in middleware
3. Verify ClerkProvider wraps the app
4. Test with different routes

#### Token Issues

**Problem:** JWT token errors

**Solutions:**
1. Check token expiration
2. Verify `CLERK_SECRET_KEY` is correct
3. Ensure HTTPS in production
4. Check for clock synchronization issues

**Problem:** Webhook signature verification fails

**Solutions:**
1. Verify webhook secret in environment variables
2. Check payload hasn't been modified
3. Ensure correct Svix library usage
4. Test with Clerk's webhook testing tools

### ConvexDB Issues

#### Connection Problems

**Problem:** Unable to connect to Convex

**Solutions:**
1. Verify `NEXT_PUBLIC_CONVEX_URL` is correct
2. Check network connectivity
3. Ensure Convex deployment is active
4. Clear browser cache and cookies

**Problem:** Authentication not working with Convex

**Solutions:**
1. Check `convex/auth.config.js` configuration
2. Verify Clerk domain matches
3. Ensure proper JWT token passing
4. Test with Convex dashboard

#### Query/Mutation Errors

**Problem:** Queries return undefined

**Solutions:**
1. Check function names match exactly
2. Verify authentication in functions
3. Check for syntax errors in Convex functions
4. Use Convex dashboard to debug

**Problem:** Mutations fail silently

**Solutions:**
1. Add proper error handling with try/catch
2. Check Convex function logs
3. Verify input validation
4. Test mutations in Convex dashboard

#### Schema Issues

**Problem:** Schema validation errors

**Solutions:**
1. Run `npx convex codegen` after schema changes
2. Check for type mismatches
3. Verify index definitions
4. Test schema changes in development first

#### Real-time Updates Not Working

**Problem:** UI doesn't update automatically

**Solutions:**
1. Ensure using `useQuery` hook correctly
2. Check for query errors in console
3. Verify Convex client is properly configured
4. Test with Convex dashboard subscriptions

### Development Environment Issues

#### Local Development Problems

**Problem:** Hot reload not working

**Solutions:**
1. Check for syntax errors preventing compilation
2. Clear Next.js cache: `rm -rf .next`
3. Restart development server
4. Check file watching limits on your OS

**Problem:** Port already in use

**Solutions:**
1. Kill process using the port: `lsof -ti:3000 | xargs kill`
2. Change port: `npm run dev -- -p 3001`
3. Use different terminal session

#### Package Management Issues

**Problem:** Dependency conflicts

**Solutions:**
1. Clear lock files and node_modules
2. Use `npm ls` to check dependency tree
3. Update conflicting packages
4. Use `npm install --legacy-peer-deps` if needed

**Problem:** Bun vs npm conflicts

**Solutions:**
1. Use consistent package manager
2. Clear lock files when switching
3. Check package manager specific configurations

### Production Issues

#### Runtime Errors in Production

**Problem:** App crashes in production

**Solutions:**
1. Check Vercel function logs
2. Enable error monitoring (Sentry, etc.)
3. Test with production environment variables
4. Check for environment-specific code

**Problem:** Database connection fails

**Solutions:**
1. Verify production Convex URL
2. Check database permissions
3. Monitor database usage limits
4. Implement connection pooling if needed

#### Performance Degradation

**Problem:** Slow response times

**Solutions:**
1. Enable Vercel Analytics for monitoring
2. Check database query performance
3. Implement caching strategies
4. Optimize images and assets

**Problem:** Memory usage issues

**Solutions:**
1. Monitor Vercel function metrics
2. Implement proper cleanup in functions
3. Use streaming for large responses
4. Optimize bundle size

### Security Issues

#### Authentication Bypass

**Problem:** Users accessing protected routes

**Solutions:**
1. Double-check middleware configuration
2. Verify route protection logic
3. Test with different user roles
4. Implement proper authorization checks

**Problem:** Sensitive data exposure

**Solutions:**
1. Never log sensitive information
2. Use environment variables for secrets
3. Implement proper input validation
4. Regular security audits

### Testing Issues

#### Test Failures

**Problem:** Tests pass locally but fail in CI

**Solutions:**
1. Check environment variables in CI
2. Ensure test database is properly set up
3. Mock external services correctly
4. Check for timing issues in async tests

**Problem:** Component tests not working

**Solutions:**
1. Ensure proper test setup with providers
2. Mock Convex and Clerk hooks
3. Check for missing dependencies
4. Use correct testing library versions

### Database Migration Issues

**Problem:** Migration fails

**Solutions:**
1. Test migrations in development first
2. Backup data before migrations
3. Implement proper rollback logic
4. Check migration logs for errors

**Problem:** Data inconsistency after migration

**Solutions:**
1. Verify migration logic
2. Check for edge cases in data transformation
3. Implement data validation after migration
4. Have rollback plan ready

## Debugging Tools & Techniques

### Browser Developer Tools

1. **Console Logs**
   - Check for JavaScript errors
   - Monitor network requests
   - View Convex query logs

2. **Network Tab**
   - Check API request/response
   - Verify authentication headers
   - Monitor WebSocket connections for real-time updates

3. **Application Tab**
   - Inspect local storage and cookies
   - Check service worker status
   - View cache storage

### Vercel Debugging

1. **Function Logs**
   - View in Vercel dashboard
   - Check for runtime errors
   - Monitor execution times

2. **Build Logs**
   - Detailed build process logs
   - Dependency installation issues
   - Compilation errors

3. **Analytics**
   - Performance metrics
   - Error tracking
   - User behavior insights

### ConvexDB Debugging

1. **Dashboard**
   - View function performance
   - Monitor database usage
   - Debug queries and mutations

2. **Development Tools**
   - Local Convex development server
   - Query browser
   - Schema validation

### Clerk Debugging

1. **Dashboard**
   - User management
   - Session monitoring
   - Webhook delivery status

2. **Development Mode**
   - Detailed logging
   - Request inspection
   - Token validation

## Monitoring & Alerting

### Setting Up Monitoring

1. **Error Tracking**
   ```typescript
   // lib/error-monitoring.ts
   import * as Sentry from '@sentry/nextjs'

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
   })
   ```

2. **Performance Monitoring**
   ```typescript
   // Use Vercel Analytics
   import { Analytics } from '@vercel/analytics/react'

   export default function App({ Component, pageProps }) {
     return (
       <>
         <Component {...pageProps} />
         <Analytics />
       </>
     )
   }
   ```

3. **Database Monitoring**
   - Use Convex dashboard for metrics
   - Set up alerts for usage limits
   - Monitor query performance

### Alert Configuration

1. **Vercel Alerts**
   - Function failures
   - Performance degradation
   - Usage limits

2. **Convex Alerts**
   - Database errors
   - Performance issues
   - Usage thresholds

3. **Custom Alerts**
   - Business logic errors
   - User experience issues
   - Security incidents

## Getting Help

### Community Resources

1. **Documentation**
   - [Next.js Docs](https://nextjs.org/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Convex Docs](https://docs.convex.dev)
   - [Clerk Docs](https://clerk.com/docs)

2. **Community Forums**
   - [Next.js GitHub](https://github.com/vercel/next.js)
   - [Vercel Community](https://vercel.com/community)
   - [Convex Discord](https://convex.dev/community)
   - [Clerk Community](https://clerk.com/community)

3. **Stack Overflow**
   - Search for specific error messages
   - Ask detailed questions with code examples
   - Provide minimal reproducible examples

### Professional Support

1. **Vercel Support**
   - Enterprise support plans
   - Priority ticket handling
   - Direct engineering support

2. **Convex Support**
   - Paid support plans
   - Technical consultations
   - Custom solutions

3. **Clerk Support**
   - Business plan support
   - Security reviews
   - Compliance assistance

## Prevention Best Practices

### Code Quality

1. **TypeScript Strict Mode**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

2. **ESLint Configuration**
   ```javascript
   // .eslintrc.js
   module.exports = {
     extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
     rules: {
       '@typescript-eslint/no-unused-vars': 'error',
       '@typescript-eslint/no-explicit-any': 'warn'
     }
   }
   ```

3. **Pre-commit Hooks**
   ```json
   // package.json
   {
     "husky": {
       "hooks": {
         "pre-commit": "npm run lint && npm run type-check"
       }
     }
   }
   ```

### Testing Strategy

1. **Unit Tests**
   - Test individual functions and components
   - Mock external dependencies
   - Test error conditions

2. **Integration Tests**
   - Test component interactions
   - Test API integrations
   - Test user workflows

3. **E2E Tests**
   - Test complete user journeys
   - Test on multiple browsers
   - Test performance scenarios

### Deployment Strategy

1. **Staging Environment**
   - Test in staging before production
   - Use same infrastructure as production
   - Automated testing in staging

2. **Gradual Rollouts**
   - Use Vercel rollbacks for quick recovery
   - Monitor error rates during deployment
   - Have rollback plan ready

3. **Feature Flags**
   - Deploy features behind flags
   - Test in production safely
   - Gradual feature rollout

### Backup & Recovery

1. **Database Backups**
   - Regular automated backups
   - Test backup restoration
   - Off-site backup storage

2. **Code Repository**
   - Use Git for version control
   - Tag releases
   - Maintain deployment history

3. **Disaster Recovery**
   - Document recovery procedures
   - Test recovery scenarios
   - Have backup infrastructure ready

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check            # Run TypeScript check

# Vercel
vercel login                   # Login to Vercel
vercel                        # Deploy to preview
vercel --prod                 # Deploy to production
vercel logs                   # View function logs

# Convex
npx convex login              # Login to Convex
npx convex dev               # Start Convex development
npx convex deploy            # Deploy Convex functions
npx convex codegen           # Generate types

# Clerk
# Check dashboard at https://dashboard.clerk.com
```

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_CONVEX_URL`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `CLERK_WEBHOOK_SECRET` (for webhooks)

### Health Check Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

This comprehensive troubleshooting guide should help resolve most issues encountered during development and deployment of the ByteCats Todo App.