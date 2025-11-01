import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/property-mappings';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  try {
    // Fetch all approved properties
    const properties = await prisma.propertyReport.findMany({
      where: {
        status: 'approved',
        isPublic: true
      },
      select: {
        shareToken: true,
        updatedAt: true,
        category: true,
        province: true
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.xn--s3cnd3b9cte.com';

    // Generate sitemap entries for each property
    const propertyEntries = properties.map((property) => ({
      url: `${baseUrl}/share/${property.shareToken}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Generate search pages for each category + popular provinces
    const popularProvinces = ['กรุงเทพ', 'เชียงใหม่', 'ภูเก็ต', 'ชลบุรี', 'ระยอง', 'นครราชสีมา'];
    const searchEntries = [];
    
    for (const categoryThai of Object.keys(CATEGORIES)) {
      for (const provinceThai of popularProvinces) {
        searchEntries.push({
          url: `${baseUrl}/${encodeURIComponent(categoryThai)}/${CATEGORIES[categoryThai].slug || 'search'}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    }

    // Add main pages
    const routes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/property-snap`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/property-snap/create`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];

    return [...routes, ...searchEntries, ...propertyEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://property-snap.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}


