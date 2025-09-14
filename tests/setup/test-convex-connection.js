const { testConvexConnection, validateConvexUrl } = require('../../lib/convex-connection.ts')

async function testConnection() {
  console.log('Testing Convex connection...')

  // Get the Convex URL from environment
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://wary-chickadee-703.convex.cloud'

  console.log('Convex URL:', convexUrl)

  // Validate URL
  const validation = validateConvexUrl(convexUrl)
  console.log('URL validation:', validation)

  if (!validation.valid) {
    console.error('Invalid Convex URL:', validation.error)
    return
  }

  // Test connection
  console.log('Testing connection...')
  const result = await testConvexConnection(convexUrl)
  console.log('Connection test result:', result)

  if (result.success) {
    console.log('✅ Convex connection successful!')
    console.log(`Latency: ${result.latency}ms`)
  } else {
    console.error('❌ Convex connection failed:', result.error)
  }
}

testConnection().catch(console.error)
