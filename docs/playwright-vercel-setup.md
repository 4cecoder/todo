# Playwright + Vercel Setup Guide

## Overview

This document explains how Playwright is configured to work seamlessly with Vercel deployments while maintaining full E2E testing capabilities.

## Problem Solved

**Original Issue**: Playwright installation was failing on Vercel with:

```
sh: line 1: apt-get: command not found
Failed to install browsers
Error: Installation process exited with code: 127
```

**Root Cause**: Vercel's serverless environment doesn't provide `apt-get` or system package managers that Playwright needs for browser installation.

## Solution Implemented

### 1. Firefox-Only Configuration

**Why Firefox?**

- Firefox has better compatibility with serverless environments
- Fewer system dependencies compared to Chrome/WebKit
- More reliable in CI/CD environments
- Excellent for E2E testing coverage

**Configuration in `playwright.config.ts`:**

```typescript
projects: [
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      launchOptions: {
        firefoxUserPrefs: {
          'dom.webnotifications.enabled': false,
          'dom.push.enabled': false,
        },
      },
    },
  },
  {
    name: 'Mobile Firefox',
    use: {
      ...devices['Pixel 5'],
      launchOptions: {
        firefoxUserPrefs: {
          'dom.webnotifications.enabled': false,
          'dom.push.enabled': false,
        },
      },
    },
  },
],
```

### 2. Smart Browser Installation

**Package.json `postinstall` script:**

```json
"postinstall": "if [ \"$PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD\" != \"1\" ]; then playwright install firefox; fi"
```

**How it works:**

- In development: Installs Firefox browser automatically
- In Vercel: Skips browser installation when `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`
- Only installs Firefox (not Chrome/WebKit) to reduce dependencies

### 3. Vercel Environment Configuration

**`vercel.json`:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "env": {
    "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD": "1"
  }
}
```

**Effect:**

- Automatically sets environment variable in Vercel builds
- Prevents browser download during `npm install`
- Eliminates `apt-get: command not found` error

### 4. CI/CD Optimized Configuration

**Web server handling:**

```typescript
webServer: process.env['CI'] || process.env['PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD'] === '1'
  ? undefined // Skip web server in CI/Vercel
  : {
      command: 'npm run dev',
      url: process.env['BASE_URL'] || 'http://localhost:3000',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
      env: {
        NODE_ENV: 'test',
        // ... environment variables
      },
    },
```

**Benefits:**

- No web server startup in CI/Vercel environments
- Tests run against deployed URLs in CI
- Faster test execution in production environments

## Development Workflow

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   # Firefox browser automatically installed
   ```

2. **Run E2E tests:**

   ```bash
   npm run test:e2e
   # or for UI mode:
   npm run test:e2e:ui
   ```

3. **Debug tests:**
   ```bash
   npm run test:e2e:debug
   ```

### CI/CD Pipeline

1. **Vercel Build:**
   - `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is automatically set
   - Firefox browser installation is skipped
   - No `apt-get` dependency issues

2. **GitHub Actions (Recommended):**
   - Run E2E tests against deployed Vercel preview URLs
   - Full Firefox browser installation in CI environment
   - Test artifacts and reports generated

## Testing Commands

### Available Scripts

```bash
# Firefox-specific testing
npm run test:e2e:firefox          # Run only Firefox tests
npm run test:e2e:headed          # Firefox with visible browser
npm run test:e2e:debug           # Firefox debug mode

# CI/CD testing
npm run test:e2e:ci              # CI-optimized Firefox tests
npm run test:e2e:parallel        # Parallel Firefox execution

# Development testing
npm run test:e2e:ui              # Firefox UI mode
npm run test:e2e:report          # View test reports
```

### Environment Variables

| Variable                           | Default                 | Purpose                                          |
| ---------------------------------- | ----------------------- | ------------------------------------------------ |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | `undefined`             | Skip browser installation (set to "1" in Vercel) |
| `BASE_URL`                         | `http://localhost:3000` | Base URL for tests                               |
| `CI`                               | `undefined`             | CI mode detection                                |

## Benefits of This Setup

### ✅ Vercel Compatibility

- No system dependency conflicts
- Fast deployment times
- No `apt-get` or package manager issues

### ✅ Testing Coverage

- Full Firefox E2E testing
- Mobile testing with Firefox
- Comprehensive test coverage

### ✅ Development Experience

- Automatic browser installation in development
- Full debugging capabilities
- UI mode for visual testing

### ✅ CI/CD Integration

- Works with GitHub Actions
- Tests against deployed applications
- Artifact generation and reporting

### ✅ Performance

- Firefox-only reduces installation time
- Smart web server handling
- Optimized for serverless environments

## Troubleshooting

### Common Issues

**1. "Firefox not found" in development:**

```bash
# Manually install Firefox
npm run test:e2e:install
```

**2. Tests failing in CI:**

- Ensure `BASE_URL` is set to deployed URL
- Check that environment variables are properly configured
- Verify deployment completed before running tests

**3. Slow test execution:**

- Use `npm run test:e2e:parallel` for faster execution
- Consider reducing test timeout in `playwright.config.ts`

### Debug Commands

```bash
# Check Playwright installation
npx playwright --version

# Verify Firefox installation
npx playwright install firefox

# Test configuration validation
npx playwright test --debug
```

## Future Enhancements

### Optional Improvements

1. **Multiple Firefox Versions:**

   ```typescript
   projects: [
     {
       name: 'firefox-stable',
       use: { ...devices['Desktop Firefox'] },
     },
     {
       name: 'firefox-beta',
       use: { ...devices['Desktop Firefox'], channel: 'firefox-beta' },
     },
   ],
   ```

2. **Advanced CI/CD:**
   - Parallel test execution across multiple environments
   - Performance testing integration
   - Visual regression testing

3. **Test Analytics:**
   - Integration with test reporting tools
   - Performance metrics collection
   - Test failure analysis

## Conclusion

This Playwright + Vercel setup provides:

- **Reliable deployments** without browser installation conflicts
- **Comprehensive testing** with Firefox-only configuration
- **Excellent developer experience** with automatic setup
- **Production-ready** CI/CD integration

The solution eliminates the `apt-get: command not found` error while maintaining full E2E testing capabilities for the ByteCats Todo App.
