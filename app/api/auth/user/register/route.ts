import { NextRequest, NextResponse } from 'next/server';
import { userRegistrationSchema } from '@/types';
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
    const userData = userRegistrationSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { instagram: userData.instagram },
          { email: userData.email },
          { phone: userData.phone || payload.phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this Instagram, email, or phone',
      }, { status: 400 });
    }

    // Generate user ID and referral code
    const userId = await IDGenerator.generateUserId();
    const referralCode = IDGenerator.generateReferralCode(userData.instagram);

    // Handle referral
    let referredBy = null;
    if (userData.referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { userId: userData.referralCode }, // referralCode is actually the referrer's userId
      });
      if (referrer) {
        referredBy = referrer.id;
        console.log(`✅ Referral link from ${referrer.fullName} (@${referrer.instagram}) - ${referrer.userId}`);
      } else {
        console.log(`❌ Invalid referral code: ${userData.referralCode}`);
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        userId,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || payload.phone,
        whatsapp: userData.whatsapp,
        instagram: userData.instagram,
        loginMethod: userData.loginMethod,
        referralCode,
        referredBy,
        isRSVP: true,
        rsvpAt: new Date(),
      },
    });

    // Generate full authentication token
    const authToken = JWTService.signFullToken({
      id: user.id,
      role: 'USER',
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        token: authToken,
        user: {
          id: user.id,
          userId: user.userId,
          fullName: user.fullName,
          instagram: user.instagram,
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          referralCode: user.referralCode,
          role: 'USER',
        },
      },
    });

  } catch (error: any) {
    console.error('User registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to register user',
    }, { status: 500 });
  }
}