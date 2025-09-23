import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { IDGenerator } from '@/lib/utils/generators'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

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

    // Check if staff already exists
    const existingStaff = await prisma.staff.findFirst({
      where: {
        OR: [
          { instagram: instagram },
          { email: email },
          { googleId: googleId },
          { whatsapp: whatsapp }
        ]
      }
    })

    if (existingStaff) {
      return NextResponse.json({
        success: false,
        message: 'Staff already exists with this Instagram, email, Google account, or WhatsApp number'
      }, { status: 400 })
    }

    // Generate staff ID
    const staffId = await IDGenerator.generateStaffId()

    // Create staff (pending approval)
    const staff = await prisma.staff.create({
      data: {
        staffId,
        fullName,
        email,
        googleId,
        whatsapp,
        instagram,
        loginMethod: 'GOOGLE',
        registrationStatus: 'PENDING',
        isActive: false
      }
    })

    // Log staff registration for admin review
    console.log(`👥 New Google staff registration: ${staff.fullName} (@${staff.instagram}) - ID: ${staff.staffId}`)

    return NextResponse.json({
      success: true,
      message: 'Staff registration submitted successfully. Please wait for admin approval.',
      data: {
        staffId: staff.staffId,
        fullName: staff.fullName,
        instagram: staff.instagram,
        email: staff.email,
        registrationStatus: staff.registrationStatus,
        isActive: staff.isActive
      }
    })

  } catch (error: any) {
    console.error('Google staff registration error:', error)

    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to register staff'
    }, { status: 500 })
  }
}