import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { input, country } = await request.json();

    if (!input || input.length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Build Google Places API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params = new URLSearchParams({
      input: input,
      key: apiKey,
      language: 'th', // Thai language
      components: `country:${country}`,
      types: 'address'
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: 'Google Places API error', details: data.error_message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      predictions: data.predictions || []
    });

  } catch (error) {
    console.error('Error in Google Places autocomplete:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
