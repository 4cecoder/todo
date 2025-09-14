import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ 
      userId,
      message: 'User is authenticated'
    })
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}