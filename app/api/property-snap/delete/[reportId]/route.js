import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const { reportId } = await params;

    // Check Authentication
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in Prisma database
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if report exists and belongs to user
    const report = await prisma.propertyReport.findFirst({
      where: {
        id: reportId,
        userId: prismaUser.id
      },
      select: {
        id: true,
        userImages: true
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // TODO: Delete images from Supabase Storage if they exist
    // For now, just delete the report from database
    await prisma.propertyReport.delete({
      where: {
        id: reportId,
        userId: prismaUser.id
      }
    });

    console.log(`✅ Property report deleted: ${reportId} by user: ${prismaUser.email}`);

    return NextResponse.json({ 
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/property-snap/delete/[reportId]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
