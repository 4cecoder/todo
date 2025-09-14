import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    // Note: signOut should be handled on the client side
    // This endpoint just validates the user is signed in
    return NextResponse.json({
      message: 'Sign out initiated',
      redirectUrl: '/'
    })
  } catch (error) {
    console.error('Sign out validation error:', error)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}