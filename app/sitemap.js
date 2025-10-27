import { prisma } from '@/lib/prisma';

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
        updatedAt: true
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://property-snap.com';

    // Generate sitemap entries for each property
    const propertyEntries = properties.map((property) => ({
      url: `${baseUrl}/share/${property.shareToken}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

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

    return [...routes, ...propertyEntries];
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


