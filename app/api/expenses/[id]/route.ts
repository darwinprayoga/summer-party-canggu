import { NextRequest, NextResponse } from 'next/server';
import { updateExpenseSchema } from '@/types';
import { JWTService, extractTokenFromHeader } from '@/lib/auth/jwt';
import { prisma } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!['STAFF', 'ADMIN', 'staff', 'admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({
        success: false,
        message: 'Staff or Admin access required',
      }, { status: 403 });
    }

    const expenseId = params.id;

    // Find the expense first
    const existingExpense = await prisma.expense.findFirst({
      where: { expenseId },
      include: {
        staff: { select: { id: true, fullName: true, staffId: true } },
        user: { select: { fullName: true, userId: true } },
      },
    });

    if (!existingExpense) {
      return NextResponse.json({
        success: false,
        message: 'Expense not found',
      }, { status: 404 });
    }

    // Check if user has permission to edit this expense
    if (['STAFF', 'staff'].includes(payload.role) && existingExpense.staffId !== payload.id) {
      return NextResponse.json({
        success: false,
        message: 'You can only edit expenses you created',
      }, { status: 403 });
    }

    const body = await request.json();
    const updateData = updateExpenseSchema.parse(body);

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { expenseId },
      data: {
        ...updateData,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        staff: { select: { fullName: true, staffId: true } },
        user: { select: { fullName: true, userId: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });

  } catch (error: any) {
    console.error('Update expense error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update expense',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication (only admins can delete expenses)
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required',
      }, { status: 401 });
    }

    const payload = JWTService.verify(token);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required to delete expenses',
      }, { status: 403 });
    }

    const expenseId = params.id;

    // Find the expense first
    const existingExpense = await prisma.expense.findFirst({
      where: { expenseId },
    });

    if (!existingExpense) {
      return NextResponse.json({
        success: false,
        message: 'Expense not found',
      }, { status: 404 });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { expenseId },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete expense error:', error);

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete expense',
    }, { status: 500 });
  }
}