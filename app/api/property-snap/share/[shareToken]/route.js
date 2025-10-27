import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { shareToken } = await params;
    
    // Get cache config from database
    let cacheConfig = await prisma.cacheConfig.findUnique({
      where: { type: 'share_page' }
    });

    // If not found, create default
    if (!cacheConfig) {
      cacheConfig = await prisma.cacheConfig.create({
        data: {
          type: 'share_page',
          enabled: true,
          maxAge: 300,
          staleWhileRevalidate: true
        }
      });
    }

    const cacheMaxAge = cacheConfig.maxAge;
    const enableCache = cacheConfig.enabled;
    
    // Fetch report from database
    const report = await prisma.propertyReport.findUnique({
      where: {
        shareToken: shareToken,
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

    // Check if report is approved (only APPROVED reports should be visible publicly)
    if (report.status !== 'APPROVED') {
      return NextResponse.json({ 
        error: 'Report not approved',
        status: report.status,
        message: report.status === 'PENDING' 
          ? 'This report is pending approval' 
          : report.status === 'REJECTED'
          ? 'This report was rejected'
          : 'This report is hidden'
      }, { status: 403 });
    }

    // Update view count
    await prisma.propertyReport.update({
      where: { id: report.id },
      data: { viewCount: report.viewCount + 1 }
    });

    // Fetch header images for this user
    const headerRecords = await prisma.propertySnapHeader.findMany({
      where: {
        userId: report.userId,
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    const headerImages = headerRecords.map(header => header.url);

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
      headerImages: headerImages,
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
        name: report.user.name || 'ผู้ใช้',
        id: report.userId
      }
    };

    // Set cache headers based on config
    const headers = new Headers();
    if (enableCache) {
      const cacheControlValue = cacheConfig.staleWhileRevalidate
        ? `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=60`
        : `public, s-maxage=${cacheMaxAge}`;
      
      headers.set('Cache-Control', cacheControlValue);
      headers.set('CDN-Cache-Control', `public, s-maxage=${cacheMaxAge}`);
    }

    return NextResponse.json(
      { report: transformedReport },
      { headers }
    );

  } catch (error) {
    console.error('Error fetching shared report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}