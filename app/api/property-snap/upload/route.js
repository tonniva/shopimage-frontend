// app/api/property-snap/upload/route.js
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { uploadPropertyImagesServer } from '@/lib/storage-server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
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

    const formData = await request.formData();
    const images = formData.getAll('images');
    const reportId = formData.get('reportId');
    
    // 2. Validate inputs
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    // 3. Upload images to Supabase Storage
    const uploadResults = await uploadPropertyImagesServer(
      images, 
      prismaUser.id, 
      reportId
    );

    // 4. Check for upload failures
    const failedUploads = uploadResults.filter(result => !result.success);
    if (failedUploads.length > 0) {
      console.error('Some uploads failed:', failedUploads);
      return NextResponse.json({
        error: 'Some images failed to upload',
        failedUploads: failedUploads.map(f => f.error)
      }, { status: 400 });
    }

    // 5. Return successful upload results
    return NextResponse.json({
      success: true,
      uploadedImages: uploadResults,
      reportId: reportId,
      userId: prismaUser.id,
      totalImages: uploadResults.length
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}

export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const imagePath = searchParams.get('imagePath');
    
    // 2. Validate inputs
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    // 3. Delete images from storage
    if (imagePath) {
      // Delete specific image
      const { deletePropertyImageServer } = await import('@/lib/storage-server');
      const success = await deletePropertyImageServer(imagePath);
      
      if (!success) {
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
      }
    } else {
      // Delete all images for the report
      const { deletePropertyReportImagesServer } = await import('@/lib/storage-server');
      const success = await deletePropertyReportImagesServer(prismaUser.id, reportId);
      
      if (!success) {
        return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: imagePath ? 'Image deleted successfully' : 'All images deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting images:', error);
    return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 });
  }
}
