import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memoryCache } from '@/lib/cache';

// GET - Fetch ads for display based on position and status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position') || 'sidebar';
    
    // Check in-memory cache for config
    let cacheConfig = memoryCache.config.get('ads_api');
    
    if (!cacheConfig) {
      // Fetch cache config
      cacheConfig = await prisma.cacheConfig.findUnique({
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
      
      // Cache config for 10 minutes
      memoryCache.config.set('ads_api', cacheConfig, 600);
    }
    
    // Check in-memory cache for ads
    const cacheKey = `ads_${position}`;
    const cachedAds = memoryCache.ads.get(cacheKey);
    
    if (cachedAds) {
      console.log('✅ Ads Cache HIT:', { position, count: cachedAds.length });
      
      // Set cache headers
      const headers = new Headers();
      if (cacheConfig.enabled) {
        const cacheControlValue = cacheConfig.staleWhileRevalidate
          ? `public, s-maxage=${cacheConfig.maxAge}, stale-while-revalidate=60`
          : `public, s-maxage=${cacheConfig.maxAge}`;
        
        headers.set('Cache-Control', cacheControlValue);
        headers.set('CDN-Cache-Control', `public, s-maxage=${cacheConfig.maxAge}`);
        headers.set('X-Cache', 'HIT');
        headers.set('X-Cache-Source', 'memory');
      }
      
      return NextResponse.json({ success: true, ads: cachedAds }, { headers });
    }
    
    console.log('❌ Ads Cache MISS - Fetching from database:', { position });

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

    // Cache ads in memory
    memoryCache.ads.set(cacheKey, ads, cacheConfig.maxAge);
    
    // Set cache headers
    const headers = new Headers();
    if (cacheConfig.enabled) {
      const cacheControlValue = cacheConfig.staleWhileRevalidate
        ? `public, s-maxage=${cacheConfig.maxAge}, stale-while-revalidate=60`
        : `public, s-maxage=${cacheConfig.maxAge}`;
      
      headers.set('Cache-Control', cacheControlValue);
      headers.set('CDN-Cache-Control', `public, s-maxage=${cacheConfig.maxAge}`);
      headers.set('X-Cache', 'MISS');
      headers.set('X-Cache-Source', 'database');
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

