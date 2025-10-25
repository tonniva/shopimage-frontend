// app/api/google-places/search/route.js
import { NextResponse } from 'next/server';
import { searchPlacesByText } from '@/lib/google-places';

export async function POST(request) {
  try {
    const { query, location, radius, language } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const result = await searchPlacesByText({
      query,
      location,
      radius,
      language
    });

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
    console.error('Error in Google Places search:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
