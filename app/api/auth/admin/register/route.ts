import { NextRequest, NextResponse } from 'next/server';
import { adminRegistrationSchema } from '@/types';
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
    const adminData = adminRegistrationSchema.parse(body);

    // Determine phone number for duplicate checking
    const phoneToCheck = adminData.loginMethod === 'GOOGLE' ? adminData.whatsapp : (adminData.phone || payload.phone);

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { instagram: adminData.instagram },
          { email: adminData.email },
          { phone: phoneToCheck },
        ],
      },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin already exists with this Instagram, email, or phone',
      }, { status: 400 });
    }

    // Generate admin ID
    const adminId = await IDGenerator.generateAdminId();

    // For Google OAuth registration, use WhatsApp number as phone number
    // For phone registration, phone comes from payload (already verified)
    const phoneNumber = adminData.loginMethod === 'GOOGLE' ? adminData.whatsapp : (adminData.phone || payload.phone);

    // Create admin (pending approval)
    const admin = await prisma.admin.create({
      data: {
        adminId,
        fullName: adminData.fullName,
        email: adminData.email,
        phone: phoneNumber,
        whatsapp: adminData.whatsapp,
        instagram: adminData.instagram,
        loginMethod: adminData.loginMethod,
        registrationStatus: 'PENDING',
        isActive: false,
        isSuperAdmin: false,
      },
    });

    // Log admin registration for super admin review
    console.log(`👑 New admin registration: ${admin.fullName} (@${admin.instagram}) - ID: ${admin.adminId}`);

    return NextResponse.json({
      success: true,
      message: 'Admin registration submitted successfully. Please wait for super admin approval.',
      data: {
        adminId: admin.adminId,
        fullName: admin.fullName,
        instagram: admin.instagram,
        registrationStatus: admin.registrationStatus,
      },
    });

  } catch (error: any) {
    console.error('Admin registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to register admin',
    }, { status: 500 });
  }
}