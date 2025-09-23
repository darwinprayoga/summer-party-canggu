import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { JWTService } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

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

    // Check for admin roles (support multiple role formats)
    const validAdminRoles = ['ADMIN', 'admin', 'super_admin'];
    if (!validAdminRoles.includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    // Get current admin info - try adminId first, then fall back to id
    let currentAdmin;
    if (decoded.adminId) {
      currentAdmin = await prisma.admin.findUnique({
        where: { adminId: decoded.adminId },
        select: {
          id: true,
          adminId: true,
          fullName: true,
          email: true,
          isSuperAdmin: true,
          isActive: true
        }
      });
    } else if (decoded.id) {
      // Fallback: use admin id if adminId not available in token
      currentAdmin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          adminId: true,
          fullName: true,
          email: true,
          isSuperAdmin: true,
          isActive: true
        }
      });
    }

    if (!currentAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found'
      }, { status: 404 })
    }

    // Get dashboard statistics
    const [
      pendingStaff,
      activeStaff,
      pendingAdmins,
      activeAdmins,
      totalExpenses,
      recentExpenses,
      expenseLeaderboard,
      eventConfig
    ] = await Promise.all([
      // Pending staff approvals
      prisma.staff.count({
        where: { registrationStatus: 'PENDING' }
      }),

      // Active staff
      prisma.staff.count({
        where: {
          registrationStatus: 'APPROVED',
          isActive: true
        }
      }),

      // Pending admin approvals
      prisma.admin.count({
        where: { registrationStatus: 'PENDING' }
      }),

      // Active admins
      prisma.admin.count({
        where: {
          registrationStatus: 'APPROVED',
          isActive: true
        }
      }),

      // Total expenses this month
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          timestamp: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Recent expenses (last 10)
      prisma.expense.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          staff: {
            select: {
              fullName: true,
              staffId: true
            }
          },
          user: {
            select: {
              userId: true,
              fullName: true,
              instagram: true
            }
          }
        }
      }),

      // All users with their expenses for leaderboard calculation
      prisma.user.findMany({
        include: {
          _count: {
            select: { expenses: true }
          },
          expenses: {
            select: { amount: true }
          }
        }
      }),

      // Event configuration
      prisma.eventConfig.findFirst({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate leaderboard with totals, sort by total expenses, and take top 10
    const leaderboardWithTotals = expenseLeaderboard
      .map(user => ({
        userId: user.userId,
        username: user.instagram || `User_${user.userId}`,
        totalExpenses: user.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        expenseCount: user._count.expenses,
        fullName: user.fullName
      }))
      .filter(user => user.totalExpenses > 0)
      .sort((a, b) => b.totalExpenses - a.totalExpenses)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        currentAdmin,
        stats: {
          pendingStaff,
          activeStaff,
          pendingAdmins,
          activeAdmins,
          totalExpenses: totalExpenses._sum.amount || 0
        },
        recentExpenses: recentExpenses.map(expense => ({
          id: expense.id,
          expenseId: expense.expenseId,
          userId: expense.userId,
          customerName: expense.user?.fullName || expense.customerName || `Customer ${expense.userId}`,
          customerInstagram: expense.user?.instagram || expense.customerInstagram || `@${expense.userId.toLowerCase()}`,
          amount: expense.amount,
          timestamp: expense.timestamp,
          staffId: expense.staff?.staffId || 'Unknown',
          staffName: expense.staff?.fullName || 'Unknown Staff',
          description: expense.description
        })),
        leaderboard: leaderboardWithTotals,
        eventConfig: eventConfig || {
          name: 'Summer Party Canggu',
          date: '2024-09-27',
          time: '14:00-21:00',
          venue: 'Canggu, Bali',
          description: 'Beach party with amazing vibes',
          maxCapacity: 200,
          currentAttendees: 0
        }
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard data'
    }, { status: 500 })
  }
}
