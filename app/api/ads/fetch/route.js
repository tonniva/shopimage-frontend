import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch ads for display based on position and status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position') || 'sidebar';
    
    // Fetch cache config
    let cacheConfig = await prisma.cacheConfig.findUnique({
      where: { type: 'ads_api' }
    });

    if (!cacheConfig) {
      cacheConfig = await prisma.cacheConfig.create({
        data: {
          type: 'ads_api',
          enabled: true,
          maxAge: 300, // 5 minutes
          staleWhileRevalidate: true
        }
      });
    }

    // Fetch active ads for the specific position
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'active',
        position: position,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          { OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]}
        ]
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Set cache headers
    const headers = new Headers();
    if (cacheConfig.enabled) {
      const cacheControlValue = cacheConfig.staleWhileRevalidate
        ? `public, s-maxage=${cacheConfig.maxAge}, stale-while-revalidate=60`
        : `public, s-maxage=${cacheConfig.maxAge}`;
      
      headers.set('Cache-Control', cacheControlValue);
      headers.set('CDN-Cache-Control', `public, s-maxage=${cacheConfig.maxAge}`);
    }

    return NextResponse.json({ success: true, ads }, { headers });

  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ads', details: error.message },
      { status: 500 }
    );
  }
}

