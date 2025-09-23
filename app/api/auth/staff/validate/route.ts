import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { normalizePhoneNumber } from '@/lib/utils/phone';

const staffValidationSchema = z.object({
  instagram: z.string().min(1, 'Instagram handle is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram, email, phone } = staffValidationSchema.parse(body);

    // Normalize the input phone number
    const normalizedInputPhone = normalizePhoneNumber(phone);
    console.log(`🔍 Phone validation: input "${phone}" normalized to "${normalizedInputPhone}"`);

    // Get all staff to check for phone conflicts with normalization
    const allStaff = await prisma.staff.findMany({
      where: {
        OR: [
          { instagram: instagram },
          { email: email },
        ],
      },
      select: {
        instagram: true,
        email: true,
        phone: true,
      }
    });

    // Check for direct Instagram/email conflicts
    const directConflict = allStaff.find(staff =>
      staff.instagram === instagram || staff.email === email
    );

    if (directConflict) {
      let conflictField = '';
      if (directConflict.instagram === instagram) conflictField = 'Instagram handle';
      else if (directConflict.email === email) conflictField = 'Email';

      return NextResponse.json({
        success: false,
        message: `Staff already exists with this ${conflictField}`,
        data: {
          conflictField: conflictField.toLowerCase().replace(' ', '_'),
        }
      }, { status: 400 });
    }

    // Check for phone conflicts with normalization
    const allStaffWithPhones = await prisma.staff.findMany({
      where: {
        phone: { not: null }
      },
      select: {
        phone: true,
      }
    });

    const phoneConflict = allStaffWithPhones.find(staff => {
      if (!staff.phone) return false;
      const normalizedDbPhone = normalizePhoneNumber(staff.phone);
      console.log(`🔍 Comparing "${normalizedInputPhone}" with DB phone "${staff.phone}" (normalized: "${normalizedDbPhone}")`);
      return normalizedDbPhone === normalizedInputPhone;
    });

    if (phoneConflict) {
      return NextResponse.json({
        success: false,
        message: `Staff already exists with this Phone number`,
        data: {
          conflictField: 'phone_number',
        }
      }, { status: 400 });
    }

    // No conflicts found
    return NextResponse.json({
      success: true,
      message: 'Validation passed - staff data is available',
    });

  } catch (error: any) {
    console.error('Staff validation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to validate staff data',
    }, { status: 500 });
  }
}