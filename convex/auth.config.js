const authConfig = {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_ISSUER_URL || 'https://prepared-spider-2.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
}

export default authConfig
