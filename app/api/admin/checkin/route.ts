import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { JWTService } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization required'
      }, { status: 401 })
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded;
    try {
      decoded = JWTService.verify(token);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    // Check for admin roles
    const validAdminRoles = ['ADMIN', 'admin', 'super_admin'];
    if (!validAdminRoles.includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    // Get request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        userId: true,
        fullName: true,
        instagram: true,
        isRSVP: true,
        isCheckedIn: true,
        checkedInAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Check if user has RSVP'd
    if (!user.isRSVP) {
      return NextResponse.json({
        success: false,
        message: 'User has not RSVP\'d for the event'
      }, { status: 400 })
    }

    // Check if already checked in
    if (user.isCheckedIn) {
      return NextResponse.json({
        success: false,
        message: 'User is already checked in',
        data: {
          userId: user.userId,
          fullName: user.fullName,
          instagram: user.instagram,
          checkedInAt: user.checkedInAt
        }
      }, { status: 400 })
    }

    // Update user check-in status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date()
      },
      select: {
        userId: true,
        fullName: true,
        instagram: true,
        isCheckedIn: true,
        checkedInAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User checked in successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Checkin API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check in user'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve checked-in users
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization required'
      }, { status: 401 })
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded;
    try {
      decoded = JWTService.verify(token);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    // Check for admin roles
    const validAdminRoles = ['ADMIN', 'admin', 'super_admin'];
    if (!validAdminRoles.includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    // Get query parameters for pagination and search
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = search ? {
      AND: [
        { isCheckedIn: true },
        {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { instagram: { contains: search, mode: 'insensitive' } },
            { userId: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    } : { isCheckedIn: true };

    // Get paginated checked-in users
    const [checkedInUsers, totalCheckedInUsers] = await Promise.all([
      prisma.user.findMany({
        where: searchConditions,
        select: {
          userId: true,
          fullName: true,
          instagram: true,
          isCheckedIn: true,
          checkedInAt: true
        },
        orderBy: { checkedInAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({
        where: searchConditions
      })
    ]);

    // Get total stats (always include all users, not filtered by search)
    const totalRSVP = await prisma.user.count({
      where: { isRSVP: true }
    });

    const totalCheckedIn = await prisma.user.count({
      where: { isCheckedIn: true }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCheckedInUsers / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        checkedInUsers,
        stats: {
          totalRSVP,
          totalCheckedIn,
          checkInRate: totalRSVP > 0 ? ((totalCheckedIn / totalRSVP) * 100).toFixed(1) : 0
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: totalCheckedInUsers,
          hasNext,
          hasPrev
        }
      }
    });

  } catch (error) {
    console.error('Get checked-in users API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch checked-in users'
    }, { status: 500 })
  }
}