import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { JWTService } from '@/lib/auth/jwt';
import { IDGenerator } from '@/lib/utils/generators';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        message: 'Google authentication required',
      }, { status: 401 });
    }

    console.log('🔍 Google OAuth user login attempt:', session.user.name, `(${session.user.email})`);

    // Check if user already exists by email
    const existingUser = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });

    if (existingUser) {
      // User is already registered - direct login regardless of original registration method
      // Generate full authentication token - no additional verification needed
      const authToken = JWTService.signFullToken({
        id: existingUser.id,
        role: 'USER',
        email: existingUser.email || undefined,
        phone: existingUser.phone || undefined,
      });

      console.log('✅ Existing user Google OAuth login - direct access:', existingUser.fullName, `(@${existingUser.instagram}) - ${existingUser.userId}`);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          token: authToken,
          user: {
            id: existingUser.id,
            userId: existingUser.userId,
            fullName: existingUser.fullName,
            instagram: existingUser.instagram,
            email: existingUser.email,
            phone: existingUser.phone,
            whatsapp: existingUser.whatsapp,
            referralCode: existingUser.referralCode,
            role: 'USER',
          },
          isExisting: true,
          requiresPhoneVerification: false,
        },
      });
    }

    // For new users, generate temp token to complete registration
    const tempToken = JWTService.signTempToken({
      id: session.user.email,
      email: session.user.email,
      role: 'USER',
      googleName: session.user.name || undefined,
      googleImage: session.user.image || undefined,
    });

    console.log('📝 New Google OAuth user, temp token generated for:', session.user.name, `(${session.user.email})`);

    return NextResponse.json({
      success: true,
      message: 'Google authentication successful - complete registration',
      data: {
        tempToken,
        googleUser: {
          name: session.user.name || '',
          email: session.user.email,
          image: session.user.image || '',
        },
        isExisting: false,
      },
    });

  } catch (error: any) {
    console.error('Google OAuth user error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Google authentication failed',
    }, { status: 500 });
  }
}