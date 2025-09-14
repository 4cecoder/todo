# CI/CD Pipeline Setup

This project uses GitHub Actions for continuous integration and Vercel for continuous deployment.

## CI/CD Workflow

The pipeline includes:
- **Automated Testing**: Runs on every push and PR
- **Linting**: ESLint checks
- **Building**: Next.js build verification
- **Deployment**: Automatic deployment to Vercel on main branch pushes
- **Convex Deployment**: Automatic deployment of Convex functions

## Setup Instructions

### 1. GitHub Repository Setup

Ensure your repository has the following secrets configured in Settings > Secrets and variables > Actions:

- `VERCEL_TOKEN`: Your Vercel token (get from Vercel dashboard > Account Settings > Tokens)
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `CONVEX_DEPLOY_KEY`: Your Convex deploy key (get from Convex dashboard)

### 2. Vercel Configuration

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_VERCEL_ANALYTICS` (set to `true`)

### 3. Convex Configuration

1. Set up your Convex project
2. Add the deploy key to GitHub secrets
3. The pipeline will automatically deploy Convex functions on main branch pushes

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Deployment Process

### Automatic Deployment
- Push to `main` branch triggers full CI/CD pipeline
- Tests and linting must pass
- Convex functions deploy first
- Vercel deployment follows

### Manual Deployment
```bash
# Deploy Convex functions
cd convex && ./deploy.sh

# Deploy to Vercel
vercel --prod
```

## Monitoring

- **Vercel Analytics**: Automatically tracks page views and performance
- **Vercel Dashboard**: Monitor deployments, errors, and performance
- **Convex Dashboard**: Monitor database usage and function performance

## Troubleshooting

### Common Issues

1. **Vercel deployment fails**: Check environment variables in Vercel dashboard
2. **Convex deployment fails**: Verify CONVEX_DEPLOY_KEY secret
3. **Tests fail**: Run `npm test` locally to debug
4. **Build fails**: Check Next.js build logs

### Rollback

- Vercel: Use dashboard to rollback to previous deployment
- Convex: Deploy previous version manually if needed

## Security

- All secrets are stored in GitHub Secrets
- Environment variables are encrypted
- No sensitive data in codebase