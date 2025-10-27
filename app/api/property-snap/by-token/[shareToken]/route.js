import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/property-snap/by-token/[shareToken]
 * Get a property report by shareToken (for owner to view status even if not approved)
 * This route checks if the current user is the owner of the report
 */

export async function GET(request, { params }) {
  try {
    const { shareToken } = await params;
    
    // Check authentication
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch report from database (without status restriction)
    const report = await prisma.propertyReport.findUnique({
      where: {
        shareToken: shareToken
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if the current user is the owner
    if (report.userId !== prismaUser.id) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: 'You can only view your own reports' 
      }, { status: 403 });
    }

    // Transform data for frontend
    const transformedReport = {
      id: report.id,
      shareToken: report.shareToken,
      title: report.title,
      description: report.description,
      status: report.status,
      rejectionReason: report.rejectionReason,
      reviewedBy: report.reviewedBy,
      reviewedAt: report.reviewedAt,
      // New property fields
      propertyType: report.propertyType,
      listingType: report.listingType,
      price: report.price,
      area: report.area,
      landArea: report.landArea,
      bedrooms: report.bedrooms,
      bathrooms: report.bathrooms,
      floors: report.floors,
      buildingAge: report.buildingAge,
      
      // Contact fields
      contactPhone: report.contactPhone,
      contactEmail: report.contactEmail,
      contactLine: report.contactLine,
      
      // Location fields
      province: report.province,
      region: report.region,
      
      location: {
        lat: report.locationLat,
        lng: report.locationLng,
        address: report.address,
        formattedAddress: report.formattedAddress
      },
      images: report.userImages || [],
      nearbyPlaces: report.nearbyPlaces || [],
      googlePhotos: report.googlePhotos || null,
      streetViewData: report.streetViewData || null,
      mapsData: report.mapsData || null,
      aiInsights: report.aiInsights || null,
      transportation: report.transportation || null,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      viewCount: report.viewCount,
      shareCount: report.shareCount,
      isPublic: report.isPublic,
      user: {
        name: report.user.name || 'ผู้ใช้',
        id: report.userId
      }
    };

    return NextResponse.json({
      report: transformedReport
    });

  } catch (error) {
    console.error('Error fetching report by token:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

