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

    // Check for staff role
    if (decoded.role !== 'STAFF') {
      return NextResponse.json({
        success: false,
        message: 'Staff access required'
      }, { status: 403 })
    }

    // Get current staff info - try staffId first, then fall back to id
    let currentStaff;
    if (decoded.staffId) {
      currentStaff = await prisma.staff.findUnique({
        where: { staffId: decoded.staffId },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          phone: true,
          // whatsapp: true,
          instagram: true,
          isActive: true,
          approvedAt: true
        }
      });
    } else if (decoded.id) {
      // Fallback: use staff id if staffId not available in token
      currentStaff = await prisma.staff.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          staffId: true,
          fullName: true,
          email: true,
          phone: true,
          // whatsapp: true,
          instagram: true,
          isActive: true,
          approvedAt: true
        }
      });
    }

    if (!currentStaff) {
      return NextResponse.json({
        success: false,
        message: 'Staff not found'
      }, { status: 404 })
    }

    // Get staff dashboard statistics
    const [
      totalExpensesToday,
      totalExpensesThisWeek,
      recentExpenses,
      expenseStats
    ] = await Promise.all([
      // Total expenses created today by this staff
      prisma.expense.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          staffId: currentStaff.id,
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Total expenses created this week by this staff
      prisma.expense.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          staffId: currentStaff.id,
          timestamp: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      }),

      // Recent expenses created by this staff (last 10)
      prisma.expense.findMany({
        take: 10,
        where: {
          staffId: currentStaff.id
        },
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              userId: true,
              fullName: true,
              instagram: true
            }
          }
        }
      }),

      // Overall expense statistics for this staff
      prisma.expense.groupBy({
        by: ['staffId'],
        where: {
          staffId: currentStaff.id
        },
        _sum: {
          amount: true
        },
        _count: true
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        currentStaff,
        stats: {
          today: {
            totalAmount: totalExpensesToday._sum.amount || 0,
            totalCount: totalExpensesToday._count || 0
          },
          week: {
            totalAmount: totalExpensesThisWeek._sum.amount || 0,
            totalCount: totalExpensesThisWeek._count || 0
          },
          allTime: {
            totalAmount: expenseStats[0]?._sum.amount || 0,
            totalCount: expenseStats[0]?._count || 0
          }
        },
        recentExpenses: recentExpenses.map(expense => ({
          id: expense.id,
          userId: expense.userId,
          customerName: expense.user?.fullName || 'Unknown',
          customerInstagram: expense.user?.instagram || 'Unknown',
          amount: expense.amount,
          timestamp: expense.timestamp,
          description: 'Equipment rental' // Could be expanded later
        }))
      }
    });

  } catch (error) {
    console.error('Staff dashboard API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch staff dashboard data'
    }, { status: 500 })
  }
}