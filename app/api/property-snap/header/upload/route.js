import { NextResponse } from 'next/server';
import { createServerSupabase, createServerSupabaseAdmin } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { validateImageServer, processImageServer } from '@/lib/image-processing-server';

// Storage configuration for headers
const STORAGE_CONFIG = {
  BUCKET_NAME: 'shopimage',
  HEADER_FOLDER: 'property-snap-header',
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB - will be compressed to much smaller
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

/**
 * Upload header images to Supabase Storage
 * POST /api/property-snap/header/upload
 */
export async function POST(request) {
  try {
    // 1. Check authentication
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in Prisma database
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true }
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userId = prismaUser.id;

    // 2. Create admin client for storage operations
    const adminSupabase = createServerSupabaseAdmin();

    // 3. Get form data
    const formData = await request.formData();
    const files = formData.getAll('images'); // Multiple files support

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // 4. Get settings from form data
    const autoSlide = formData.get('autoSlide') === 'true';
    const slideDelay = parseInt(formData.get('slideDelay')) || 5000;

    // 5. Process and upload each image
    const uploadResults = [];
    
    console.log(`📤 Starting upload for ${files.length} files`);

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (!(file instanceof File)) continue;
      
      console.log(`📁 Processing file ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Validate file size (warn but don't reject - will be compressed)
      if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
        console.warn(`⚠️ Large file detected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - will be compressed`);
      }

      // Validate file type
      if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        uploadResults.push({
          success: false,
          filename: file.name,
          error: 'Invalid file type. Only JPEG, PNG, or WebP are allowed.'
        });
        continue;
      }
      
      // Add delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, index * 10));

      try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        // Process image (will resize/optimize automatically)
        console.log(`📏 Original size: ${imageBuffer.length} bytes`);
        
        const processedImage = await processImageServer(imageBuffer, file.name, {
          generateThumbnails: false, // Headers don't need thumbnails
          quality: 85, // Good quality for headers
          maxWidth: 1920, // Full HD width
          maxHeight: 1080  // Allow taller headers for banners
        });
        
        console.log(`📏 Processed size: ${processedImage.processed.size} bytes (saved ${Math.round((1 - processedImage.processed.size / processedImage.original.size) * 100)}%)`);

        if (!processedImage.success) {
          uploadResults.push({
            success: false,
            filename: file.name,
            error: `Image processing failed: ${processedImage.error}`
          });
          continue;
        }

        // Generate unique filename: {timestamp}_{index}_${userId}.{ext}
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}_${index}_${userId}.${extension}`;
        const filePath = `${STORAGE_CONFIG.HEADER_FOLDER}/${userId}/${filename}`;

        // Upload to Supabase Storage
        console.log(`📤 Uploading to: ${filePath}`);
        const { data: uploadData, error: uploadError } = await adminSupabase.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .upload(filePath, processedImage.processed.buffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          console.error(`❌ Upload error for ${file.name}:`, uploadError);
          uploadResults.push({
            success: false,
            filename: file.name,
            error: `Upload failed: ${uploadError.message}`
          });
          continue;
        }
        
        console.log(`✅ Uploaded: ${file.name} -> ${uploadData?.path}`);

        // Get public URL
        const { data: { publicUrl } } = adminSupabase.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .getPublicUrl(filePath);

        // Get current max order for this user
        const existingHeaders = await prisma.propertySnapHeader.findMany({
          where: { userId },
          select: { order: true },
          orderBy: { order: 'desc' },
          take: 1
        });

        const nextOrder = existingHeaders.length > 0 
          ? existingHeaders[0].order + 1 
          : 1;

        // Save to database using Prisma
        const headerData = await prisma.propertySnapHeader.create({
          data: {
            userId: userId,
            fileName: filename,
            url: publicUrl,
            path: filePath,
            order: nextOrder,
            autoSlide: autoSlide,
            slideDelay: slideDelay,
            isActive: true
          }
        });

        console.log(`💾 Saved to database: ${headerData.id}`);

        uploadResults.push({
          success: true,
          filename: file.name,
          originalSize: processedImage.original.size,
          compressedSize: processedImage.processed.size,
          savings: Math.round((1 - processedImage.processed.size / processedImage.original.size) * 100),
          data: {
            id: headerData.id,
            url: publicUrl,
            fileName: filename,
            order: nextOrder
          }
        });

      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          code: error.code
        });
        
        uploadResults.push({
          success: false,
          filename: file.name,
          error: error.message || 'Unknown error during processing'
        });
      }
    }
    
    console.log(`✅ Upload complete: ${uploadResults.filter(r => r.success).length}/${uploadResults.length} successful`);

    // Count successful uploads
    const successful = uploadResults.filter(r => r.success);
    
    return NextResponse.json({
      success: true,
      total: files.length,
      successful: successful.length,
      failed: uploadResults.length - successful.length,
      results: uploadResults
    });

  } catch (error) {
    console.error('Error uploading headers:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload headers',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

