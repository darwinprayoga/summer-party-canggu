import { NextRequest, NextResponse } from 'next/server';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const approveAdminSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
  action: z.enum(['approve', 'deny'], { required_error: 'Action must be approve or deny' }),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get and verify admin token
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);
    if (payload.type !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required',
      }, { status: 403 });
    }

    // Get the current admin
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: payload.id },
    });

    if (!currentAdmin || !currentAdmin.isActive || currentAdmin.registrationStatus !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        message: 'Admin access denied',
      }, { status: 403 });
    }

    // Only super admins can approve/deny other admins
    if (!currentAdmin.isSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Super admin access required to approve admins',
      }, { status: 403 });
    }

    const body = await request.json();
    const { adminId, action, reason } = approveAdminSchema.parse(body);

    // Find the admin to approve/deny
    const targetAdmin = await prisma.admin.findUnique({
      where: { adminId },
    });

    if (!targetAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found',
      }, { status: 404 });
    }

    if (targetAdmin.registrationStatus !== 'PENDING') {
      return NextResponse.json({
        success: false,
        message: `Admin registration is already ${targetAdmin.registrationStatus.toLowerCase()}`,
      }, { status: 400 });
    }

    // Prevent super admin from approving themselves (should be done via seeder)
    if (targetAdmin.id === currentAdmin.id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot approve your own registration',
      }, { status: 400 });
    }

    // Update admin status
    const updatedAdmin = await prisma.admin.update({
      where: { id: targetAdmin.id },
      data: {
        registrationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        isActive: action === 'approve',
        approvedAt: action === 'approve' ? new Date() : null,
        approvedBy: currentAdmin.adminId,
      },
    });

    // TODO: Send email notification when email service is implemented

    console.log(`👑 Admin ${action}: ${targetAdmin.fullName} (@${targetAdmin.instagram}) by ${currentAdmin.fullName}`);

    return NextResponse.json({
      success: true,
      message: `Admin registration ${action}d successfully`,
      data: {
        adminId: updatedAdmin.adminId,
        fullName: updatedAdmin.fullName,
        instagram: updatedAdmin.instagram,
        registrationStatus: updatedAdmin.registrationStatus,
        approvedAt: updatedAdmin.approvedAt,
        approvedBy: currentAdmin.adminId,
      },
    });

  } catch (error: any) {
    console.error('Admin approval error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to process admin approval',
    }, { status: 500 });
  }
}