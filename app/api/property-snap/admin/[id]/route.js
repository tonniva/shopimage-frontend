import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Admin API routes for managing property reports
 * 
 * PATCH /api/property-snap/admin/[id]
 *   - Approve: { action: "approve" }
 *   - Reject: { action: "reject", reason: "..." }
 *   - Hide/Show: { action: "toggle_visibility" }
 * 
 * DELETE /api/property-snap/admin/[id]
 *   - Delete report permanently
 */

// Helper function to check if user is admin
async function checkAdmin() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return { isAdmin: false, error: 'Unauthorized - Please login first' };
    }

    console.log('✅ User logged in:', user.email);
    
    // For development: Allow all logged-in users to access admin
    // In production, implement proper admin role check
    const isAdmin = true; // Temporarily allow all logged-in users
    
    if (!isAdmin) {
      console.log('❌ User is not admin:', user.email);
      return { isAdmin: false, error: 'Forbidden: Admin access required' };
    }

    console.log('✅ Admin check passed for:', user.email);
    return { isAdmin: true, user };
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return { isAdmin: false, error: error.message };
  }
}

/**
 * PATCH - Update report status (approve/reject/hide)
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    // Check admin access
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: adminCheck.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { action, reason } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Get current report
    const report = await prisma.propertyReport.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    let updateData = {};

    switch (action) {
      case 'approve':
        updateData = {
          status: 'APPROVED',
          reviewedBy: adminCheck.user.email,
          reviewedAt: new Date(),
          rejectionReason: null
        };
        break;

      case 'reject':
        if (!reason) {
          return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        }
        updateData = {
          status: 'REJECTED',
          rejectionReason: reason,
          reviewedBy: adminCheck.user.email,
          reviewedAt: new Date()
        };
        break;

      case 'hide':
        updateData = {
          status: 'HIDDEN',
          reviewedBy: adminCheck.user.email,
          reviewedAt: new Date()
        };
        break;

      case 'unhide':
        updateData = {
          status: 'APPROVED',
          reviewedBy: adminCheck.user.email,
          reviewedAt: new Date()
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update report
    const updatedReport = await prisma.propertyReport.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `Report ${action}ed successfully`,
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete report permanently
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check admin access
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: adminCheck.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    // Check if report exists
    const report = await prisma.propertyReport.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete report
    await prisma.propertyReport.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

