// app/api/google-street-view/multiple/route.js
import { NextResponse } from 'next/server';
import { getMultipleStreetViewImages } from '@/lib/google-street-view';

export async function POST(request) {
  try {
    const { 
      location, 
      size, 
      pitch, 
      fov, 
      format, 
      quality, 
      angles 
    } = await request.json();

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const result = await getMultipleStreetViewImages({
      location,
      size,
      pitch,
      fov,
      format,
      quality,
      angles
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
      metadata: result.metadata,
      totalImages: result.totalImages
    });

  } catch (error) {
    console.error('Error getting multiple Street View images:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
