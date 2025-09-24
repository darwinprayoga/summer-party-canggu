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

    // Find user with this referral code (try both userId and referralCode fields)
    let referrer = await prisma.user.findUnique({
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
        referralCode: true,
      },
    });

    // If not found by userId, try by referralCode field
    if (!referrer) {
      console.log(`🔍 Trying to find by referralCode field: ${referralCode}`);
      referrer = await prisma.user.findFirst({
        where: {
          referralCode: referralCode
        },
        select: {
          id: true,
          userId: true,
          fullName: true,
          instagram: true,
          email: true,
          createdAt: true,
          referralCode: true,
        },
      });
    }

    if (!referrer) {
      console.log(`❌ Invalid referral code: ${referralCode}`);
      return NextResponse.json({
        success: false,
        message: 'Invalid referral code',
      }, { status: 404 });
    }

    console.log(`✅ Valid referral code found: ${referrer.fullName} (@${referrer.instagram}) - userId: ${referrer.userId}, referralCode: ${referrer.referralCode}`);

    return NextResponse.json({
      success: true,
      message: 'Valid referral code',
      data: {
        referrer: {
          id: referrer.id,
          userId: referrer.userId,
          fullName: referrer.fullName,
          instagram: referrer.instagram,
          referralCode: referrer.referralCode,
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