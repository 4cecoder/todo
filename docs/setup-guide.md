# Todo App Setup Guide

This guide provides step-by-step instructions for setting up the Todo App locally and in production environments.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm** or **bun**: Package manager
- **Git**: Version control system

### Recommended Development Environment

- **VS Code** with TypeScript and React extensions
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd todo-app
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using bun (recommended)
bun install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/todos
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/todos

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Clerk Authentication

1. **Create a Clerk Application**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Click "Add Application"
   - Choose "Next.js" as your framework
   - Configure your sign-in and sign-up URLs

2. **Configure Authentication Settings**:
   - Set up social providers (optional)
   - Configure email templates
   - Set up webhooks for user events

3. **Update Clerk Configuration**:
   - Copy your publishable key to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy your secret key to `CLERK_SECRET_KEY`

### 5. Set Up Convex Database

1. **Install Convex CLI**:
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex**:
   ```bash
   npx convex dev --once
   ```

3. **Deploy Database Schema**:
   ```bash
   npx convex deploy
   ```

4. **Get Deployment URL**:
   - Copy the deployment URL from Convex dashboard
   - Add it to `NEXT_PUBLIC_CONVEX_URL` in your `.env.local`

### 6. Configure the Application

Update the following configuration files:

#### `convex/auth.config.js`
```javascript
export default {
  providers: [
    {
      domain: "your-app-name.clerk.accounts.dev",
      applicationID: "your-clerk-app-id",
    },
  ],
}
```

#### `app/layout.tsx`
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  // ... other metadata
}
```

### 7. Run the Development Server

```bash
# Using npm
npm run dev

# Using bun
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Verify Setup

Run the verification script to ensure everything is configured correctly:

```bash
node verify-auth-setup.js
```

## Production Deployment

### Vercel Deployment (Recommended)

#### 1. Prepare for Deployment

1. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_live_key
   CLERK_SECRET_KEY=sk_live_your_live_secret
   NEXT_PUBLIC_CONVEX_URL=https://your-production-convex-url
   ```

2. **Update Clerk Configuration**:
   - Change to production Clerk keys
   - Update domain in `convex/auth.config.js`
   - Update metadata base URL in `app/layout.tsx`

#### 2. Deploy to Vercel

1. **Connect Repository**:
   - Push your code to GitHub
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` or `bun run build`
   - **Output Directory**: `.next` (leave default)

3. **Add Environment Variables**:
   - Add all environment variables from your `.env.local`
   - Ensure they're set for production environment

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

#### 3. Set Up Convex Production

1. **Deploy Convex Functions**:
   ```bash
   npx convex deploy --prod
   ```

2. **Update Convex URL**:
   - Get the production Convex URL
   - Update `NEXT_PUBLIC_CONVEX_URL` in Vercel

### Manual Server Deployment

#### 1. Build the Application

```bash
npm run build
```

#### 2. Start Production Server

```bash
npm start
```

#### 3. Set Up Reverse Proxy (nginx example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## CI/CD Setup

### GitHub Actions Configuration

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Convex Deployment

Add Convex deployment to your CI/CD:

```yaml
- name: Deploy Convex
  run: npx convex deploy --prod
  env:
    CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

## Environment Configuration

### Development Environment

```env
# Development settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-dev.convex.cloud
```

### Production Environment

```env
# Production settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
```

### Staging Environment

```env
# Staging settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.your-app.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-staging.convex.cloud
```

## Database Management

### Convex Dashboard

1. **Access Dashboard**: Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. **Monitor Usage**: Check function calls, storage, and performance
3. **View Logs**: Debug issues with function logs
4. **Manage Data**: View and edit database records

### Database Backups

Convex automatically handles backups. For additional security:

1. **Export Data Regularly**:
   ```bash
   npx convex export --table todos > todos_backup.json
   ```

2. **Set Up Automated Backups**:
   - Use Convex's built-in backup features
   - Schedule regular data exports
   - Store backups in secure cloud storage

## Monitoring and Logging

### Application Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Convex Dashboard**: Database and function monitoring
3. **Clerk Dashboard**: Authentication monitoring

### Error Tracking

Set up error tracking with Sentry:

```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

### Log Management

1. **Application Logs**: Available in Vercel dashboard
2. **Database Logs**: Available in Convex dashboard
3. **Authentication Logs**: Available in Clerk dashboard

## Security Configuration

### HTTPS Setup

1. **Vercel**: Automatic HTTPS for all deployments
2. **Custom Domain**: Configure SSL certificates
3. **Security Headers**: Add security headers in `next.config.js`

### Environment Security

1. **Never commit secrets**: Use environment variables
2. **Rotate keys regularly**: Update API keys periodically
3. **Use least privilege**: Limit permissions for services

### CORS Configuration

Configure CORS in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}
```

## Troubleshooting Setup Issues

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Authentication Issues**:
   - Verify Clerk keys are correct
   - Check domain configuration
   - Ensure webhooks are set up

3. **Database Connection Issues**:
   - Verify Convex URL
   - Check network connectivity
   - Review Convex deployment status

4. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify values are not empty

### Getting Help

- **Documentation**: Check official docs for Next.js, Clerk, and Convex
- **Community**: Join Discord communities for each service
- **Support**: Contact support for each service
- **Logs**: Check application and service logs for error details

## Performance Optimization

### Build Optimization

1. **Enable Turbopack**: Use `--turbopack` flag for faster builds
2. **Optimize Images**: Use Next.js Image component
3. **Code Splitting**: Implement dynamic imports for large components

### Runtime Optimization

1. **Caching**: Implement appropriate caching strategies
2. **CDN**: Use Vercel's global CDN
3. **Database Optimization**: Use Convex's built-in optimization features

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep packages up to date
2. **Monitor Performance**: Check analytics regularly
3. **Review Logs**: Monitor for errors and issues
4. **Backup Data**: Regular data backups

### Scaling Considerations

1. **Database Scaling**: Convex handles scaling automatically
2. **CDN**: Vercel provides global CDN
3. **Caching**: Implement appropriate caching layers

This setup guide covers everything you need to get the Todo App running locally and deploy it to production. Follow the steps carefully, and don't hesitate to reach out for help if you encounter any issues.</content>
<parameter name="filePath">/root/bytecats/sites/todo/docs/setup-guide.md