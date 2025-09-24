import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { JWTService } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

// GET - Fetch all pending registrations
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization required'
      }, { status: 401 })
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded;
    try {
      decoded = JWTService.verify(token);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    // Check for admin roles (support multiple role formats)
    const validAdminRoles = ['ADMIN', 'admin', 'super_admin'];
    if (!validAdminRoles.includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    // Get pending staff and admin registrations
    const [pendingStaff, pendingAdmins, activeStaff, activeAdmins] = await Promise.all([
      prisma.staff.findMany({
        where: { registrationStatus: 'PENDING' },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          instagram: true,
          phone: true,
          loginMethod: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.admin.findMany({
        where: { registrationStatus: 'PENDING' },
        select: {
          id: true,
          adminId: true,
          fullName: true,
          email: true,
          instagram: true,
          phone: true,
          loginMethod: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.staff.findMany({
        where: {
          registrationStatus: 'APPROVED',
          isActive: true
        },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          instagram: true,
          phone: true,
          loginMethod: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.admin.findMany({
        where: {
          registrationStatus: 'APPROVED',
          isActive: true
        },
        select: {
          id: true,
          adminId: true,
          fullName: true,
          email: true,
          instagram: true,
          phone: true,
          loginMethod: true,
          isSuperAdmin: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pendingStaff,
        pendingAdmins,
        activeStaff,
        activeAdmins
      }
    });

  } catch (error) {
    console.error('Registrations API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch registrations'
    }, { status: 500 })
  }
}

// POST - Approve or deny registrations
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization required'
      }, { status: 401 })
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded;
    try {
      decoded = JWTService.verify(token);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    // Check for admin roles (support multiple role formats)
    const validAdminRoles = ['ADMIN', 'admin', 'super_admin'];
    if (!validAdminRoles.includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    const body = await request.json();
    const { type, id, action } = body; // type: 'staff' | 'admin', action: 'approve' | 'deny'

    if (!type || !id || !action) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: type, id, action'
      }, { status: 400 })
    }

    if (!['staff', 'admin'].includes(type) || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid type or action'
      }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'DENIED';
    const isActive = action === 'approve';

    if (type === 'staff') {
      await prisma.staff.update({
        where: { id },
        data: {
          registrationStatus: newStatus,
          isActive,
          approvedAt: action === 'approve' ? new Date() : null
        }
      });
    } else {
      await prisma.admin.update({
        where: { id },
        data: {
          registrationStatus: newStatus,
          isActive,
          approvedAt: action === 'approve' ? new Date() : null
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${type} registration ${action}d successfully`
    });

  } catch (error) {
    console.error('Registration update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update registration'
    }, { status: 500 })
  }
}
