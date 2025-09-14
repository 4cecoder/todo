# Playwright Vercel Deployment Fix

## Problem Analysis

The Playwright installation fails on Vercel because:

1. **Vercel Environment Limitations**: Vercel's serverless environment doesn't provide `apt-get` or system package managers
2. **Postinstall Script Failure**: The `postinstall` script `"playwright install --with-deps"` tries to install system dependencies using `apt-get`
3. **Missing Browser Binaries**: Vercel doesn't have required browser binaries pre-installed
4. **Build Process Failure**: Deployment fails during `npm install` when postinstall script runs

## Solution Options

### Option 1: Immediate Fix - Skip Browser Installation (Recommended)

**Best for**: Quick deployment fix, E2E tests run in CI/CD

**Changes Made**:

- Modified `package.json` postinstall script to skip browser download when `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`
- Updated `vercel.json` to set the environment variable

**How it works**:

```json
// package.json
"postinstall": "if [ \"$PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD\" != \"1\" ]; then playwright install --with-deps; fi"

// vercel.json
{
  "env": {
    "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD": "1"
  }
}
```

**Pros**:

- ✅ Immediate fix for deployment
- ✅ No additional dependencies
- ✅ Works with existing Playwright setup
- ✅ E2E tests still work in CI/CD

**Cons**:

- ❌ Playwright won't work in Vercel serverless functions
- ❌ Requires separate CI/CD for E2E testing

### Option 2: Serverless-Compatible Playwright

**Best for**: Running Playwright in Vercel serverless functions

**Changes Made**:

- Added `playwright-core` and `@sparticuz/chromium` packages
- Created `lib/playwright-serverless.ts` for serverless browser management

**Usage**:

```typescript
import { createServerlessPage } from '@/lib/playwright-serverless'

export default async function handler(req, res) {
  const page = await createServerlessPage()
  await page.goto('https://example.com')
  const content = await page.content()
  res.status(200).json({ content })
}
```

**Pros**:

- ✅ Works in Vercel serverless functions
- ✅ Lightweight browser binary
- ✅ Optimized for serverless environments

**Cons**:

- ❌ Additional dependencies
- ❌ Different API from standard Playwright
- ❌ Limited browser features

### Option 3: CI/CD Integration with GitHub Actions

**Best for**: Production-grade E2E testing

**Changes Made**:

- Created `.github/workflows/playwright.yml` workflow
- Configured to run tests on push/PR and after Vercel deployment

**Features**:

- Runs on Ubuntu with full browser support
- Tests against deployed Vercel preview URLs
- Uploads test reports and artifacts
- Integrates with Vercel deployment status

**Pros**:

- ✅ Full browser functionality
- ✅ Tests against actual deployment
- ✅ Automated CI/CD pipeline
- ✅ Comprehensive test reporting

**Cons**:

- ❌ Requires GitHub repository
- ❌ Additional CI/CD setup
- ❌ Longer feedback loop

### Option 4: Playwright Configuration Updates

**Best for**: Optimizing existing setup

**Changes Made**:

- Updated `playwright.config.ts` to handle CI environments better
- Conditional web server configuration
- Optimized worker settings for CI

**Features**:

- Disables web server in CI environment
- Optimizes parallel execution
- Better error handling

## Recommended Implementation Strategy

### For Immediate Deployment Fix

1. **Apply Option 1** (Skip browser installation):

   ```bash
   # Changes already applied
   # Vercel deployment should now work
   ```

2. **Test deployment**:
   ```bash
   vercel --prod
   ```

### For Production-Ready Setup

1. **Apply Option 1** (Skip browser installation)
2. **Apply Option 3** (CI/CD integration)
3. **Configure GitHub Secrets**:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### For Serverless Function Requirements

1. **Apply Option 2** (Serverless Playwright)
2. **Update API routes** to use serverless browser
3. **Test locally** before deploying

## Testing the Fix

### Local Testing

```bash
# Test with browser installation (development)
npm install

# Test without browser installation (production simulation)
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Check deployment logs
vercel logs
```

### CI/CD Testing

```bash
# Trigger GitHub Actions workflow
git push main

# Check workflow status
gh run list
```

## Troubleshooting

### Common Issues

1. **Still getting apt-get errors**:
   - Verify `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` is set in Vercel environment
   - Check `vercel.json` syntax

2. **GitHub Actions failing**:
   - Verify repository secrets are configured
   - Check workflow syntax and permissions

3. **Serverless browser issues**:
   - Verify `@sparticuz/chromium` installation
   - Check memory limits in Vercel functions

### Debug Commands

```bash
# Check Playwright installation
npx playwright --version

# Test browser launch locally
npx playwright test --debug

# Check Vercel environment variables
vercel env ls
```

## Best Practices

1. **Environment Separation**: Use different configurations for development and production
2. **CI/CD Integration**: Run E2E tests in CI, not on production
3. **Resource Management**: Monitor Vercel function memory usage
4. **Test Coverage**: Focus on critical user flows
5. **Error Handling**: Implement proper error handling in serverless functions

## Future Considerations

1. **Browser Testing Services**: Consider services like Browserless for production scraping
2. **Containerized Testing**: Use Docker containers for consistent testing environments
3. **Performance Monitoring**: Implement monitoring for test execution times
4. **Parallel Testing**: Optimize test parallelization for faster feedback

## Conclusion

The recommended approach is **Option 1 + Option 3**:

- Skip browser installation on Vercel (Option 1)
- Implement CI/CD with GitHub Actions (Option 3)

This provides:

- ✅ Immediate deployment fix
- ✅ Production-grade testing
- ✅ Separation of concerns
- ✅ Scalable architecture

For serverless function requirements, add **Option 2** as needed.
