import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpSchema } from '@/types';
import { OTPService } from '@/lib/auth/otp';
import { JWTService } from '@/lib/auth/jwt';
import { OtpRateLimiter } from '@/lib/auth/otp-rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = verifyOtpSchema.parse(body);

    // Verify OTP
    const isValid = await OTPService.verifyOTP(phone, code, 'LOGIN');

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired OTP code',
      }, { status: 400 });
    }

    // Reset rate limiting attempts on successful verification
    await OtpRateLimiter.resetAttempts(phone, 'LOGIN');

    // Generate temporary token for registration completion
    const tempToken = JWTService.signTempToken({
      id: phone, // Use phone as temporary ID
      phone,
      role: 'USER', // Default to USER, will be determined during registration
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        tempToken,
        phone,
      },
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    }, { status: 500 });
  }
}