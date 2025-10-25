// app/api/property-snap/storage/route.js
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { getUserStorageUsageServer } from '@/lib/storage-server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // 1. Check Authentication with Supabase
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in Prisma database
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // 2. Get storage usage
    const storageUsage = await getUserStorageUsageServer(prismaUser.id);

    // 3. Get user's plan limits
    const planLimits = {
      FREE: { storageMB: 100, reports: 3 },
      PRO: { storageMB: 1000, reports: 50 },
      BUSINESS: { storageMB: 5000, reports: 200 }
    };

    const userPlan = prismaUser.plan || 'FREE';
    const limits = planLimits[userPlan];

    // 4. Calculate usage percentages
    const storageUsagePercent = Math.round((storageUsage.totalSizeMB / limits.storageMB) * 100);
    
    // Get report count
    const reportCount = await prisma.propertyReport.count({
      where: { userId: prismaUser.id }
    });
    
    const reportUsagePercent = Math.round((reportCount / limits.reports) * 100);

    return NextResponse.json({
      success: true,
      storage: {
        used: storageUsage.totalSizeMB,
        limit: limits.storageMB,
        usagePercent: storageUsagePercent,
        fileCount: storageUsage.fileCount,
        remaining: Math.max(0, limits.storageMB - storageUsage.totalSizeMB)
      },
      reports: {
        used: reportCount,
        limit: limits.reports,
        usagePercent: reportUsagePercent,
        remaining: Math.max(0, limits.reports - reportCount)
      },
      plan: {
        name: userPlan,
        limits: limits
      },
      warnings: {
        storageNearLimit: storageUsagePercent > 80,
        reportsNearLimit: reportUsagePercent > 80,
        storageExceeded: storageUsagePercent > 100,
        reportsExceeded: reportUsagePercent > 100
      }
    });

  } catch (error) {
    console.error('Error getting storage usage:', error);
    return NextResponse.json({ error: 'Failed to get storage usage' }, { status: 500 });
  }
}
