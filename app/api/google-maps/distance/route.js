// app/api/google-maps/distance/route.js
import { NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/google-maps';

export async function POST(request) {
  try {
    const { 
      origin, 
      destination, 
      mode 
    } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination coordinates are required' },
        { status: 400 }
      );
    }

    const result = await calculateDistance(origin, destination, mode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      distance: result.distance
    });

  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
