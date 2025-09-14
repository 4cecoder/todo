# Vercel Deployment Setup Guide

## Prerequisites

- Vercel account (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- Next.js project ready for deployment

## Account Setup

### Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or email
3. Verify your email address

### Install Vercel CLI (Optional)

```bash
npm install -g vercel
vercel login
```

## Project Deployment

### Method 1: Git Integration (Recommended)

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Select the repository containing your Next.js app

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Environment Variables**
   - Add all environment variables from `.env.local`
   - Set different values for Production/Preview environments

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Get a preview URL immediately

### Method 2: Vercel CLI

```bash
# Initialize project
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Select directory (./)
# - Override settings if needed

# Deploy
vercel --prod
```

## Environment Configuration

### Environment Variables Setup

In Vercel dashboard → Project Settings → Environment Variables:

```env
# Production Environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Preview Environment (for pull requests)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-preview-deployment.convex.cloud
NEXT_PUBLIC_APP_URL=https://your-app-git-main.vercel.app
```

### Environment-Specific Builds

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Domain Configuration

### Custom Domain

1. **Add Domain**
   - Project Settings → Domains
   - Enter your domain name
   - Vercel will provide DNS records

2. **DNS Configuration**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or A records for apex domains

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS enabled by default

### Subdomains

- Automatic `*.vercel.app` domains for branches
- Custom subdomains supported
- Wildcard domains for multi-tenant apps

## Build & Deploy Configuration

### Build Settings

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Build Hooks

- Automatic builds on git push
- Preview deployments for pull requests
- Production deployments from main branch

### Environment Overrides

```json
// vercel.json
{
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "BUILD_ENV": "vercel"
    }
  }
}
```

## Performance Optimization

### Image Optimization

Vercel automatically optimizes images:

```tsx
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority
/>
```

### Edge Functions

For global performance, use Edge Runtime:

```tsx
// app/api/edge/route.ts
export const runtime = 'edge'

export async function GET() {
  return new Response('Hello from Edge!')
}
```

### Caching

Implement proper caching strategies:

```tsx
// app/layout.tsx
export const revalidate = 3600 // 1 hour

// Or per page
// app/page.tsx
export const revalidate = 60 // 1 minute
```

## Monitoring & Analytics

### Vercel Analytics

1. **Enable Analytics**
   - Project Settings → Analytics
   - Enable Web Analytics and Speed Insights

2. **View Metrics**
   - Real-time visitor data
   - Performance metrics
   - Core Web Vitals

### Logs & Debugging

- **Runtime Logs**: View function logs in dashboard
- **Build Logs**: Monitor build process
- **Error Tracking**: Built-in error monitoring

## Security Features

### Deployment Protection

1. **Password Protection**
   - Project Settings → Deployment Protection
   - Set password for production deployments

2. **Trusted IPs**
   - Restrict access to specific IP addresses
   - Useful for staging environments

3. **Vercel Authentication**
   - Require Vercel account login to access deployments

### Firewall & DDoS Protection

- Built-in Web Application Firewall (WAF)
- DDoS mitigation
- Bot management
- Rate limiting

## Collaboration

### Team Management

1. **Add Team Members**
   - Project Settings → Members
   - Invite by email
   - Set roles (Owner, Admin, Developer, Viewer)

2. **Role-Based Access**
   - Control who can deploy, configure, or view projects
   - SSO integration available for Enterprise

### Comments & Feedback

- **Preview Comments**: Team members can comment on preview deployments
- **Draft Mode**: Preview unpublished content
- **Feature Flags**: Control feature visibility

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs for errors
   - Ensure all dependencies are listed in `package.json`
   - Verify environment variables are set

2. **Runtime Errors**
   - Check function logs
   - Use `vercel logs` CLI command
   - Implement proper error handling

3. **Performance Issues**
   - Use Speed Insights to identify bottlenecks
   - Optimize images and assets
   - Implement caching strategies

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Community Forum](https://vercel.com/community)
- [Status Page](https://vercel-status.com)
- [Support Center](https://vercel.com/help)

## Best Practices

### Deployment Strategy
- Use preview deployments for testing
- Implement CI/CD with Git integration
- Use environment variables for configuration
- Monitor performance and errors

### Security
- Keep dependencies updated
- Use environment variables for secrets
- Implement proper authentication
- Enable deployment protection for sensitive environments

### Performance
- Optimize images and assets
- Use Edge Functions for global apps
- Implement proper caching
- Monitor Core Web Vitals

### Cost Optimization
- Use Hobby plan for development
- Monitor usage in dashboard
- Optimize build times
- Clean up unused deployments

## Advanced Features

### Microfrontends
- Deploy multiple applications as one
- Shared routing and state management
- Independent deployments

### Multi-Zone Architecture
- Deploy to multiple regions
- Global CDN with edge computing
- Reduced latency worldwide

### Integrations
- Connect with 100+ services
- Webhooks for automation
- API access for custom integrations

## Migration from Other Platforms

### From Netlify
- Similar deployment process
- Environment variables mapping
- Build configuration differences

### From Heroku
- Serverless vs traditional hosting
- Cold start considerations
- Environment variable management

### From Vercel to Self-Hosting
- Export build artifacts
- Configure custom server
- Handle routing manually

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/cli)
- [Vercel Blog](https://vercel.com/blog)