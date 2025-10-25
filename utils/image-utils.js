// utils/image-utils.js
/**
 * Client-side image utilities for Property Snap
 */

// Image processing configuration
export const CLIENT_IMAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  QUALITY: 0.85,
  SUPPORTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

/**
 * Compress image on client side before upload
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed file
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = CLIENT_IMAGE_CONFIG.MAX_WIDTH,
    maxHeight = CLIENT_IMAGE_CONFIG.MAX_HEIGHT,
    quality = CLIENT_IMAGE_CONFIG.QUALITY,
    outputFormat = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = calculateClientDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio (Client-side)
 * @param {number} originalWidth - Original width
 * @param {number} originalHeight - Original height
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Object} New dimensions
 */
function calculateClientDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // Scale down if image is too large
  if (originalWidth > maxWidth || originalHeight > maxHeight) {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    newWidth = Math.round(originalWidth * ratio);
    newHeight = Math.round(originalHeight * ratio);
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Validate image file on client side
 * @param {File} file - Image file
 * @returns {Object} Validation result
 */
export function validateImageFile(file) {
  const errors = [];

  // Check file type
  if (!CLIENT_IMAGE_CONFIG.SUPPORTED_TYPES.includes(file.type)) {
    errors.push(`ประเภทไฟล์ไม่รองรับ: ${file.type}`);
  }

  // Check file size
  if (file.size > CLIENT_IMAGE_CONFIG.MAX_FILE_SIZE) {
    errors.push(`ขนาดไฟล์เกิน ${CLIENT_IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check if file is too small
  if (file.size < 1024) {
    errors.push('ไฟล์เล็กเกินไป');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<Object>} Image dimensions
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create thumbnail from image file
 * @param {File} file - Image file
 * @param {Object} options - Thumbnail options
 * @returns {Promise<File>} Thumbnail file
 */
export async function createThumbnail(file, options = {}) {
  const {
    width = 200,
    height = 150,
    quality = 0.8,
    format = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      // Draw image to fill canvas (crop to fit)
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: format,
              lastModified: Date.now()
            });
            resolve(thumbnailFile);
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Batch compress multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} Array of compressed files
 */
export async function compressImages(files, options = {}) {
  const compressedFiles = [];
  
  for (const file of files) {
    try {
      const compressedFile = await compressImage(file, options);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Return original file if compression fails
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
}

/**
 * Calculate compression ratio
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 * @returns {number} Compression ratio percentage
 */
export function calculateCompressionRatio(originalSize, compressedSize) {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if image needs compression
 * @param {File} file - Image file
 * @returns {boolean} Whether image needs compression
 */
export function needsCompression(file) {
  return file.size > CLIENT_IMAGE_CONFIG.MAX_FILE_SIZE ||
         file.type !== 'image/webp';
}

/**
 * Get optimal compression settings based on file
 * @param {File} file - Image file
 * @returns {Object} Compression settings
 */
export function getOptimalCompressionSettings(file) {
  const settings = {
    quality: CLIENT_IMAGE_CONFIG.QUALITY,
    maxWidth: CLIENT_IMAGE_CONFIG.MAX_WIDTH,
    maxHeight: CLIENT_IMAGE_CONFIG.MAX_HEIGHT,
    outputFormat: 'image/webp'
  };

  // Adjust quality based on file size
  if (file.size > 5 * 1024 * 1024) { // > 5MB
    settings.quality = 0.75;
  } else if (file.size > 2 * 1024 * 1024) { // > 2MB
    settings.quality = 0.8;
  }

  // Adjust dimensions based on file size
  if (file.size > 8 * 1024 * 1024) { // > 8MB
    settings.maxWidth = 1600;
    settings.maxHeight = 1600;
  }

  return settings;
}
