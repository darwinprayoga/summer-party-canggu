import { NextRequest, NextResponse } from 'next/server';
import { createExpenseSchema } from '@/types';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { IDGenerator } from '@/lib/utils/generators';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause: any = {};

    if (payload.role === 'USER') {
      // Users can only see their own expenses
      const user = await prisma.user.findFirst({ where: { id: payload.id } });
      if (user) {
        whereClause.customerId = user.userId;
      } else {
        return NextResponse.json({
          success: false,
          message: 'User not found',
        }, { status: 404 });
      }
    } else if (payload.role === 'STAFF') {
      // Staff can see expenses they created
      const staff = await prisma.staff.findFirst({ where: { id: payload.id } });
      if (staff) {
        whereClause.staffId = payload.id;
      }
    }
    // Admins can see all expenses (no additional where clause)

    // Add search filter
    if (search) {
      whereClause.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerInstagram: { contains: search, mode: 'insensitive' } },
        { customerId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          staff: { select: { fullName: true, staffId: true } },
          user: { select: { fullName: true, userId: true } },
        },
      }),
      prisma.expense.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error('Get expenses error:', error);

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch expenses',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify staff/admin authentication
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);
    if (!['STAFF', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({
        success: false,
        message: 'Staff or Admin access required',
      }, { status: 403 });
    }

    const body = await request.json();
    const expenseData = createExpenseSchema.parse(body);

    // Generate expense ID
    const expenseId = await IDGenerator.generateExpenseId();

    // Find user by customer ID (if exists)
    const user = await prisma.user.findFirst({
      where: { userId: expenseData.customerId },
    });

    // Handle photo URL - limit size and provide fallback
    let photoUrlToSave = null;
    if (expenseData.photoUrl) {
      // Check if base64 string is too large (limit to ~1MB base64 = ~750KB original)
      const maxBase64Size = 1024 * 1024; // 1MB base64
      if (expenseData.photoUrl.length > maxBase64Size) {
        console.warn('Photo too large for database storage, skipping photo');
        // Continue without photo rather than failing
      } else {
        photoUrlToSave = expenseData.photoUrl;
      }
    }

    // Create expense with photo support
    const expense = await prisma.expense.create({
      data: {
        expenseId,
        customerId: expenseData.customerId,
        customerName: expenseData.customerName,
        customerInstagram: expenseData.customerInstagram,
        amount: expenseData.amount,
        description: expenseData.description || "", // Default to empty string if not provided
        category: expenseData.category,
        staffId: payload.id,
        userId: user?.id,
        timestamp: new Date(),
        photoUrl: photoUrlToSave,
      },
      include: {
        staff: { select: { fullName: true, staffId: true } },
        user: { select: { fullName: true, userId: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });

  } catch (error: any) {
    console.error('Create expense error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create expense',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);
    if (!['ADMIN', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required',
      }, { status: 403 });
    }

    // Get expense ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const expenseId = pathParts[pathParts.length - 1];

    if (!expenseId) {
      return NextResponse.json({
        success: false,
        message: 'Expense ID required',
      }, { status: 400 });
    }

    const body = await request.json();
    const { amount, description, category } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Valid amount is required',
      }, { status: 400 });
    }

    // Update expense
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: Number(amount),
        description: description || "",
        category: category || "General",
      },
      include: {
        staff: { select: { fullName: true, staffId: true } },
        user: { select: { fullName: true, userId: true } },
      },
    });

    console.log(`✅ Expense updated by admin: ${expense.expenseId} - IDR ${expense.amount}`);

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });

  } catch (error: any) {
    console.error('Update expense error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'Expense not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update expense',
    }, { status: 500 });
  }
}