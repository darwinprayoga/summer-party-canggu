import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpSchema } from '@/types';
import { OTPService } from '@/lib/auth/otp';
import { JWTService } from '@/lib/auth/jwt';
import { OtpRateLimiter } from '@/lib/auth/otp-rate-limiter';
import { prisma } from '@/lib/database';

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

    // Check if user already exists by phone OR whatsapp
    console.log(`🔍 DEBUG: Looking for user with phone: "${phone}"`);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { whatsapp: phone },
        ],
      },
    });

    console.log(`🔍 DEBUG: Database search result:`, existingUser ? 'FOUND' : 'NOT FOUND');
    if (existingUser) {
      console.log(`🔍 DEBUG: Found user details:`, {
        id: existingUser.id,
        fullName: existingUser.fullName,
        phone: existingUser.phone,
        whatsapp: existingUser.whatsapp,
        instagram: existingUser.instagram,
        userId: existingUser.userId,
        isActive: existingUser.isActive
      });
    }

    if (existingUser) {
      // Generate authentication token for existing user
      const authToken = JWTService.signFullToken({
        id: existingUser.id,
        role: 'USER',
        email: existingUser.email || undefined,
        phone: existingUser.phone || undefined,
      });

      console.log('📝 User login:', existingUser.fullName, `(@${existingUser.instagram}) - ${existingUser.userId}`);

      return NextResponse.json({
        success: true,
        message: 'User login successful',
        data: {
          token: authToken,
          isExisting: true,
          user: {
            id: existingUser.id,
            userId: existingUser.userId,
            fullName: existingUser.fullName,
            instagram: existingUser.instagram,
            email: existingUser.email,
            phone: existingUser.phone,
            whatsapp: existingUser.whatsapp,
            referralCode: existingUser.referralCode,
            role: 'USER',
          },
        },
      });
    }

    // For new users, generate temp token to complete registration
    console.log(`🔍 DEBUG: User not found, creating temp token for new user with phone: "${phone}"`);
    const tempToken = JWTService.signTempToken({
      id: phone,
      phone,
      role: 'USER',
    });

    console.log('📝 New phone user, temp token generated for:', phone);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully - complete registration',
      data: {
        tempToken,
        phone,
        isExisting: false,
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