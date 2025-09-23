import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required',
      }, { status: 400 });
    }

    console.log(`🔍 Verifying QR code for user ID: ${userId}`);

    // Find user with this userId
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        instagram: true,
        email: true,
        phone: true,
        whatsapp: true,
        isRSVP: true,
        rsvpAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ Invalid user ID: ${userId}`);
      return NextResponse.json({
        success: false,
        message: 'Invalid ticket - user not found',
      }, { status: 404 });
    }

    if (!user.isRSVP) {
      console.log(`❌ User ${userId} has not RSVP'd`);
      return NextResponse.json({
        success: false,
        message: 'Invalid ticket - user has not RSVP\'d',
      }, { status: 400 });
    }

    console.log(`✅ Valid ticket verified for: ${user.fullName} (@${user.instagram}) - ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Valid ticket verified',
      data: {
        user: {
          userId: user.userId,
          fullName: user.fullName,
          instagram: user.instagram,
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          rsvpAt: user.rsvpAt,
          memberSince: user.createdAt,
        },
      },
    });

  } catch (error: any) {
    console.error('QR verification error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to verify QR code',
    }, { status: 500 });
  }
}