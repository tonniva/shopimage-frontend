import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    // Allow all logged-in users for now
    const isAdmin = true;
    
    if (!isAdmin) {
      return { isAdmin: false, error: 'Forbidden: Admin access required' };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, error: error.message };
  }
}

// GET - Fetch cache config
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'share_page';

    // Get or create default config
    let config = await prisma.cacheConfig.findUnique({
      where: { type }
    });

    if (!config) {
      // Create default config
      config = await prisma.cacheConfig.create({
        data: {
          type,
          enabled: true,
          maxAge: 300,
          staleWhileRevalidate: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        enabled: config.enabled,
        maxAge: config.maxAge,
        staleWhileRevalidate: config.staleWhileRevalidate
      }
    });

  } catch (error) {
    console.error('Error fetching cache config:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cache config',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Update cache config
export async function POST(request) {
  try {
    // Check admin access
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: adminCheck.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { type = 'share_page', enabled, maxAge, staleWhileRevalidate } = body;

    // Get or create config
    let config = await prisma.cacheConfig.findUnique({
      where: { type }
    });

    if (config) {
      // Update existing config
      config = await prisma.cacheConfig.update({
        where: { type },
        data: {
          enabled: enabled !== undefined ? enabled : config.enabled,
          maxAge: maxAge !== undefined ? maxAge : config.maxAge,
          staleWhileRevalidate: staleWhileRevalidate !== undefined ? staleWhileRevalidate : config.staleWhileRevalidate
        }
      });
    } else {
      // Create new config
      config = await prisma.cacheConfig.create({
        data: {
          type,
          enabled: enabled !== undefined ? enabled : true,
          maxAge: maxAge !== undefined ? maxAge : 300,
          staleWhileRevalidate: staleWhileRevalidate !== undefined ? staleWhileRevalidate : true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cache config updated successfully',
      config: {
        enabled: config.enabled,
        maxAge: config.maxAge,
        staleWhileRevalidate: config.staleWhileRevalidate
      }
    });

  } catch (error) {
    console.error('Error updating cache config:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update cache config',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

