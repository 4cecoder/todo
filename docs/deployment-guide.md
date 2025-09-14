# Todo App Deployment Guide

This guide covers deploying the Todo App to various platforms and environments.

## Table of Contents

1. [Vercel Deployment](#vercel-deployment)
2. [Netlify Deployment](#netlify-deployment)
3. [Railway Deployment](#railway-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Manual Server Deployment](#manual-server-deployment)
7. [Environment Configuration](#environment-configuration)
8. [Domain Setup](#domain-setup)
9. [SSL Configuration](#ssl-configuration)
10. [Monitoring Setup](#monitoring-setup)

## Vercel Deployment

Vercel is the recommended deployment platform for Next.js applications.

### Prerequisites

- GitHub repository with your code
- Vercel account
- Clerk and Convex accounts

### Step-by-Step Deployment

1. **Connect Repository**:
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` or `bun run build`
   - **Output Directory**: `.next`

4. **Environment Variables**:
   Add these environment variables in Vercel:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

### Vercel-Specific Configuration

#### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

#### Build Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@clerk/clerk-sdk'],
  },
  images: {
    domains: ['images.clerk.dev'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

## Netlify Deployment

### Prerequisites

- Netlify account
- Build hooks configured

### Deployment Steps

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**:
   - **Base directory**: `./`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

3. **Environment Variables**:
   Add in Netlify dashboard:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy automatically

### Netlify Functions

For serverless functions:

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
```

## Railway Deployment

### Prerequisites

- Railway account
- PostgreSQL database (if needed)

### Deployment Steps

1. **Connect Repository**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**:
   ```bash
   railway init
   railway up
   ```

3. **Environment Variables**:
   ```bash
   railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   railway variables set CLERK_SECRET_KEY=sk_live_...
   railway variables set NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
   ```

4. **Database Setup** (if using Railway PostgreSQL):
   ```bash
   railway add postgresql
   ```

## AWS Deployment

### Using Amplify

1. **Create Amplify App**:
   - Go to AWS Amplify Console
   - Click "New app" > "Host web app"

2. **Connect Repository**:
   - Choose GitHub as source
   - Select your repository

3. **Build Settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/
   ```

4. **Environment Variables**:
   Add in Amplify console:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
   NEXT_PUBLIC_CONVEX_URL
   ```

### Using EC2

1. **Launch EC2 Instance**:
   ```bash
   # Ubuntu 20.04 LTS recommended
   aws ec2 run-instances \
     --image-id ami-0c55b159cbfafe1d0 \
     --instance-type t3.micro \
     --key-name your-key-pair
   ```

2. **Install Dependencies**:
   ```bash
   sudo apt update
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Deploy Application**:
   ```bash
   git clone your-repo
   cd todo-app
   npm install
   npm run build
   npm start
   ```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  todo-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
    depends_on:
      - convex
  convex:
    image: convexlocal/convex
    ports:
      - "3210:3210"
    environment:
      - CONVEX_URL=http://localhost:3210
```

### Build and Run

```bash
# Build Docker image
docker build -t todo-app .

# Run with Docker Compose
docker-compose up -d

# Or run directly
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
  -e CLERK_SECRET_KEY=... \
  -e NEXT_PUBLIC_CONVEX_URL=... \
  todo-app
```

## Manual Server Deployment

### Prerequisites

- Ubuntu/Debian server
- Node.js 18+
- Nginx or Apache
- SSL certificate

### Server Setup

1. **Update System**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone and Setup App**:
   ```bash
   git clone your-repo
   cd todo-app
   npm install
   npm run build
   ```

5. **Start with PM2**:
   ```bash
   pm2 start npm --name "todo-app" -- start
   pm2 startup
   pm2 save
   ```

### Nginx Configuration

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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## Environment Configuration

### Production Environment Variables

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/todos
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/todos

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS=true
VERCEL_ANALYTICS_ID=your_analytics_id

# Error Tracking (optional)
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Environment-Specific Configs

```javascript
// config/production.js
module.exports = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL,
    env: 'production'
  },
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
  },
  convex: {
    url: process.env.NEXT_PUBLIC_CONVEX_URL
  }
}
```

## Domain Setup

### Custom Domain with Vercel

1. **Add Domain**:
   - Go to Vercel project settings
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Custom Domain with Netlify

1. **Add Domain**:
   - Go to Netlify site settings
   - Add custom domain
   - Configure DNS records

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

## SSL Configuration

### Automatic SSL (Vercel/Netlify)

- SSL certificates are automatically provisioned
- No additional configuration needed
- Certificates auto-renew

### Manual SSL Setup

1. **Obtain Certificate**:
   ```bash
   # Using Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Nginx SSL Configuration**:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # SSL settings
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;

       location / {
           proxy_pass http://localhost:3000;
           # ... proxy settings
       }
   }
   ```

## Monitoring Setup

### Application Monitoring

1. **Vercel Analytics**:
   - Built-in performance monitoring
   - Real-time metrics
   - Error tracking

2. **Sentry Integration**:
   ```bash
   npm install @sentry/nextjs
   ```

   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
     environment: process.env.NODE_ENV,
   });
   ```

### Database Monitoring

1. **Convex Dashboard**:
   - Function performance
   - Database usage
   - Error logs

2. **Custom Metrics**:
   ```javascript
   // lib/metrics.js
   export const trackEvent = (event, data) => {
     if (process.env.NODE_ENV === 'production') {
       // Send to analytics service
       console.log('Event:', event, data);
     }
   };
   ```

### Health Checks

```javascript
// app/api/health/route.js
export async function GET() {
  try {
    // Check database connection
    // Check external services
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

## Performance Optimization

### Build Optimization

1. **Enable Compiler Optimizations**:
   ```javascript
   // next.config.js
   module.exports = {
     swcMinify: true,
     compiler: {
       removeConsole: process.env.NODE_ENV === 'production',
     },
     experimental: {
       optimizeCss: true,
     },
   }
   ```

2. **Image Optimization**:
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['images.clerk.dev'],
       formats: ['image/webp', 'image/avif'],
     },
   }
   ```

### Runtime Optimization

1. **Caching Strategy**:
   ```javascript
   // Cache API responses
   export const revalidate = 3600; // 1 hour
   ```

2. **Database Optimization**:
   - Use Convex's built-in caching
   - Implement proper indexing
   - Batch database operations

## Backup and Recovery

### Database Backups

1. **Convex Automatic Backups**:
   - Daily backups retained for 30 days
   - Point-in-time recovery available

2. **Manual Backups**:
   ```bash
   # Export data
   npx convex export --table todos > backup_todos.json
   npx convex export --table categories > backup_categories.json
   ```

### Application Backups

1. **Code Repository**:
   - Use Git for version control
   - Tag releases
   - Keep deployment scripts

2. **Configuration Backups**:
   - Backup environment variables
   - Document infrastructure setup
   - Keep SSL certificates

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**:
   - Use Vercel's global CDN
   - Implement proper caching
   - Optimize database queries

2. **Database Scaling**:
   - Convex handles scaling automatically
   - Monitor usage patterns
   - Optimize query performance

### Vertical Scaling

1. **Server Resources**:
   - Monitor CPU and memory usage
   - Scale server instances as needed
   - Implement auto-scaling

2. **Performance Monitoring**:
   - Set up alerts for performance issues
   - Monitor response times
   - Track error rates

## Troubleshooting Deployment

### Common Issues

1. **Build Failures**:
   - Check Node.js version
   - Verify dependencies
   - Check build logs

2. **Runtime Errors**:
   - Check environment variables
   - Verify service connections
   - Review application logs

3. **Performance Issues**:
   - Check database queries
   - Optimize images
   - Implement caching

### Debug Commands

```bash
# Check application status
pm2 status

# View application logs
pm2 logs todo-app

# Check system resources
htop
df -h

# Test API endpoints
curl -I https://your-app.com/api/health
```

### Rollback Strategy

1. **Version Control**:
   - Keep previous versions deployable
   - Use feature flags for gradual rollouts
   - Have rollback scripts ready

2. **Database Rollbacks**:
   - Test migrations thoroughly
   - Keep backup scripts
   - Document rollback procedures

This deployment guide covers all major platforms and scenarios. Choose the platform that best fits your needs and follow the specific instructions for your chosen deployment method.</content>
<parameter name="filePath">/root/bytecats/sites/todo/docs/deployment-guide.md