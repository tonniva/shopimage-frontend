// app/api/google-maps/geocode/route.js
import { NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode } from '@/lib/google-maps';

export async function POST(request) {
  try {
    const { 
      address, 
      location, 
      language, 
      operation = 'geocode' // 'geocode' or 'reverse'
    } = await request.json();

    let result;

    if (operation === 'reverse' && location) {
      // Reverse geocoding
      result = await reverseGeocode(location, language);
    } else if (operation === 'geocode' && address) {
      // Forward geocoding
      result = await geocodeAddress(address, language);
    } else {
      return NextResponse.json(
        { error: 'Invalid operation or missing parameters' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      geocoding: result.geocoding
    });

  } catch (error) {
    console.error('Error geocoding:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
