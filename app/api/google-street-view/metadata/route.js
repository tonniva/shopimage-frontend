// app/api/google-street-view/metadata/route.js
import { NextResponse } from 'next/server';
import { getStreetViewMetadata } from '@/lib/google-street-view';

export async function POST(request) {
  try {
    const { location, heading, pitch, fov, radius } = await request.json();

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const result = await getStreetViewMetadata({
      location,
      heading,
      pitch,
      fov,
      radius
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error getting Street View metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
