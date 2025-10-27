import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/property-snap/admin
 * Get all property reports for admin review
 * 
 * Query params:
 *   - status: Filter by status (PENDING, APPROVED, REJECTED, HIDDEN)
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 */

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
    // TODO: Implement proper admin check based on your database/user roles
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

export async function GET(request) {
  try {
    // Check admin access
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: adminCheck.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get reports
    const [reports, total] = await Promise.all([
      prisma.propertyReport.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.propertyReport.count({ where })
    ]);

    // Get statistics
    const stats = await prisma.propertyReport.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const formattedStats = {
      total: stats.reduce((sum, s) => sum + s._count.status, 0),
      pending: stats.find(s => s.status === 'PENDING')?._count.status || 0,
      approved: stats.find(s => s.status === 'APPROVED')?._count.status || 0,
      rejected: stats.find(s => s.status === 'REJECTED')?._count.status || 0,
      hidden: stats.find(s => s.status === 'HIDDEN')?._count.status || 0
    };

    // Transform reports for frontend
    const transformedReports = reports.map(report => ({
      id: report.id,
      shareToken: report.shareToken,
      title: report.title,
      description: report.description,
      status: report.status,
      rejectionReason: report.rejectionReason,
      reviewedBy: report.reviewedBy,
      reviewedAt: report.reviewedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      viewCount: report.viewCount,
      shareCount: report.shareCount,
      user: report.user,
      location: {
        address: report.address,
        lat: report.locationLat,
        lng: report.locationLng
      }
    }));

    return NextResponse.json({
      success: true,
      reports: transformedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reports',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

