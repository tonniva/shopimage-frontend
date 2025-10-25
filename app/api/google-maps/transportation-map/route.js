// app/api/google-maps/transportation-map/route.js
import { NextResponse } from 'next/server';
import { generateTransportationMapUrl } from '@/lib/google-maps';

export async function POST(request) {
  try {
    const { 
      propertyLocation, 
      transportationStops, 
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

    const mapUrl = generateTransportationMapUrl({
      propertyLocation,
      transportationStops,
      mapType,
      size,
      zoom
    });

    if (!mapUrl) {
      return NextResponse.json(
        { error: 'Failed to generate transportation map URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mapUrl,
      parameters: {
        propertyLocation,
        transportationStops,
        mapType,
        size,
        zoom
      }
    });

  } catch (error) {
    console.error('Error generating transportation map:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
