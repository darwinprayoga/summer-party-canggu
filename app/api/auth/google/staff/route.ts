import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { JWTService } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({
        success: false,
        message: 'No Google session found'
      }, { status: 401 });
    }

    const email = session.user.email;
    const name = session.user.name || '';

    console.log(`🔍 Google OAuth staff login attempt: ${name} (${email})`);

    // Check if staff already exists with this email
    const existingStaff = await prisma.staff.findFirst({
      where: {
        email: email
      }
    });

    if (existingStaff) {
      // Staff exists, check if approved and active
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

      // Check if this staff uses Google OAuth as their login method
      if (existingStaff.loginMethod === 'GOOGLE') {
        // Direct login for Google OAuth staff - no phone verification needed
        const fullToken = JWTService.signFullToken({
          id: existingStaff.id,
          staffId: existingStaff.staffId,
          email: existingStaff.email || '',
          phone: existingStaff.phone || undefined,
          role: 'STAFF',
        });

        console.log(`✅ Google OAuth staff direct login: ${existingStaff.fullName} (@${existingStaff.instagram}) - ${existingStaff.staffId}`);

        return NextResponse.json({
          success: true,
          message: 'Staff logged in successfully',
          data: {
            token: fullToken,
            staff: {
              id: existingStaff.id,
              staffId: existingStaff.staffId,
              fullName: existingStaff.fullName,
              email: existingStaff.email,
              phone: existingStaff.phone,
              whatsapp: existingStaff.whatsapp,
              instagram: existingStaff.instagram,
              loginMethod: existingStaff.loginMethod,
              registrationStatus: existingStaff.registrationStatus,
              isActive: existingStaff.isActive,
              approvedAt: existingStaff.approvedAt,
            },
            isExisting: true,
            requiresPhoneVerification: false,
          },
        });
      } else {
        // For phone-based staff logging in via Google, require phone verification
        const verificationToken = JWTService.signTempToken({
          id: existingStaff.id,
          email: existingStaff.email || '',
          phone: existingStaff.phone || undefined,
          role: 'STAFF',
          existingStaffId: existingStaff.id,
        });

        console.log(`🔍 Phone-based staff using Google OAuth - phone verification required: ${existingStaff.fullName} (@${existingStaff.instagram}) - ${existingStaff.staffId}`);

        return NextResponse.json({
          success: true,
          message: 'Phone verification required for existing staff',
          data: {
            verificationToken,
            staff: {
              id: existingStaff.id,
              staffId: existingStaff.staffId,
              fullName: existingStaff.fullName,
              email: existingStaff.email,
              phone: existingStaff.phone,
              whatsapp: existingStaff.whatsapp,
              instagram: existingStaff.instagram,
              loginMethod: existingStaff.loginMethod,
              registrationStatus: existingStaff.registrationStatus,
              isActive: existingStaff.isActive,
              approvedAt: existingStaff.approvedAt,
            },
            isExisting: true,
            requiresPhoneVerification: true,
          },
        });
      }
    } else {
      // Staff doesn't exist, needs to register
      console.log(`📝 New Google OAuth staff registration needed: ${name} (${email})`);

      // Create a temp token for registration
      const tempToken = JWTService.signTempToken({
        id: '', // Empty for new registrations
        role: 'STAFF',
        email: email,
      });

      return NextResponse.json({
        success: false,
        message: 'Staff registration required',
        data: {
          requireRegistration: true,
          email: email,
          fullName: name,
          tempToken: tempToken,
        },
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Google staff auth error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to authenticate with Google'
    }, { status: 500 });
  }
}
