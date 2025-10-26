import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Get all headers for the current user
 * GET /api/property-snap/header
 */
export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in Prisma database
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true }
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = prismaUser.id;

    // Get all headers for this user
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
    console.error('Error fetching headers:', error);
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

