import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get('code');

    if (!referralCode) {
      return NextResponse.json({
        success: false,
        message: 'Referral code is required',
      }, { status: 400 });
    }

    console.log(`🔍 Validating referral code: ${referralCode}`);

    // Find user with this referral code
    const referrer = await prisma.user.findUnique({
      where: {
        userId: referralCode // userId is the referral code (e.g., SP431057)
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        instagram: true,
        email: true,
        createdAt: true,
      },
    });

    if (!referrer) {
      console.log(`❌ Invalid referral code: ${referralCode}`);
      return NextResponse.json({
        success: false,
        message: 'Invalid referral code',
      }, { status: 404 });
    }

    console.log(`✅ Valid referral code found: ${referrer.fullName} (@${referrer.instagram})`);

    return NextResponse.json({
      success: true,
      message: 'Valid referral code',
      data: {
        referrer: {
          userId: referrer.userId,
          fullName: referrer.fullName,
          instagram: referrer.instagram,
          memberSince: referrer.createdAt,
        },
      },
    });

  } catch (error: any) {
    console.error('Referral validation error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to validate referral code',
    }, { status: 500 });
  }
}