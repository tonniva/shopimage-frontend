// app/api/google-maps/property-map/route.js
import { NextResponse } from 'next/server';
import { generatePropertyMapUrl } from '@/lib/google-maps';

export async function POST(request) {
  try {
    const { 
      propertyLocation, 
      nearbyPlaces, 
      mapType, 
      size, 
      zoom 
    } = await request.json();

    if (!propertyLocation || !propertyLocation.lat || !propertyLocation.lng) {
      return NextResponse.json(
        { error: 'Property location coordinates are required' },
        { status: 400 }
      );
    }

    const mapUrl = generatePropertyMapUrl({
      propertyLocation,
      nearbyPlaces,
      mapType,
      size,
      zoom
    });

    if (!mapUrl) {
      return NextResponse.json(
        { error: 'Failed to generate property map URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mapUrl,
      parameters: {
        propertyLocation,
        nearbyPlaces,
        mapType,
        size,
        zoom
      }
    });

  } catch (error) {
    console.error('Error generating property map:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
