import { NextRequest, NextResponse } from 'next/server'
import { OtpRateLimiter } from '@/lib/auth/otp-rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Verify this is being called by Vercel Cron or locally
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clean up expired OTPs
    await OtpRateLimiter.cleanupExpiredOtps()

    return NextResponse.json({
      success: true,
      message: 'OTP cleanup completed',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OTP cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed'
    }, { status: 500 })
  }
}