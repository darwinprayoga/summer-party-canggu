import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { IDGenerator } from '@/lib/utils/generators'
import { authOptions } from '../../../[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        message: 'Google authentication required'
      }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, instagram, whatsapp } = body

    if (!fullName || !instagram || !whatsapp) {
      return NextResponse.json({
        success: false,
        message: 'Full name, Instagram username, and WhatsApp number are required'
      }, { status: 400 })
    }

    const { email, name, googleId } = session.user

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { instagram: instagram },
          { email: email },
          { googleId: googleId },
          { whatsapp: whatsapp }
        ]
      }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin already exists with this Instagram, email, Google account, or WhatsApp number'
      }, { status: 400 })
    }

    // Generate admin ID
    const adminId = await IDGenerator.generateAdminId()

    // Create admin (pending approval)
    const admin = await prisma.admin.create({
      data: {
        adminId,
        fullName,
        email,
        googleId,
        whatsapp,
        instagram,
        loginMethod: 'GOOGLE',
        registrationStatus: 'PENDING',
        isActive: false,
        isSuperAdmin: false
      }
    })

    // Log admin registration for super admin review
    console.log(`👑 New Google admin registration: ${admin.fullName} (@${admin.instagram}) - ID: ${admin.adminId}`)

    return NextResponse.json({
      success: true,
      message: 'Admin registration submitted successfully. Please wait for super admin approval.',
      data: {
        adminId: admin.adminId,
        fullName: admin.fullName,
        instagram: admin.instagram,
        email: admin.email,
        registrationStatus: admin.registrationStatus,
        isActive: admin.isActive,
        isSuperAdmin: admin.isSuperAdmin
      }
    })

  } catch (error: any) {
    console.error('Google admin registration error:', error)

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to register admin'
    }, { status: 500 })
  }
}