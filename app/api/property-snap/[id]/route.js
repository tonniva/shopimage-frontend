import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/property-snap/[id]
 * Get a property report by ID (for owner/admin to view status)
 */

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Get the report
    const report = await prisma.propertyReport.findUnique({
      where: { id },
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
      propertyType: report.propertyType,
      listingType: report.listingType,
      price: report.price,
      area: report.area,
      landArea: report.landArea,
      bedrooms: report.bedrooms,
      bathrooms: report.bathrooms,
      floors: report.floors,
      buildingAge: report.buildingAge,
      contactPhone: report.contactPhone,
      contactEmail: report.contactEmail,
      contactLine: report.contactLine,
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
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      viewCount: report.viewCount,
      shareCount: report.shareCount,
      user: {
        name: report.user.name || 'ผู้ใช้',
        id: report.userId
      }
    };

    return NextResponse.json({
      report: transformedReport
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
