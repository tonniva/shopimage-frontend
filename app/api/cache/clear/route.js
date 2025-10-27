import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { memoryCache } from '@/lib/cache';

async function checkAdmin() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    const isAdmin = true; // Allow all logged-in users for now
    
    if (!isAdmin) {
      return { isAdmin: false, error: 'Forbidden: Admin access required' };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, error: error.message };
  }
}

// POST - Clear cache
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
    const { type } = body;

    let cleared = 0;

    switch (type) {
      case 'all':
        memoryCache.report.clear();
        memoryCache.ads.clear();
        memoryCache.config.clear();
        cleared = 3;
        break;
      case 'report':
        memoryCache.report.clear();
        cleared = 1;
        break;
      case 'ads':
        memoryCache.ads.clear();
        cleared = 1;
        break;
      case 'config':
        memoryCache.config.clear();
        cleared = 1;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid cache type' },
          { status: 400 }
        );
    }

    console.log('🧹 Cache cleared:', { type, cleared });

    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully`,
      type,
      cleared
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear cache',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Get cache statistics
export async function GET() {
  try {
    const reportStats = memoryCache.report.getStats();
    const adsStats = memoryCache.ads.getStats();
    const configStats = memoryCache.config.getStats();

    return NextResponse.json({
      success: true,
      stats: {
        report: reportStats,
        ads: adsStats,
        config: configStats
      }
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

