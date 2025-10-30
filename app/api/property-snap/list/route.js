import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma, withRetry } from '@/lib/prisma';
import { memoryCache } from '@/lib/cache';

export async function GET(request) {
  try {
    // Check Authentication
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve Prisma userId with small in-memory cache by email to avoid extra DB hits
    const userIdCacheKey = `uid:${user.email}`;
    let prismaUserId = memoryCache.config.get(userIdCacheKey);
    if (!prismaUserId) {
      const prismaUser = await withRetry(async () => {
        return await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true }
        });
      });
      if (!prismaUser) {
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        );
      }
      prismaUserId = prismaUser.id;
      // Cache userId for 5 minutes
      memoryCache.config.set(userIdCacheKey, prismaUserId, 300);
    }

    if (!prismaUserId) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const status = searchParams.get('status') || '';

    // Create cache key based on user ID and query parameters
    const cacheKey = `property-list-${prismaUserId}-${page}-${limit}-${search}-${propertyType}-${status}`;
    
    // Check cache first
    const cachedResult = memoryCache.report.get(cacheKey);
    if (cachedResult) {
      console.log('✅ Cache HIT - Returning property list from memory cache:', {
        userId: prismaUserId,
        page,
        limit,
        cacheKey: cacheKey.substring(0, 50) + '...'
      });
      
      return NextResponse.json(cachedResult, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Source': 'memory',
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
        }
      });
    }
    
    console.log('❌ Cache MISS - Fetching property list from database:', {
      userId: prismaUserId,
      page,
      limit
    });

    // Build where clause
    const where = {
      userId: prismaUserId
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (propertyType && propertyType !== 'all') {
      where.propertyType = propertyType;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Get reports with pagination (with retry)
    const [reports, total] = await Promise.all([
      withRetry(() => prisma.propertyReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          shareToken: true,
          title: true,
          description: true,
          propertyType: true,
          listingType: true,
          price: true,
          area: true,
          landArea: true,
          bedrooms: true,
          bathrooms: true,
          floors: true,
          buildingAge: true,
          contactPhone: true,
          contactEmail: true,
          contactLine: true,
          locationLat: true,
          locationLng: true,
          address: true,
          userImages: true,
          nearbyPlaces: true,
          status: true,
          viewCount: true,
          shareCount: true,
          createdAt: true,
          updatedAt: true
        }
      })),
      withRetry(() => prisma.propertyReport.count({ where }))
    ]);

    // Transform data for frontend
    const transformedReports = reports.map(report => ({
      id: report.id,
      shareToken: report.shareToken,
      title: report.title,
      description: report.description,
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
      location: {
        lat: report.locationLat,
        lng: report.locationLng,
        address: report.address
      },
      images: report.userImages || [],
      nearbyPlaces: report.nearbyPlaces || [],
      status: report.status || 'ACTIVE',
      viewCount: report.viewCount || 0,
      shareCount: report.shareCount || 0,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }));

    const result = {
      properties: transformedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    // Cache the result for 30 seconds (TTL)
    // User-specific data should have shorter cache time
    memoryCache.report.set(cacheKey, result, 30);
    
    console.log('✅ Cached property list result:', {
      userId: prismaUserId,
      page,
      totalResults: total,
      cacheTTL: 30
    });

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Source': 'database',
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
      }
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    
    // Handle connection errors specifically
    if (error.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Please try again in a moment',
        code: 'P1001',
        details: 'The database connection pool is temporarily full. Please retry.'
      }, { status: 503 }); // Service Unavailable
    }
    
    // Handle prepared statement errors (42P05, 26000) - Pooler incompatibility
    if (error.code === '42P05' || 
        error.code === '26000' ||
        (error.message && error.message.includes('prepared statement'))) {
      const errorCode = error.code || 'UNKNOWN';
      const errorType = error.code === '42P05' 
        ? 'prepared statement already exists (Transaction Mode)'
        : error.code === '26000'
        ? 'prepared statement does not exist (Pooler issue)'
        : 'prepared statement error';
      
      console.error(`⚠️ Prepared statement error (${errorCode}) - ${errorType}`);
      console.error('⚠️ SOLUTION: ใช้ DIRECT_URL แทน POOLER_URL ใน Vercel');
      
      return NextResponse.json({ 
        error: 'Database connection error',
        message: 'Prepared statement error detected',
        code: errorCode,
        errorType,
        details: 'Prisma มีปัญหา prepared statements กับ Connection Pooler',
        solution: 'แก้ไข: ใช้ DIRECT_URL แทน POOLER_URL ใน Vercel Environment Variables',
        hint: 'DIRECT_URL ไม่มีปัญหา prepared statements และแนะนำให้ใช้เป็นหลัก'
      }, { status: 503 }); // Service Unavailable
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch properties',
      details: error.message || 'Unknown error',
      type: error.name || 'Error',
      code: error.code || null
    }, { status: 500 });
  }
}