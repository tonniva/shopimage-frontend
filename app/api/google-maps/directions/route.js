// app/api/google-maps/directions/route.js
import { NextResponse } from 'next/server';
import { getDirections } from '@/lib/google-maps';

export async function POST(request) {
  try {
    const { 
      origin, 
      destination, 
      mode, 
      language, 
      region 
    } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const result = await getDirections({
      origin,
      destination,
      mode,
      language,
      region
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      directions: result.directions
    });

  } catch (error) {
    console.error('Error getting directions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
