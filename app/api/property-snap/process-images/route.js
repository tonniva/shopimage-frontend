// app/api/property-snap/process-images/route.js
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { processImageServer, validateImageServer } from '@/lib/image-processing-server';
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
    const options = JSON.parse(formData.get('options') || '{}');
    
    // 2. Validate inputs
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // 3. Process images
    const processedImages = [];
    const errors = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        // Convert File to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        // Validate image
        const validation = await validateImageServer(imageBuffer, image.name);
        if (!validation.valid) {
          errors.push({
            filename: image.name,
            error: validation.error
          });
          continue;
        }

        // Process image
        const result = await processImageServer(imageBuffer, image.name, {
          generateThumbnails: true,
          quality: options.quality || 85,
          maxWidth: options.maxWidth || 2048,
          maxHeight: options.maxHeight || 2048
        });

        if (result.success) {
          processedImages.push({
            filename: image.name,
            processed: result.processed,
            thumbnails: result.thumbnails,
            metadata: {
              original: result.original,
              compressionRatio: Math.round(((result.original.size - result.processed.size) / result.original.size) * 100)
            }
          });
        } else {
          errors.push({
            filename: image.name,
            error: result.error
          });
        }

      } catch (error) {
        errors.push({
          filename: image.name,
          error: error.message
        });
      }
    }

    // 4. Return results
    return NextResponse.json({
      success: true,
      processedImages,
      errors,
      totalImages: images.length,
      processedCount: processedImages.length,
      errorCount: errors.length
    });

  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json({ error: 'Failed to process images' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // 1. Check Authentication with Supabase
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // 2. Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // 3. Get image metadata
    const { getImageMetadataServer } = await import('@/lib/image-processing-server');
    const metadata = await getImageMetadataServer(imageBuffer);

    if (!metadata.success) {
      return NextResponse.json({ error: metadata.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      metadata: metadata
    });

  } catch (error) {
    console.error('Error getting image metadata:', error);
    return NextResponse.json({ error: 'Failed to get image metadata' }, { status: 500 });
  }
}
