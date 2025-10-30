import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/auth/session
 * Returns the current Supabase session for the authenticated user
 * Compatible with NextAuth session endpoint format
 */
export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    
    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting Supabase session:', error);
      return NextResponse.json({}, { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }
    
    // If no session, return empty object (same as NextAuth behavior)
    if (!session || !session.user) {
      return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }
    
    // Transform Supabase session to NextAuth-like format
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
        email: session.user.email,
        image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
      },
      expires: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    
  } catch (error) {
    console.error('Error in /api/auth/session:', error);
    // Return empty object on error (same as NextAuth behavior)
    return NextResponse.json({}, { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}

