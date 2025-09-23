import { NextRequest, NextResponse } from 'next/server';
import { staffRegistrationSchema } from '@/types';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { IDGenerator } from '@/lib/utils/generators';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Get and verify temp token
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);
    if (payload.type !== 'temp') {
      return NextResponse.json({
        success: false,
        message: 'Invalid token type',
      }, { status: 401 });
    }

    const body = await request.json();
    const staffData = staffRegistrationSchema.parse(body);

    // Check if staff already exists
    const existingStaff = await prisma.staff.findFirst({
      where: {
        OR: [
          { instagram: staffData.instagram },
          { email: staffData.email },
          { phone: staffData.phone || payload.phone },
        ],
      },
    });

    if (existingStaff) {
      return NextResponse.json({
        success: false,
        message: 'Staff already exists with this Instagram, email, or phone',
      }, { status: 400 });
    }

    // Generate staff ID
    const staffId = await IDGenerator.generateStaffId();

    // Create staff (pending approval)
    const staff = await prisma.staff.create({
      data: {
        staffId,
        fullName: staffData.fullName,
        email: staffData.email,
        phone: staffData.phone || payload.phone,
        whatsapp: staffData.whatsapp,
        instagram: staffData.instagram,
        loginMethod: staffData.loginMethod,
        registrationStatus: 'PENDING',
        isActive: false,
      },
    });

    // Log staff registration for admin review
    console.log(`📝 New staff registration: ${staff.fullName} (@${staff.instagram}) - ID: ${staff.staffId}`);

    return NextResponse.json({
      success: true,
      message: 'Staff registration submitted successfully. Please wait for admin approval.',
      data: {
        staffId: staff.staffId,
        fullName: staff.fullName,
        instagram: staff.instagram,
        registrationStatus: staff.registrationStatus,
      },
    });

  } catch (error: any) {
    console.error('Staff registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to register staff',
    }, { status: 500 });
  }
}