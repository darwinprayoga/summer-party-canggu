import { NextRequest, NextResponse } from 'next/server';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    let tokenPayload;
    try {
      tokenPayload = JWTService.verify(token);
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error.message || 'Invalid token',
      }, { status: 401 });
    }

    // Verify this is a user token
    if (tokenPayload.role !== 'USER') {
      return NextResponse.json({
        success: false,
        message: 'Invalid token role',
      }, { status: 403 });
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.id },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        phone: true,
        instagram: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error: any) {
    console.error('User profile error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to get user profile',
    }, { status: 500 });
  }
}