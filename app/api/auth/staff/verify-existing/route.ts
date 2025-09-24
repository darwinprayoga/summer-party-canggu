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
    if (!tokenPayload || !tokenPayload.existingStaffId) {
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

    // Get the existing staff
    const existingStaff = await prisma.staff.findUnique({
      where: { id: tokenPayload.existingStaffId },
    });

    if (!existingStaff) {
      return NextResponse.json({
        success: false,
        message: 'Staff not found',
      }, { status: 404 });
    }

    // Verify the phone matches
    if (existingStaff.phone !== phone) {
      return NextResponse.json({
        success: false,
        message: 'Phone number does not match staff records',
      }, { status: 400 });
    }

    // Check if staff is still approved and active
    if (existingStaff.registrationStatus !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        message: `Staff registration is ${existingStaff.registrationStatus.toLowerCase()}. Please contact an admin.`,
      }, { status: 403 });
    }

    if (!existingStaff.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Staff account is inactive. Please contact an admin.',
      }, { status: 403 });
    }

    // Generate full authentication token
    const authToken = JWTService.sign({
      id: existingStaff.id,
      staffId: existingStaff.staffId,
      role: 'STAFF',
      email: existingStaff.email,
    });

    console.log('✅ Existing staff phone verification successful:', existingStaff.fullName, `(@${existingStaff.instagram}) - ${existingStaff.staffId}`);

    return NextResponse.json({
      success: true,
      message: 'Phone verification successful',
      data: {
        token: authToken,
        staff: {
          id: existingStaff.id,
          staffId: existingStaff.staffId,
          fullName: existingStaff.fullName,
          email: existingStaff.email,
          phone: existingStaff.phone,
          // whatsapp: existingStaff.whatsapp,
          instagram: existingStaff.instagram,
          loginMethod: existingStaff.loginMethod,
          registrationStatus: existingStaff.registrationStatus,
          isActive: existingStaff.isActive,
          approvedAt: existingStaff.approvedAt,
        },
      },
    });

  } catch (error: any) {
    console.error('Existing staff verification error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Verification failed',
    }, { status: 500 });
  }
}