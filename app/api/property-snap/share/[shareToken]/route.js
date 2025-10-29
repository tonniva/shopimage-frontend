import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { memoryCache } from '@/lib/cache';

export async function GET(request, { params }) {
  try {
    const { shareToken } = await params;
    
    // Check in-memory cache for config
    let cacheConfig = memoryCache.config.get('share_page');
    
    if (!cacheConfig) {
      // Get cache config from database (with retry)
      cacheConfig = await withRetry(async () => {
        return await prisma.cacheConfig.findUnique({
          where: { type: 'share_page' }
        });
      });

      // If not found, create default (with retry)
      if (!cacheConfig) {
        cacheConfig = await withRetry(async () => {
          return await prisma.cacheConfig.create({
            data: {
              type: 'share_page',
              enabled: true,
              maxAge: 300,
              staleWhileRevalidate: true
            }
          });
        });
      }
      
      // Cache config for 10 minutes
      memoryCache.config.set('share_page', cacheConfig, 600);
    }

    const cacheMaxAge = cacheConfig.maxAge;
    const enableCache = cacheConfig.enabled;
    
    console.log('🔍 Share API Cache Status:', {
      enabled: enableCache,
      maxAge: cacheMaxAge,
      staleWhileRevalidate: cacheConfig.staleWhileRevalidate,
      shareToken
    });
    
    // Check in-memory cache for report
    const cachedReport = memoryCache.report.get(shareToken);
    if (cachedReport) {
      console.log('✅ Cache HIT - Returning from memory cache');
      return NextResponse.json(
        { report: cachedReport },
        { 
          headers: new Headers({
            'Cache-Control': enableCache 
              ? (cacheConfig.staleWhileRevalidate
                  ? `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=60`
                  : `public, s-maxage=${cacheMaxAge}`)
              : 'no-cache',
            'X-Cache': 'HIT',
            'X-Cache-Source': 'memory'
          })
        }
      );
    }
    
    console.log('❌ Cache MISS - Fetching from database');
    
    // Fetch report from database (with retry)
    const report = await withRetry(async () => {
      return await prisma.propertyReport.findUnique({
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

    // Fetch header images (with retry)
    const headerRecords = await withRetry(async () => {
      return await prisma.propertySnapHeader.findMany({
        where: {
          userId: report.userId,
          isActive: true
        },
        orderBy: {
          order: 'asc'
        }
      });
    });

    // Update view count asynchronously (fire-and-forget)
    prisma.propertyReport.update({
      where: { id: report.id },
      data: { viewCount: report.viewCount + 1 }
    }).catch(err => console.error('Error updating view count:', err));

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
      
      console.log('✅ Cache ENABLED:', {
        cacheControl: cacheControlValue,
        cdnControl: `public, s-maxage=${cacheMaxAge}`
      });
    } else {
      console.log('❌ Cache DISABLED');
    }

    console.log('📦 Sending response:', {
      reportId: report.id,
      title: report.title,
      viewCount: report.viewCount,
      hasHeaders: headerImages.length > 0
    });

    // Cache the transformed report in memory
    // Use same TTL as CDN cache
    memoryCache.report.set(shareToken, transformedReport, cacheMaxAge);

    // Add cache headers
    headers.set('X-Cache', 'MISS');
    headers.set('X-Cache-Source', 'database');

    return NextResponse.json(
      { report: transformedReport },
      { headers }
    );

  } catch (error) {
    console.error('Error fetching shared report:', error);
    
    // Handle connection errors specifically
    if (error.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Please try again in a moment',
        code: 'P1001',
        details: 'The database connection pool is temporarily full. Please retry.'
      }, { status: 503 }); // Service Unavailable
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch report',
      details: error.message || 'Unknown error',
      code: error.code || null
    }, { status: 500 });
  }
}