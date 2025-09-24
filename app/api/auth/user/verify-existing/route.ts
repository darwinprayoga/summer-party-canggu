import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { OTPService } from '@/lib/auth/otp';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { phone, code, verificationToken } = await request.json();

    if (!phone || !code || !verificationToken) {
      return NextResponse.json({
        success: false,
        message: 'Phone, verification code, and verification token are required',
      }, { status: 400 });
    }

    // Verify the verification token
    const tokenPayload = JWTService.verifyTempToken(verificationToken);
    if (!tokenPayload || !tokenPayload.existingUserId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid verification token',
      }, { status: 401 });
    }

    // Verify OTP
    const isValidOTP = await OTPService.verifyOTPWithTwilio(phone, code);
    if (!isValidOTP) {
      return NextResponse.json({
        success: false,
        message: 'Invalid verification code',
      }, { status: 400 });
    }

    // Get the existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: tokenPayload.existingUserId },
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    // Verify the phone matches
    if (existingUser.phone !== phone) {
      return NextResponse.json({
        success: false,
        message: 'Phone number does not match user records',
      }, { status: 400 });
    }

    // Generate full authentication token
    const authToken = JWTService.signFullToken({
      id: existingUser.id,
      role: 'USER',
      email: existingUser.email || undefined,
      phone: existingUser.phone || undefined,
    });

    console.log('✅ Existing user phone verification successful:', existingUser.fullName, `(@${existingUser.instagram}) - ${existingUser.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Phone verification successful',
      data: {
        token: authToken,
        user: {
          id: existingUser.id,
          userId: existingUser.userId,
          fullName: existingUser.fullName,
          instagram: existingUser.instagram,
          email: existingUser.email,
          phone: existingUser.phone,
          // whatsapp: existingUser.whatsapp,
          referralCode: existingUser.referralCode,
          role: 'USER',
        },
      },
    });

  } catch (error: any) {
    console.error('Existing user verification error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Verification failed',
    }, { status: 500 });
  }
}