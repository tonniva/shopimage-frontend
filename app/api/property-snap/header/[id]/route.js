import { NextResponse } from 'next/server';
import { createServerSupabase, createServerSupabaseAdmin } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Update header settings
 * PATCH /api/property-snap/header/[id]
 */
export async function PATCH(request, { params }) {
  const { id } = await params;
  
  try {
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
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { autoSlide, slideDelay, order } = body;

    // Verify ownership
    const existingHeader = await prisma.propertySnapHeader.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingHeader) {
      return NextResponse.json(
        { error: 'Header not found' },
        { status: 404 }
      );
    }

    if (existingHeader.userId !== prismaUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (autoSlide !== undefined) updateData.autoSlide = autoSlide;
    if (slideDelay !== undefined) updateData.slideDelay = slideDelay;
    if (order !== undefined) updateData.order = order;

    // Update header
    const updatedHeader = await prisma.propertySnapHeader.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      header: updatedHeader
    });

  } catch (error) {
    console.error('Error updating header:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update header',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Delete header
 * DELETE /api/property-snap/header/[id]
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  
  try {
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
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership and get file path
    const existingHeader = await prisma.propertySnapHeader.findUnique({
      where: { id },
      select: { path: true, userId: true }
    });

    if (!existingHeader) {
      return NextResponse.json(
        { error: 'Header not found' },
        { status: 404 }
      );
    }

    // Delete from Supabase storage using admin client
    const adminSupabase = createServerSupabaseAdmin();
    const { error: storageError } = await adminSupabase.storage
      .from('shopimage')
      .remove([existingHeader.path]);

    if (storageError) {
      console.warn('Storage deletion error:', storageError);
    }

    // Delete from database
    await prisma.propertySnapHeader.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Header deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting header:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete header',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

