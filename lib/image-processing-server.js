// lib/image-processing-server.js
import sharp from 'sharp';

// Image processing configuration
export const IMAGE_CONFIG = {
  // Quality settings
  WEBP_QUALITY: 85,
  JPEG_QUALITY: 90,
  PNG_COMPRESSION: 9,
  
  // Size limits
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Thumbnail sizes
  THUMBNAIL_SIZES: {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 800, height: 600 }
  },
  
  // Supported formats
  SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'webp'],
  OUTPUT_FORMAT: 'jpeg'
};

/**
 * Process and optimize an image file (Server-side)
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} originalFilename - Original filename
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed image data
 */
export async function processImageServer(imageBuffer, originalFilename, options = {}) {
  try {
    const {
      generateThumbnails = true,
      maxWidth = IMAGE_CONFIG.MAX_WIDTH,
      maxHeight = IMAGE_CONFIG.MAX_HEIGHT,
      quality = IMAGE_CONFIG.JPEG_QUALITY
    } = options;

    // Validate file size
    if (imageBuffer.length > IMAGE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!IMAGE_CONFIG.SUPPORTED_FORMATS.includes(metadata.format)) {
      throw new Error(`Unsupported image format: ${metadata.format}`);
    }

    // Calculate new dimensions while maintaining aspect ratio
    const { width: newWidth, height: newHeight } = calculateDimensionsServer(
      metadata.width,
      metadata.height,
      maxWidth,
      maxHeight
    );

    // Process main image
    const processedBuffer = await sharp(imageBuffer)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toBuffer();

    const result = {
      success: true,
      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length
      },
      processed: {
        width: newWidth,
        height: newHeight,
        format: IMAGE_CONFIG.OUTPUT_FORMAT,
        size: processedBuffer.length,
        buffer: processedBuffer
      },
      thumbnails: {}
    };

    // Generate thumbnails if requested
    if (generateThumbnails) {
      for (const [sizeName, dimensions] of Object.entries(IMAGE_CONFIG.THUMBNAIL_SIZES)) {
        try {
          const thumbnailBuffer = await sharp(imageBuffer)
            .resize(dimensions.width, dimensions.height, {
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: quality - 10 }) // Slightly lower quality for thumbnails
            .toBuffer();

          result.thumbnails[sizeName] = {
            width: dimensions.width,
            height: dimensions.height,
            size: thumbnailBuffer.length,
            buffer: thumbnailBuffer
          };
        } catch (error) {
          console.error(`Failed to generate ${sizeName} thumbnail:`, error);
          result.thumbnails[sizeName] = null;
        }
      }
    }

    return result;

  } catch (error) {
    console.error('Image processing error (server):', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Process multiple images (Server-side)
 * @param {Array} images - Array of image objects with buffer and filename
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Array of processed image results
 */
export async function processImagesServer(images, options = {}) {
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`Processing image ${i + 1}/${images.length}: ${image.filename}`);
    
    const result = await processImageServer(image.buffer, image.filename, options);
    results.push({
      ...result,
      filename: image.filename,
      index: i
    });
  }
  
  return results;
}

/**
 * Calculate new dimensions while maintaining aspect ratio (Server-side)
 * @param {number} originalWidth - Original width
 * @param {number} originalHeight - Original height
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Object} New dimensions
 */
function calculateDimensionsServer(originalWidth, originalHeight, maxWidth, maxHeight) {
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
 * Generate thumbnail from image buffer (Server-side)
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} size - Thumbnail size (small, medium, large)
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Thumbnail data
 */
export async function generateThumbnailServer(imageBuffer, size = 'small', options = {}) {
  try {
    const dimensions = IMAGE_CONFIG.THUMBNAIL_SIZES[size];
    if (!dimensions) {
      throw new Error(`Invalid thumbnail size: ${size}`);
    }

    const { quality = IMAGE_CONFIG.WEBP_QUALITY - 10 } = options;

    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toBuffer();

    return {
      success: true,
      width: dimensions.width,
      height: dimensions.height,
      size: thumbnailBuffer.length,
      buffer: thumbnailBuffer,
      format: IMAGE_CONFIG.OUTPUT_FORMAT
    };

  } catch (error) {
    console.error('Thumbnail generation error (server):', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Convert image to WebP format (Server-side)
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} Conversion result
 */
export async function convertToWebPServer(imageBuffer, options = {}) {
  try {
    const { quality = IMAGE_CONFIG.WEBP_QUALITY } = options;

    const webpBuffer = await sharp(imageBuffer)
      .jpeg({ quality })
      .toBuffer();

    const originalSize = imageBuffer.length;
    const webpSize = webpBuffer.length;
    const compressionRatio = Math.round(((originalSize - webpSize) / originalSize) * 100);

    return {
      success: true,
      buffer: webpBuffer,
      originalSize,
      webpSize,
      compressionRatio,
      format: 'webp'
    };

  } catch (error) {
    console.error('WebP conversion error (server):', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract image metadata (Server-side)
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} Image metadata
 */
export async function getImageMetadataServer(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    return {
      success: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels,
      density: metadata.density,
      space: metadata.space
    };

  } catch (error) {
    console.error('Metadata extraction error (server):', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate image file (Server-side)
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Validation result
 */
export async function validateImageServer(imageBuffer, filename) {
  try {
    // Check file size
    if (imageBuffer.length > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`
      };
    }

    // Check if it's a valid image
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!IMAGE_CONFIG.SUPPORTED_FORMATS.includes(metadata.format)) {
      return {
        valid: false,
        error: `Unsupported format: ${metadata.format}. Supported formats: ${IMAGE_CONFIG.SUPPORTED_FORMATS.join(', ')}`
      };
    }

    // Check dimensions
    if (metadata.width < 10 || metadata.height < 10) {
      return {
        valid: false,
        error: 'Image dimensions too small (minimum 10x10 pixels)'
      };
    }

    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: 'Invalid image file'
    };
  }
}
