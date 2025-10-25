// app/api/google-maps/static-map/route.js
import { NextResponse } from 'next/server';
import { generateStaticMapUrl } from '@/lib/google-maps';

export async function POST(request) {
  try {
    const { 
      center, 
      zoom, 
      size, 
      mapType, 
      markers, 
      paths, 
      scale, 
      format, 
      language, 
      region 
    } = await request.json();

    if (!center || !center.lat || !center.lng) {
      return NextResponse.json(
        { error: 'Center coordinates are required' },
        { status: 400 }
      );
    }

    const mapUrl = generateStaticMapUrl({
      center,
      zoom,
      size,
      mapType,
      markers,
      paths,
      scale,
      format,
      language,
      region
    });

    if (!mapUrl) {
      return NextResponse.json(
        { error: 'Failed to generate static map URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mapUrl,
      parameters: {
        center,
        zoom,
        size,
        mapType,
        markers,
        paths,
        scale,
        format,
        language,
        region
      }
    });

  } catch (error) {
    console.error('Error generating static map:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
