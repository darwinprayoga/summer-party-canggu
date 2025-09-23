import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { OTPService } from '@/lib/auth/otp';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const adminLoginSchema = z.object({
  identifier: z.string().min(1, 'Phone number, email, or admin ID is required'),
  otp: z.string().optional(),
  requestOtp: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, otp, requestOtp } = adminLoginSchema.parse(body);

    console.log('🔍 Admin login attempt with identifier:', identifier);

    // Normalize phone number formats for better matching
    let phoneVariants: string[] = [];

    // If identifier looks like a phone number, generate variants
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]*$/;
    if (phoneRegex.test(identifier)) {
      const cleaned = identifier.replace(/\D/g, ''); // Remove non-digits

      phoneVariants = [
        identifier, // Original format
        cleaned, // Digits only
        `+${cleaned}`, // With +
        `+62${cleaned.startsWith('0') ? cleaned.substring(1) : cleaned}`, // Indonesian format
        `0${cleaned}`, // With leading 0
        cleaned.startsWith('62') ? `+${cleaned}` : `+62${cleaned}`, // Ensure +62
      ];

      // Remove duplicates
      phoneVariants = [...new Set(phoneVariants)];
      console.log('📱 Phone variants to search:', phoneVariants);
    }

    // Find admin by phone, email, or adminId
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
          { adminId: identifier },
          // Add phone variants for better matching
          ...phoneVariants.map(variant => ({ phone: variant })),
        ],
      },
    });

    console.log('👤 Admin lookup result:', admin ? `Found: ${admin.fullName} (${admin.phone})` : 'Not found');

    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found',
      }, { status: 404 });
    }

    // Check if admin is approved and active
    if (admin.registrationStatus !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        message: `Admin registration is ${admin.registrationStatus.toLowerCase()}. Please contact a super admin.`,
      }, { status: 403 });
    }

    if (!admin.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Admin account is inactive. Please contact a super admin.',
      }, { status: 403 });
    }

    // Handle OTP request
    if (requestOtp && !otp) {
      if (!admin.phone) {
        return NextResponse.json({
          success: false,
          message: 'No phone number associated with this admin account',
        }, { status: 400 });
      }

      try {
        await OTPService.sendOTP(admin.phone, 'ADMIN_LOGIN');

        return NextResponse.json({
          success: true,
          message: 'OTP sent successfully',
          data: {
            requireOtp: true,
            adminId: admin.adminId,
            fullName: admin.fullName,
            phone: admin.phone,
          },
        });
      } catch (error: any) {
        console.error('Failed to send admin OTP:', error);
        return NextResponse.json({
          success: false,
          message: 'Failed to send OTP',
        }, { status: 500 });
      }
    }

    // Handle OTP verification and login
    if (otp) {
      if (!admin.phone) {
        return NextResponse.json({
          success: false,
          message: 'No phone number associated with this admin account',
        }, { status: 400 });
      }

      // Verify OTP
      const isValidOtp = await OTPService.verifyOTP(admin.phone, otp, 'ADMIN_LOGIN');
      if (!isValidOtp) {
        return NextResponse.json({
          success: false,
          message: 'Invalid or expired OTP',
        }, { status: 400 });
      }

      // Generate admin JWT token
      const token = JWTService.sign({
        id: admin.id,
        adminId: admin.adminId,
        type: 'admin',
        role: admin.isSuperAdmin ? 'super_admin' : 'admin',
      });



      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            adminId: admin.adminId,
            fullName: admin.fullName,
            email: admin.email,
            phone: admin.phone,
            whatsapp: admin.whatsapp,
            instagram: admin.instagram,
            loginMethod: admin.loginMethod,
            registrationStatus: admin.registrationStatus,
            isActive: admin.isActive,
            isSuperAdmin: admin.isSuperAdmin,
            approvedAt: admin.approvedAt,
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
        adminId: admin.adminId,
        fullName: admin.fullName,
        phone: admin.phone,
      },
    }, { status: 400 });

  } catch (error: any) {
    console.error('Admin login error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to process admin login',
    }, { status: 500 });
  }
}
