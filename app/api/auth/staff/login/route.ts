import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { OTPService } from '@/lib/auth/otp';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { normalizePhoneNumber } from '@/lib/utils/phone';

const staffLoginSchema = z.object({
  identifier: z.string().min(1, 'Phone number, email, or staff ID is required'),
  otp: z.string().optional(),
  requestOtp: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, otp, requestOtp } = staffLoginSchema.parse(body);

    // Check if identifier looks like a phone number
    const isPhoneNumber = /^[+]?[\d\s\-\(\)]+$/.test(identifier);

    let staff = null;

    if (isPhoneNumber) {
      // For phone numbers, try multiple formats
      const normalizedPhone = normalizePhoneNumber(identifier);
      const rawPhone = identifier.replace(/[^\d]/g, ''); // Remove all non-digits
      const localPhone = rawPhone.startsWith('62') ? '0' + rawPhone.substring(2) : rawPhone;

      console.log(`🔍 Staff phone lookup for: "${identifier}" → normalized: "${normalizedPhone}", local: "${localPhone}"`);

      staff = await prisma.staff.findFirst({
        where: {
          OR: [
            { phone: identifier },          // Exact match
            { phone: normalizedPhone },     // Normalized international format
            { phone: localPhone },          // Local format (08...)
          ],
        },
      });

      console.log(`🔍 Staff search result:`, staff ? `FOUND: ${staff.fullName} (${staff.staffId})` : 'NOT FOUND');
    } else {
      // For email or staffId, use exact match
      staff = await prisma.staff.findFirst({
        where: {
          OR: [
            { email: identifier },
            { staffId: identifier },
          ],
        },
      });
      console.log(`🔍 Staff search result (email/ID):`, staff ? `FOUND: ${staff.fullName} (${staff.staffId})` : 'NOT FOUND');
    }

    if (!staff) {
      return NextResponse.json({
        success: false,
        message: 'Staff not found',
      }, { status: 404 });
    }

    // Check if staff is approved and active
    if (staff.registrationStatus !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        message: `Staff registration is ${staff.registrationStatus.toLowerCase()}. Please contact an admin.`,
      }, { status: 403 });
    }

    if (!staff.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Staff account is inactive. Please contact an admin.',
      }, { status: 403 });
    }

    // Handle OTP request
    if (requestOtp && !otp) {
      const staffPhoneForOtp = staff.phone;
      if (!staffPhoneForOtp) {
        return NextResponse.json({
          success: false,
          message: 'No phone number associated with this staff account',
        }, { status: 400 });
      }

      try {
        await OTPService.sendOTP(staffPhoneForOtp, 'STAFF_LOGIN');

        return NextResponse.json({
          success: true,
          message: 'OTP sent successfully',
          data: {
            requireOtp: true,
            staffId: staff.staffId,
            fullName: staff.fullName,
            phone: staff.phone,
          },
        });
      } catch (error: any) {
        console.error('Failed to send staff OTP:', error);
        return NextResponse.json({
          success: false,
          message: 'Failed to send OTP',
        }, { status: 500 });
      }
    }

    // Handle OTP verification and login
    if (otp) {
      const staffPhoneForOtp = staff.phone;
      if (!staffPhoneForOtp) {
        return NextResponse.json({
          success: false,
          message: 'No phone number associated with this staff account',
        }, { status: 400 });
      }

      // Verify OTP
      const isValidOtp = await OTPService.verifyOTP(staffPhoneForOtp, otp, 'STAFF_LOGIN');
      if (!isValidOtp) {
        return NextResponse.json({
          success: false,
          message: 'Invalid or expired OTP',
        }, { status: 400 });
      }

      // Generate staff JWT token
      const token = JWTService.sign({
        id: staff.id,
        staffId: staff.staffId,
        role: 'STAFF',
      });

      console.log(`📝 Staff login: ${staff.fullName} (@${staff.instagram}) - ${staff.staffId}`);

      return NextResponse.json({
        success: true,
        message: 'Staff login successful',
        data: {
          token,
          staff: {
            id: staff.id,
            staffId: staff.staffId,
            fullName: staff.fullName,
            email: staff.email,
            phone: staff.phone,
            instagram: staff.instagram,
            loginMethod: staff.loginMethod,
            approvedAt: staff.approvedAt,
          },
        },
      });
    }

    // If no OTP provided and no OTP requested, ask for OTP
    return NextResponse.json({
      success: false,
      message: 'OTP verification required',
      data: {
        requireOtp: true,
        staffId: staff.staffId,
        fullName: staff.fullName,
        phone: staff.phone,
      },
    }, { status: 400 });

  } catch (error: any) {
    console.error('Staff login error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to process staff login',
    }, { status: 500 });
  }
}