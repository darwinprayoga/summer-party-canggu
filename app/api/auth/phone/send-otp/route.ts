import { NextRequest, NextResponse } from 'next/server';
import { phoneLoginSchema } from '@/types';
import { OTPService } from '@/lib/auth/otp';
import { OtpRateLimiter } from '@/lib/auth/otp-rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = phoneLoginSchema.parse(body);

    // Check rate limit before sending OTP
    const rateLimitResult = await OtpRateLimiter.checkRateLimit(phone, 'LOGIN');

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        message: rateLimitResult.message,
        data: {
          remainingAttempts: rateLimitResult.remainingAttempts,
          cooldownUntil: rateLimitResult.cooldownUntil,
          nextResendAt: rateLimitResult.nextResendAt
        }
      }, { status: 429 });
    }

    // Send OTP
    await OTPService.sendOTP(phone, 'LOGIN');

    // Record the attempt
    await OtpRateLimiter.recordAttempt(phone, 'LOGIN');

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        remainingAttempts: rateLimitResult.remainingAttempts
      }
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to send OTP',
    }, { status: 500 });
  }
}