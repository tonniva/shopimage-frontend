import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { getCategoryThai, getProvinceThai, getCategoryInfo } from '@/lib/property-mappings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 30;

// Public search API - no auth required
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get and convert slugs to Thai
    const categorySlug = searchParams.get('category');
    const provinceSlug = searchParams.get('province');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    // Decode URL-encoded parameters first
    const decodedCategorySlug = categorySlug ? decodeURIComponent(categorySlug) : null;
    const decodedProvinceSlug = provinceSlug ? decodeURIComponent(provinceSlug) : null;
    
    // Check if decoded value is Thai or a slug
    let category = decodedCategorySlug;
    if (decodedCategorySlug && !/[\u0E00-\u0E7F]/.test(decodedCategorySlug)) {
      // No Thai characters, it's probably a slug (e.g., "sell-house")
      category = getCategoryThai(decodedCategorySlug);
    }
    
    // Same for province
    let province = decodedProvinceSlug;
    if (decodedProvinceSlug && !/[\u0E00-\u0E7F]/.test(decodedProvinceSlug)) {
      province = getProvinceThai(decodedProvinceSlug);
    }
    
    console.log('🔍 Search request:', {
      categorySlug,
      provinceSlug,
      decodedCategorySlug,
      decodedProvinceSlug,
      category,
      province,
      search,
      page,
      limit
    });
    
    // Build where clause
    const where = {
      status: 'APPROVED', // Only approved properties
      isPublic: true
    };
    
    // Add filters
    const categoryConditions = [];
    const searchConditions = [];
    
    if (category) {
      // Try to match by category - use propertyType + listingType fallback
      // Note: category field may not exist in database yet, so we use fallback approach
      const categoryInfo = getCategoryInfo(category);
      if (categoryInfo) {
        // Use propertyType + listingType as primary matching (works with existing data)
        categoryConditions.push({ 
          AND: [
            { propertyType: categoryInfo.propertyType },
            { listingType: categoryInfo.listingType }
          ]
        });
        // TODO: Add category field matching once database migration is complete
        // categoryConditions.push({ category: category });
      }
      // If categoryInfo is null, category string doesn't match known categories
      // In this case, we could try direct category field match, but it's likely invalid
    }
    
    if (province) {
      where.province = province;
    }
    
    // Add search query
    if (search) {
      searchConditions.push(
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      );
    }
    
    // Combine conditions
    if (categoryConditions.length > 0) {
      where.OR = categoryConditions;
    }
    
    if (searchConditions.length > 0) {
      if (where.OR) {
        // If we already have OR conditions, we need to combine them with AND
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }
    
    // Get properties with pagination (with retry)
    const [properties, total] = await Promise.all([
      withRetry(() => prisma.propertyReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          shareToken: true,
          title: true,
          description: true,
          propertyType: true,
          listingType: true,
          // category: true, // TODO: Uncomment when category field is available in database
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
          formattedAddress: true,
          province: true,
          region: true,
          userImages: true,
          nearbyPlaces: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true
        }
      })),
      withRetry(() => prisma.propertyReport.count({ where }))
    ]);
    
    // Transform data for frontend
    const transformedProperties = properties.map(property => ({
      id: property.id,
      shareToken: property.shareToken,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      category: property.category || null, // Will be null until category field is available
      price: property.price,
      area: property.area,
      landArea: property.landArea,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floors: property.floors,
      buildingAge: property.buildingAge,
      contactPhone: property.contactPhone,
      contactEmail: property.contactEmail,
      contactLine: property.contactLine,
      location: {
        lat: property.locationLat,
        lng: property.locationLng,
        address: property.address,
        formattedAddress: property.formattedAddress
      },
      province: property.province,
      region: property.region,
      images: property.userImages,
      nearbyPlaces: property.nearbyPlaces,
      viewCount: property.viewCount || 0,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));
    
    console.log(`✅ Found ${properties.length} properties (total: ${total})`);
    
    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        category,
        province,
        search
      }
    });
    
  } catch (error) {
    console.error('❌ Search API error:', error);
    
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
      error: 'Failed to search properties',
      details: error.message || 'Unknown error',
      type: error.name || 'Error',
      code: error.code || null
    }, { status: 500 });
  }
}

