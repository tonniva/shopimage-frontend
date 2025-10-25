import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { shareToken } = await params;
    
    // Fetch report from database
    const report = await prisma.propertyReport.findUnique({
      where: {
        shareToken: shareToken,
        status: 'ACTIVE',
        isPublic: true
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

    // Update view count
    await prisma.propertyReport.update({
      where: { id: report.id },
      data: { viewCount: report.viewCount + 1 }
    });

    // Transform data for frontend
    const transformedReport = {
      id: report.id,
      shareToken: report.shareToken,
      title: report.title,
      description: report.description,
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
      viewCount: report.viewCount + 1,
      shareCount: report.shareCount,
      isPublic: report.isPublic,
      status: report.status,
      user: {
        name: report.user.name || 'ผู้ใช้'
      }
    };

    return NextResponse.json({
      report: transformedReport
    });

  } catch (error) {
    console.error('Error fetching shared report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}