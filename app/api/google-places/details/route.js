// app/api/google-places/details/route.js
import { NextResponse } from 'next/server';
import { getPlaceDetails } from '@/lib/google-places';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const language = searchParams.get('language') || 'th';

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    const result = await getPlaceDetails(placeId, language);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      place: result.place
    });

  } catch (error) {
    console.error('Error getting place details:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}