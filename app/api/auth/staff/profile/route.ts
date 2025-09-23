import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify JWT token (could be temp token from OTP verification)
    let decoded;
    try {
      decoded = JWTService.verify(token);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    // Check if this is a staff token (from staff login) or temp token (from OTP verification)
    let existingStaff;

    if (decoded.role === 'STAFF' && decoded.id) {
      // This is a staff login token - use staff ID to find profile
      existingStaff = await prisma.staff.findUnique({
        where: {
          id: decoded.id
        },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          phone: true,
          whatsapp: true,
          instagram: true,
          registrationStatus: true,
          isActive: true,
          approvedAt: true,
          loginMethod: true
        }
      });
    } else if (decoded.phone) {
      // This is a temp token from OTP verification - use phone number
      existingStaff = await prisma.staff.findFirst({
        where: {
          phone: decoded.phone
        },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          phone: true,
          whatsapp: true,
          instagram: true,
          registrationStatus: true,
          isActive: true,
          approvedAt: true,
          loginMethod: true
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid token format'
      }, { status: 400 });
    }

    if (existingStaff) {
      return NextResponse.json({
        success: true,
        data: existingStaff
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No staff profile found'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Staff profile API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch staff profile'
    }, { status: 500 });
  }
}