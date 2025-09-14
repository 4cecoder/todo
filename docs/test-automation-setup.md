# Test Automation & Husky Hooks Setup

This guide ensures all code is linted, formatted, and tested before commit, push, and production deployment.

## Overview

- Husky provides Git hooks for pre-commit and pre-push actions.
- lint-staged runs linters/formatters on staged files for fast pre-commit checks.
- Vitest is used for unit tests; Playwright for E2E.

## Local Setup

1. Install dependencies:

```bash
npm install
npm install --save-dev husky lint-staged
npx husky install
```

2. Enable Husky hooks:

```bash
npx husky add .husky/pre-commit "npx lint-staged && npm run test:unit"
npx husky add .husky/pre-push "npm run test:all"
```

3. Available scripts:

- `npm run lint` — Lint all code
- `npm run format` — Format code
- `npm run test:unit` — Run unit tests
- `npm run test:e2e` — Run end-to-end tests
- `npm run test:all` — Run unit + e2e tests

## Vercel Production

- Vercel environment variables in `vercel.json` disable Playwright browser downloads during production builds.
- The `installCommand` in `vercel.json` ensures optimized dependency installation and avoids heavy Playwright downloads.
- Ensure Vercel build command runs `npm run lint` and `npm run test:all` before building.

## Troubleshooting

- If a commit fails, review the lint and test output and fix issues before committing again.
- If Playwright tests fail in CI, ensure the environment uses headless browsers and has required environment variables set.

## Maintenance

- Keep Husky hooks up to date in `.husky/`.
- Update test scripts in `package.json` as needed.
- Periodically run `npm run test:unit` and `npm run test:e2e` locally.

## References

- https://typicode.github.io/husky/#/
- https://github.com/okonet/lint-staged
- https://vitest.dev/
- https://playwright.dev/
