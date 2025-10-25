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

    // Fetch user's reports from database
    const reports = await prisma.propertyReport.findMany({
      where: {
        userId: prismaUser.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        locationLat: true,
        locationLng: true,
        address: true,
        userImages: true,
        nearbyPlaces: true,
        shareToken: true,
        viewCount: true,
        shareCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Transform data for frontend
    const transformedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      description: report.description,
      location: {
        lat: report.locationLat,
        lng: report.locationLng,
        address: report.address
      },
      images: report.userImages || [],
      nearbyPlaces: report.nearbyPlaces || [],
      shareToken: report.shareToken,
      createdAt: report.createdAt,
      viewCount: report.viewCount || 0,
      shareCount: report.shareCount || 0
    }));

    return NextResponse.json({ 
      reports: transformedReports,
      count: transformedReports.length
    });

  } catch (error) {
    console.error('Error in GET /api/property-snap/user-reports:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
