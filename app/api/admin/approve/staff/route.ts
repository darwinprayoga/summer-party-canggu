import { NextRequest, NextResponse } from 'next/server';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const approveStaffSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
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

    const body = await request.json();
    const { staffId, action, reason } = approveStaffSchema.parse(body);

    // Find the staff to approve/deny
    const targetStaff = await prisma.staff.findUnique({
      where: { staffId },
    });

    if (!targetStaff) {
      return NextResponse.json({
        success: false,
        message: 'Staff not found',
      }, { status: 404 });
    }

    if (targetStaff.registrationStatus !== 'PENDING') {
      return NextResponse.json({
        success: false,
        message: `Staff registration is already ${targetStaff.registrationStatus.toLowerCase()}`,
      }, { status: 400 });
    }

    // Update staff status
    const updatedStaff = await prisma.staff.update({
      where: { id: targetStaff.id },
      data: {
        registrationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        isActive: action === 'approve',
        approvedAt: action === 'approve' ? new Date() : null,
        approvedBy: currentAdmin.id,
      },
    });

    // TODO: Send email notification when email service is implemented

    console.log(`📝 Staff ${action}: ${targetStaff.fullName} (@${targetStaff.instagram}) by ${currentAdmin.fullName}`);

    return NextResponse.json({
      success: true,
      message: `Staff registration ${action}d successfully`,
      data: {
        staffId: updatedStaff.staffId,
        fullName: updatedStaff.fullName,
        instagram: updatedStaff.instagram,
        registrationStatus: updatedStaff.registrationStatus,
        approvedAt: updatedStaff.approvedAt,
        approvedBy: currentAdmin.adminId,
      },
    });

  } catch (error: any) {
    console.error('Staff approval error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to process staff approval',
    }, { status: 500 });
  }
}