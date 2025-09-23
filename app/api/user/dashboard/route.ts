import { NextRequest, NextResponse } from 'next/server';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get and verify authentication token
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);
    if (payload.role !== 'USER') {
      return NextResponse.json({
        success: false,
        message: 'Invalid user role',
      }, { status: 403 });
    }

    // Get user data with referral statistics and expenses
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        // Users referred by this user
        referrals: {
          select: {
            id: true,
            fullName: true,
            instagram: true,
            createdAt: true,
          },
        },
        // User who referred this user
        referrer: {
          select: {
            id: true,
            fullName: true,
            instagram: true,
            userId: true,
          },
        },
        // User's expenses
        expenses: {
          select: {
            id: true,
            expenseId: true,
            amount: true,
            description: true,
            category: true,
            timestamp: true,
            photoUrl: true,
            staff: {
              select: {
                fullName: true,
                staffId: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    // Calculate expense statistics
    const totalExpenses = user.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = user.expenses.length;

    // Calculate referral statistics and earnings
    const totalReferrals = user.referrals.length;

    // Calculate actual referral earnings based on referrals' expenses
    let referralEarnings = 0;
    if (user.referrals.length > 0) {
      // Get expenses of all users referred by this user
      const referredUsersWithExpenses = await prisma.user.findMany({
        where: {
          referredBy: user.id,
        },
        include: {
          expenses: {
            select: {
              amount: true,
            },
          },
        },
      });

      // Calculate 5% commission on each referral's total expenses
      referralEarnings = referredUsersWithExpenses.reduce((total, referredUser) => {
        const userTotalExpenses = referredUser.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        return total + (userTotalExpenses * 0.05); // 5% commission
      }, 0);
    }

    // Calculate leaderboard - top spenders
    const topSpenders = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        fullName: true,
        instagram: true,
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    // Calculate total expenses for each user and create leaderboard
    const leaderboardData = topSpenders
      .map(user => ({
        id: user.id,
        userId: user.userId,
        username: user.instagram,
        fullName: user.fullName,
        totalExpenses: user.expenses.reduce((sum, expense) => sum + expense.amount, 0),
      }))
      .filter(user => user.totalExpenses > 0) // Only users with expenses
      .sort((a, b) => b.totalExpenses - a.totalExpenses) // Sort by highest expenses first
      .slice(0, 10) // Top 10
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    // Find current user's rank in the leaderboard
    const currentUserRank = leaderboardData.findIndex(entry => entry.id === user.id);
    const currentUserLeaderboardEntry = currentUserRank >= 0 ? leaderboardData[currentUserRank] : null;

    // Generate QR code data (URL for QR code scanner)
    const qrCodeData = `${process.env.NEXTAUTH_URL}/api/user/verify-qr?userId=${user.userId}`;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          instagram: user.instagram,
          referralCode: user.referralCode,
          isRSVP: user.isRSVP,
          rsvpAt: user.rsvpAt,
          createdAt: user.createdAt,
        },
        expenseStats: {
          totalExpenses,
          expenseCount,
          expenses: user.expenses.map(expense => ({
            id: expense.id,
            expenseId: expense.expenseId,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            timestamp: expense.timestamp,
            photoUrl: expense.photoUrl,
            staff: expense.staff ? {
              fullName: expense.staff.fullName,
              staffId: expense.staff.staffId,
            } : null,
          })),
        },
        referralStats: {
          totalReferrals,
          referralEarnings,
          referrals: user.referrals.map(referral => ({
            id: referral.id,
            fullName: referral.fullName,
            instagram: referral.instagram,
            joinedAt: referral.createdAt,
          })),
        },
        referrer: user.referrer ? {
          fullName: user.referrer.fullName,
          instagram: user.referrer.instagram,
          userId: user.referrer.userId,
        } : null,
        leaderboard: {
          topSpenders: leaderboardData.map(entry => ({
            userId: entry.userId,
            username: entry.username,
            fullName: entry.fullName,
            totalExpenses: entry.totalExpenses,
            rank: entry.rank,
          })),
          currentUserRank: currentUserLeaderboardEntry ? currentUserLeaderboardEntry.rank : null,
          currentUserExpenses: totalExpenses,
        },
        qrCode: {
          data: qrCodeData,
          url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`,
        },
      },
    });

  } catch (error: any) {
    console.error('User dashboard error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to load dashboard data',
    }, { status: 500 });
  }
}