// app/api/google-street-view/availability/route.js
import { NextResponse } from 'next/server';
import { checkStreetViewAvailability } from '@/lib/google-street-view';

export async function POST(request) {
  try {
    const { location, radius } = await request.json();

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const result = await checkStreetViewAvailability(location, radius);

    return NextResponse.json({
      success: true,
      available: result.available,
      metadata: result.metadata,
      error: result.error
    });

  } catch (error) {
    console.error('Error checking Street View availability:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
