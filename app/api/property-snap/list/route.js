import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Check Authentication
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

    // Build where clause
    const where = {
      userId: prismaUser.id
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

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      prisma.propertyReport.findMany({
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
      }),
      prisma.propertyReport.count({ where })
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

    return NextResponse.json({
      properties: transformedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch properties',
      details: error.message || 'Unknown error',
      type: error.name || 'Error'
    }, { status: 500 });
  }
}