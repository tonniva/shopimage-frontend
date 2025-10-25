import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
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
    const existingReport = await prisma.propertyReport.findFirst({
      where: {
        id: id,
        userId: prismaUser.id
      }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Validate status
    const validStatuses = ['ACTIVE', 'SOLD', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, SOLD, or INACTIVE' },
        { status: 400 }
      );
    }

    // Update status
    const updatedReport = await prisma.propertyReport.update({
      where: { id: id },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Property report status updated: ${updatedReport.id} to ${status}`);

    return NextResponse.json({
      success: true,
      reportId: updatedReport.id,
      status: updatedReport.status,
      message: `Report status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ 
      error: 'Failed to update status',
      details: error.message || 'Unknown error',
      type: error.name || 'Error'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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
    const existingReport = await prisma.propertyReport.findFirst({
      where: {
        id: id,
        userId: prismaUser.id
      }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Delete report
    await prisma.propertyReport.delete({
      where: { id: id }
    });

    console.log(`✅ Property report deleted: ${id} by user: ${prismaUser.email}`);

    return NextResponse.json({
      success: true,
      reportId: id,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ 
      error: 'Failed to delete report',
      details: error.message || 'Unknown error',
      type: error.name || 'Error'
    }, { status: 500 });
  }
}
