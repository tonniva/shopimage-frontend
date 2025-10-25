// lib/storage-server.js
import { createServerSupabaseAdmin } from '@/utils/supabase/server';
import { processImageServer, validateImageServer } from '@/lib/image-processing-server';

// Storage bucket configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'shopimage',
  PROPERTY_SNAP_FOLDER: 'property-snap',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  THUMBNAIL_SIZES: {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 800, height: 600 }
  }
};

/**
 * Upload image to Supabase Storage (Server-side)
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID for folder organization
 * @param {string} reportId - Property report ID
 * @param {string} filename - Custom filename (optional)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export async function uploadPropertyImageServer(file, userId, reportId, filename = null) {
  try {
    // Use admin client to bypass RLS policies
    const supabase = createServerSupabaseAdmin();

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Validate image
    const validation = await validateImageServer(imageBuffer, file.name);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Process image (convert to WebP, generate thumbnails)
    const processedImage = await processImageServer(imageBuffer, file.name, {
      generateThumbnails: true,
      quality: 85
    });

    if (!processedImage.success) {
      throw new Error(`Image processing failed: ${processedImage.error}`);
    }

    // Generate filename if not provided
    const timestamp = Date.now();
    const finalFilename = filename || `img_${timestamp}.jpg`;
    
    // Create storage paths
    const mainImagePath = `${STORAGE_CONFIG.PROPERTY_SNAP_FOLDER}/${userId}/${reportId}/${finalFilename}`;
    const thumbnailPaths = {};

    // Upload main processed image
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(mainImagePath, processedImage.processed.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Upload thumbnails
    for (const [sizeName, thumbnail] of Object.entries(processedImage.thumbnails)) {
      if (thumbnail) {
        const thumbnailFilename = `thumb_${sizeName}_${timestamp}.jpg`;
        const thumbnailPath = `${STORAGE_CONFIG.PROPERTY_SNAP_FOLDER}/${userId}/${reportId}/${thumbnailFilename}`;
        
        const { error: thumbError } = await supabase.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .upload(thumbnailPath, thumbnail.buffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          });

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage
            .from(STORAGE_CONFIG.BUCKET_NAME)
            .getPublicUrl(thumbnailPath);
          
          thumbnailPaths[sizeName] = {
            path: thumbnailPath,
            url: thumbUrlData.publicUrl,
            filename: thumbnailFilename,
            size: thumbnail.size
          };
        }
      }
    }

    // Get public URL for main image
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(mainImagePath);

    return {
      success: true,
      path: mainImagePath,
      url: urlData.publicUrl,
      filename: finalFilename,
      size: processedImage.processed.size,
      originalSize: processedImage.original.size,
      type: 'image/webp',
      uploadedAt: new Date().toISOString(),
      thumbnails: thumbnailPaths,
      metadata: {
        width: processedImage.processed.width,
        height: processedImage.processed.height,
        format: processedImage.processed.format,
        compressionRatio: Math.round(((processedImage.original.size - processedImage.processed.size) / processedImage.original.size) * 100)
      }
    };

  } catch (error) {
    console.error('Error uploading image (server):', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload multiple images for a property report (Server-side)
 * @param {File[]} files - Array of image files
 * @param {string} userId - User ID
 * @param {string} reportId - Property report ID
 * @returns {Promise<Object[]>} Array of upload results
 */
export async function uploadPropertyImagesServer(files, userId, reportId) {
  const uploadPromises = files.map((file, index) => {
    const filename = `image_${index + 1}_${Date.now()}.jpg`;
    return uploadPropertyImageServer(file, userId, reportId, filename);
  });

  const results = await Promise.all(uploadPromises);
  
  return results.map((result, index) => ({
    ...result,
    isPrimary: index === 0,
    sortOrder: index,
    thumbnailUrl: result.success && result.thumbnails?.small ? result.thumbnails.small.url : null
  }));
}

/**
 * Generate thumbnail URL from main image URL (Server-side)
 * @param {string} originalUrl - Original image URL
 * @param {string} size - Thumbnail size (small, medium, large)
 * @returns {string} Thumbnail URL
 */
export function generateThumbnailUrlServer(originalUrl, size = 'small') {
  if (!originalUrl) return null;
  
  // For now, return the same URL (will be replaced with actual thumbnail generation)
  // In production, this would generate actual thumbnails
  return originalUrl;
}

/**
 * Delete image from storage (Server-side)
 * @param {string} path - Storage path of the image
 * @returns {Promise<boolean>} Success status
 */
export async function deletePropertyImageServer(path) {
  try {
    const supabase = await createServerSupabase();
    
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting image (server):', error);
    return false;
  }
}

/**
 * Delete all images for a property report (Server-side)
 * @param {string} userId - User ID
 * @param {string} reportId - Property report ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePropertyReportImagesServer(userId, reportId) {
  try {
    const supabase = await createServerSupabase();
    const folderPath = `${STORAGE_CONFIG.PROPERTY_SNAP_FOLDER}/${userId}/${reportId}`;
    
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(folderPath);

    if (listError) {
      throw new Error(`List files failed: ${listError.message}`);
    }

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${folderPath}/${file.name}`);
      
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        throw new Error(`Delete files failed: ${deleteError.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting report images (server):', error);
    return false;
  }
}

/**
 * Get storage usage for a user (Server-side)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Storage usage information
 */
export async function getUserStorageUsageServer(userId) {
  try {
    const supabase = await createServerSupabase();
    const folderPath = `${STORAGE_CONFIG.PROPERTY_SNAP_FOLDER}/${userId}`;
    
    const { data: files, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(folderPath, {
        limit: 1000,
        offset: 0
      });

    if (error) {
      throw new Error(`Get storage usage failed: ${error.message}`);
    }

    let totalSize = 0;
    let fileCount = 0;

    // Recursively calculate size for all files
    const calculateSize = async (files, currentPath = '') => {
      for (const file of files) {
        if (file.metadata) {
          // It's a file
          totalSize += file.metadata.size || 0;
          fileCount++;
        } else {
          // It's a folder, list its contents
          const { data: subFiles } = await supabase.storage
            .from(STORAGE_CONFIG.BUCKET_NAME)
            .list(`${currentPath}/${file.name}`);
          
          if (subFiles) {
            await calculateSize(subFiles, `${currentPath}/${file.name}`);
          }
        }
      }
    };

    if (files) {
      await calculateSize(files, folderPath);
    }

    return {
      totalSize,
      fileCount,
      totalSizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      limitMB: 1000 // 1GB limit per user
    };

  } catch (error) {
    console.error('Error getting storage usage (server):', error);
    return {
      totalSize: 0,
      fileCount: 0,
      totalSizeMB: 0,
      limitMB: 1000,
      error: error.message
    };
  }
}

/**
 * Create storage folder structure for a new user (Server-side)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function createUserStorageFolderServer(userId) {
  try {
    const supabase = await createServerSupabase();
    
    // Create a dummy file to ensure folder exists
    const dummyPath = `${STORAGE_CONFIG.PROPERTY_SNAP_FOLDER}/${userId}/.gitkeep`;
    const dummyContent = new Blob([''], { type: 'text/plain' });
    
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(dummyPath, dummyContent);

    if (error && !error.message.includes('already exists')) {
      throw new Error(`Create folder failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error creating user storage folder (server):', error);
    return false;
  }
}
