import { NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/google-places';

export async function POST(request) {
  try {
    const { location, radius, type, language } = await request.json();
    console.log('Google Places API Request:', { location, radius, type, language });

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const result = await searchNearbyPlaces({
      location,
      radius,
      type,
      language
    });

    console.log('Google Places API Result:', result);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      places: result.places,
      totalResults: result.totalResults,
      searchParams: result.searchParams
    });

  } catch (error) {
    console.error('Error in Google Places nearby search:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
