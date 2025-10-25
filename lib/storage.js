// lib/storage.js
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Storage bucket configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'shopimage',
  PROPERTY_SNAP_FOLDER: 'property-snap',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  THUMBNAIL_SIZES: {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 800, height: 600 }
  }
};

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID for folder organization
 * @param {string} reportId - Property report ID
 * @param {string} filename - Custom filename (optional)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export async function uploadPropertyImage(file, userId, reportId, filename = null) {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`);
    }

    // Generate filename if not provided
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const finalFilename = filename || `img_${timestamp}.${fileExtension}`;
    
    // Create storage path
    const storagePath = `${STORAGE_CONFIG.PROPERTY_SNAP_FOLDER}/${userId}/${reportId}/${finalFilename}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      success: true,
      path: storagePath,
      url: urlData.publicUrl,
      filename: finalFilename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload multiple images for a property report
 * @param {File[]} files - Array of image files
 * @param {string} userId - User ID
 * @param {string} reportId - Property report ID
 * @returns {Promise<Object[]>} Array of upload results
 */
export async function uploadPropertyImages(files, userId, reportId) {
  const uploadPromises = files.map((file, index) => {
    const filename = `image_${index + 1}_${Date.now()}.${file.name.split('.').pop()}`;
    return uploadPropertyImage(file, userId, reportId, filename);
  });

  const results = await Promise.all(uploadPromises);
  
  return results.map((result, index) => ({
    ...result,
    isPrimary: index === 0,
    sortOrder: index,
    thumbnailUrl: result.success ? generateThumbnailUrl(result.url, 'small') : null
  }));
}

/**
 * Generate thumbnail URL from main image URL
 * @param {string} originalUrl - Original image URL
 * @param {string} size - Thumbnail size (small, medium, large)
 * @returns {string} Thumbnail URL
 */
export function generateThumbnailUrl(originalUrl, size = 'small') {
  if (!originalUrl) return null;
  
  // For now, return the same URL (will be replaced with actual thumbnail generation)
  // In production, this would generate actual thumbnails
  return originalUrl;
}

/**
 * Delete image from storage
 * @param {string} path - Storage path of the image
 * @returns {Promise<boolean>} Success status
 */
export async function deletePropertyImage(path) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Delete all images for a property report
 * @param {string} userId - User ID
 * @param {string} reportId - Property report ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePropertyReportImages(userId, reportId) {
  try {
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
    console.error('Error deleting report images:', error);
    return false;
  }
}

/**
 * Get storage usage for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Storage usage information
 */
export async function getUserStorageUsage(userId) {
  try {
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
    console.error('Error getting storage usage:', error);
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
 * Create storage folder structure for a new user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function createUserStorageFolder(userId) {
  try {
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
    console.error('Error creating user storage folder:', error);
    return false;
  }
}
