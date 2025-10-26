import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get headers for share page (public access)
 * GET /api/property-snap/header/share?userId={userId}
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all active headers for this user
    const headers = await prisma.propertySnapHeader.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      headers: headers
    });

  } catch (error) {
    console.error('Error fetching headers for share:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch headers',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

