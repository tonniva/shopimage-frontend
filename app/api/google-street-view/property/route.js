// app/api/google-street-view/property/route.js
import { NextResponse } from 'next/server';
import { getPropertyStreetViewImages } from '@/lib/google-street-view';

export async function POST(request) {
  try {
    const { 
      location, 
      propertyType, 
      size, 
      quality 
    } = await request.json();

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const result = await getPropertyStreetViewImages({
      location,
      propertyType,
      size,
      quality
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: result.images,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error getting property Street View images:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
