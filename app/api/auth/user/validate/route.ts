import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { normalizePhoneNumber } from '@/lib/utils/phone';

const userValidationSchema = z.object({
  instagram: z.string().min(1, 'Instagram handle is required'),
  email: z.string().email('Valid email is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram, email, whatsapp } = userValidationSchema.parse(body);

    // Normalize the input WhatsApp number
    const normalizedInputWhatsapp = normalizePhoneNumber(whatsapp);
    console.log(`🔍 WhatsApp validation: input "${whatsapp}" normalized to "${normalizedInputWhatsapp}"`);

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
        whatsapp: true,
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

    // Check for WhatsApp/phone conflicts with normalization
    const allUsersWithPhones = await prisma.user.findMany({
      where: {
        OR: [
          { whatsapp: { not: null } },
          { phone: { not: null } }
        ]
      },
      select: {
        whatsapp: true,
        phone: true,
      }
    });

    const phoneConflict = allUsersWithPhones.find(user => {
      const normalizedDbWhatsapp = user.whatsapp ? normalizePhoneNumber(user.whatsapp) : null;
      const normalizedDbPhone = user.phone ? normalizePhoneNumber(user.phone) : null;

      console.log(`🔍 Comparing "${normalizedInputWhatsapp}" with DB whatsapp "${user.whatsapp}" (normalized: "${normalizedDbWhatsapp}") and phone "${user.phone}" (normalized: "${normalizedDbPhone}")`);

      return normalizedDbWhatsapp === normalizedInputWhatsapp ||
             normalizedDbPhone === normalizedInputWhatsapp;
    });

    if (phoneConflict) {
      return NextResponse.json({
        success: false,
        message: `User already exists with this WhatsApp number`,
        data: {
          conflictField: 'whatsapp_number',
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