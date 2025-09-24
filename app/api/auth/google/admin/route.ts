import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { authOptions } from '../../[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {

    const session = await getServerSession(authOptions);


    if (!session?.user?.email) {

      return NextResponse.json({
        success: false,
        message: 'Google authentication required'
      }, { status: 401 })
    }

    const { email, name, googleId } = session.user


    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: email },
          { googleId: googleId }
        ]
      }
    })

    console.log('Found existing admin:', existingAdmin ? {
      id: existingAdmin.id,
      email: existingAdmin.email,
      googleId: existingAdmin.googleId,
      registrationStatus: existingAdmin.registrationStatus,
      isActive: existingAdmin.isActive
    } : null);

    if (existingAdmin) {
      // Admin exists, check if approved and active
      if (existingAdmin.registrationStatus === 'APPROVED' && existingAdmin.isActive) {
        // Generate JWT token
        const token = jwt.sign(
          {
            adminId: existingAdmin.adminId,
            email: existingAdmin.email,
            role: 'ADMIN',
            isSuperAdmin: existingAdmin.isSuperAdmin
          },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        )

        return NextResponse.json({
          success: true,
          message: 'Admin login successful',
          data: {
            token,
            admin: {
              id: existingAdmin.id,
              adminId: existingAdmin.adminId,
              fullName: existingAdmin.fullName,
              email: existingAdmin.email,
              instagram: existingAdmin.instagram,
              phone: existingAdmin.phone,
              registrationStatus: existingAdmin.registrationStatus,
              isActive: existingAdmin.isActive,
              isSuperAdmin: existingAdmin.isSuperAdmin
            }
          }
        })
      } else {
        // Admin exists but not approved/active
        return NextResponse.json({
          success: true,
          message: 'Admin account pending approval',
          data: {
            admin: {
              id: existingAdmin.id,
              adminId: existingAdmin.adminId,
              fullName: existingAdmin.fullName,
              email: existingAdmin.email,
              instagram: existingAdmin.instagram,
              phone: existingAdmin.phone,
              registrationStatus: existingAdmin.registrationStatus,
              isActive: existingAdmin.isActive,
              isSuperAdmin: existingAdmin.isSuperAdmin
            }
          }
        })
      }
    } else {
      // Admin doesn't exist, need to register
      return NextResponse.json({
        success: false,
        message: 'Admin not found. Please complete registration.',
        data: {
          requiresRegistration: true,
          googleUser: {
            email,
            name,
            googleId
          }
        }
      })
    }

  } catch (error) {
    console.error('Google admin auth error:', error)
    return NextResponse.json({
      success: false,
      message: 'Authentication failed'
    }, { status: 500 })
  }
}
