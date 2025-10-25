// app/api/google-street-view/image/route.js
import { NextResponse } from 'next/server';
import { generateStreetViewImageUrl } from '@/lib/google-street-view';

export async function POST(request) {
  try {
    const { 
      location, 
      size, 
      heading, 
      pitch, 
      fov, 
      format, 
      quality 
    } = await request.json();

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const imageUrl = generateStreetViewImageUrl({
      location,
      size,
      heading,
      pitch,
      fov,
      format,
      quality
    });

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate Street View image URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      parameters: {
        location,
        size,
        heading,
        pitch,
        fov,
        format,
        quality
      }
    });

  } catch (error) {
    console.error('Error generating Street View image URL:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
