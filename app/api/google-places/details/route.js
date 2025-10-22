import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { place_id } = await request.json();

    if (!place_id) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Build Google Places Details API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = new URLSearchParams({
      place_id: place_id,
      key: apiKey,
      language: 'th', // Thai language
      fields: 'formatted_address,address_components,geometry'
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places Details API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: 'Google Places API error', details: data.error_message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: data.result
    });

  } catch (error) {
    console.error('Error in Google Places details:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
