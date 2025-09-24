import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { normalizePhoneNumber } from '@/lib/utils/phone';

const userValidationSchema = z.object({
  instagram: z.string().min(1, 'Instagram handle is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram, email, phone } = userValidationSchema.parse(body);

    // Normalize the input phone number
    const normalizedInputPhone = normalizePhoneNumber(phone);
    console.log(`🔍 Phone validation: input "${phone}" normalized to "${normalizedInputPhone}"`);

    // Get all users to check for conflicts with normalization
    const allUsers = await prisma.user.findMany({
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
    const directConflict = allUsers.find(user =>
      user.instagram === instagram || user.email === email
    );

    if (directConflict) {
      let conflictField = '';
      if (directConflict.instagram === instagram) conflictField = 'Instagram handle';
      else if (directConflict.email === email) conflictField = 'Email';

      return NextResponse.json({
        success: false,
        message: `User already exists with this ${conflictField}`,
        data: {
          conflictField: conflictField.toLowerCase().replace(' ', '_'),
        }
      }, { status: 400 });
    }

    // Check for phone conflicts with normalization
    const allUsersWithPhones = await prisma.user.findMany({
      where: {
        phone: { not: null }
      },
      select: {
        phone: true,
      }
    });

    const phoneConflict = allUsersWithPhones.find(user => {
      const normalizedDbPhone = user.phone ? normalizePhoneNumber(user.phone) : null;

      console.log(`🔍 Comparing "${normalizedInputPhone}" with DB phone "${user.phone}" (normalized: "${normalizedDbPhone}")`);

      return normalizedDbPhone === normalizedInputPhone;
    });

    if (phoneConflict) {
      return NextResponse.json({
        success: false,
        message: `User already exists with this phone number`,
        data: {
          conflictField: 'phone_number',
        }
      }, { status: 400 });
    }

    // No conflicts found
    return NextResponse.json({
      success: true,
      message: 'Validation passed - user data is available',
    });

  } catch (error: any) {
    console.error('User validation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to validate user data',
    }, { status: 500 });
  }
}