import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
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

    // Try to verify the token (even if expired, we can check if it's valid structure)
    let decoded;
    try {
      decoded = JWTService.verify(token) as any;
    } catch (jwtError: any) {
      // If token is expired but valid structure, we can refresh it
      if (jwtError.message === 'Token expired') {
        try {
          // Decode without verification to get payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          decoded = payload;
        } catch (decodeError) {
          return NextResponse.json({
            success: false,
            message: 'Invalid token format'
          }, { status: 401 });
        }
      } else {
        return NextResponse.json({
          success: false,
          message: 'Invalid token'
        }, { status: 401 });
      }
    }

    // Check if this is a staff token (standardized case checking)
    const validStaffRoles = ['STAFF', 'staff'];
    if (!validStaffRoles.includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Staff token required'
      }, { status: 403 });
    }

    // If we have a staffId, look up the staff member
    let staff = null;
    if (decoded.staffId) {
      staff = await prisma.staff.findUnique({
        where: { staffId: decoded.staffId },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          phone: true,
          // whatsapp: true,
          instagram: true,
          registrationStatus: true,
          isActive: true,
          approvedAt: true,
          loginMethod: true
        }
      });
    }

    // If we have a phone number but no staff record, look up by phone
    if (!staff && decoded.phone) {
      staff = await prisma.staff.findFirst({
        where: { phone: decoded.phone },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          phone: true,
          // whatsapp: true,
          instagram: true,
          registrationStatus: true,
          isActive: true,
          approvedAt: true,
          loginMethod: true
        }
      });
    }

    // Issue a new full token
    let newTokenPayload: any;

    if (staff) {
      // Staff has a profile, issue full staff token
      newTokenPayload = {
        id: staff.id,
        staffId: staff.staffId,
        phone: staff.phone,
        role: 'STAFF',
        type: 'full'
      };
    } else {
      // No staff profile yet, issue temp token for registration
      newTokenPayload = {
        id: decoded.phone || decoded.id,
        phone: decoded.phone,
        role: 'STAFF',
        type: 'temp'
      };
    }

    const newToken = JWTService.signFullToken(newTokenPayload);

    console.log(`🔄 Token refreshed for: ${staff ? staff.fullName : decoded.phone}`);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        staff: staff || null,
        hasProfile: !!staff
      }
    });

  } catch (error) {
    console.error('Staff token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to refresh token'
    }, { status: 500 });
  }
}