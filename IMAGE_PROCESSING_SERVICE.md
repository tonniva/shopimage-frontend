# Image Processing Service Documentation

This document describes the comprehensive image processing service for the Property Snap feature, including WebP conversion, thumbnail generation, and client-side optimization.

## Overview

The image processing service provides:
- **WebP Conversion**: Automatic conversion of images to WebP format for better compression
- **Thumbnail Generation**: Multiple thumbnail sizes (small, medium, large)
- **Client-side Compression**: Pre-upload compression to reduce bandwidth
- **Server-side Processing**: Advanced processing with Sharp library
- **Progress Tracking**: Real-time processing progress and results
- **Error Handling**: Comprehensive validation and error reporting

## Architecture

### Client-Side Processing
- **File Validation**: Type, size, and format validation
- **Compression**: Canvas-based compression before upload
- **Progress Tracking**: Real-time feedback to users
- **Error Handling**: Graceful handling of processing failures

### Server-Side Processing
- **Sharp Integration**: High-performance image processing
- **WebP Conversion**: Automatic format conversion
- **Thumbnail Generation**: Multiple sizes with optimized quality
- **Storage Integration**: Direct upload to Supabase Storage

## File Structure

```
lib/
├── image-processing.js          # Client-side image processing
├── image-processing-server.js   # Server-side image processing
└── storage-server.js           # Updated with image processing

hooks/
└── useImageProcessing.js       # React hook for image processing

components/
└── ImageProcessingProgress.js  # Progress modal component

utils/
└── image-utils.js              # Client-side utilities

app/api/property-snap/
└── process-images/route.js    # Image processing API endpoint
```

## Configuration

### Image Processing Settings
```javascript
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
  OUTPUT_FORMAT: 'webp'
};
```

### Client-Side Settings
```javascript
export const CLIENT_IMAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  QUALITY: 0.85,
  SUPPORTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};
```

## API Endpoints

### Process Images
```
POST /api/property-snap/process-images
Content-Type: multipart/form-data

FormData:
- images: File[] (multiple files)
- options: JSON string with processing options

Response:
{
  "success": true,
  "processedImages": [...],
  "errors": [...],
  "totalImages": 5,
  "processedCount": 4,
  "errorCount": 1
}
```

### Get Image Metadata
```
GET /api/property-snap/process-images?url={imageUrl}

Response:
{
  "success": true,
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpeg",
    "size": 2048576,
    "hasAlpha": false,
    "channels": 3,
    "density": 72,
    "space": "srgb"
  }
}
```

## Usage Examples

### Client-Side Processing
```javascript
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { validateImageFile, compressImages } from '@/utils/image-utils';

const { processImages, processing, progress, error } = useImageProcessing();

// Validate files
const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.errors);
}

// Compress images
const compressedFiles = await compressImages(files);

// Process images
const result = await processImages(files, {
  quality: 85,
  maxWidth: 2048,
  maxHeight: 2048
});
```

### Server-Side Processing
```javascript
import { processImageServer, validateImageServer } from '@/lib/image-processing-server';

// Validate image
const validation = await validateImageServer(imageBuffer, filename);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Process image
const result = await processImageServer(imageBuffer, filename, {
  generateThumbnails: true,
  quality: 85,
  maxWidth: 2048,
  maxHeight: 2048
});
```

### React Component Integration
```javascript
import ImageProcessingProgress from '@/components/ImageProcessingProgress';

<ImageProcessingProgress
  processing={processing}
  progress={progress}
  error={error}
  results={results}
  onClose={() => setShowModal(false)}
/>
```

## Processing Pipeline

### 1. File Validation
- **Type Check**: Verify supported image formats
- **Size Check**: Ensure file size within limits
- **Dimension Check**: Validate minimum dimensions
- **Corruption Check**: Verify file integrity

### 2. Client-Side Compression
- **Canvas Processing**: Use HTML5 Canvas for compression
- **Quality Adjustment**: Dynamic quality based on file size
- **Format Conversion**: Convert to WebP for better compression
- **Dimension Optimization**: Resize while maintaining aspect ratio

### 3. Server-Side Processing
- **Sharp Processing**: High-performance image manipulation
- **WebP Conversion**: Automatic format conversion
- **Thumbnail Generation**: Multiple sizes with optimized quality
- **Metadata Extraction**: Extract and store image information

### 4. Storage Upload
- **Supabase Integration**: Direct upload to storage
- **Path Organization**: Structured folder hierarchy
- **URL Generation**: Public URL generation
- **Error Handling**: Graceful failure handling

## Performance Optimizations

### Client-Side
- **Canvas Compression**: Reduces upload size by 60-80%
- **Progressive Loading**: Process images in batches
- **Memory Management**: Proper cleanup of object URLs
- **Validation**: Early validation to prevent unnecessary processing

### Server-Side
- **Sharp Library**: High-performance C++ image processing
- **Parallel Processing**: Process multiple images concurrently
- **Memory Optimization**: Efficient buffer management
- **Caching**: Cache processed thumbnails

## Error Handling

### Validation Errors
- **File Type**: Unsupported format detection
- **File Size**: Size limit exceeded
- **Dimensions**: Invalid image dimensions
- **Corruption**: File integrity issues

### Processing Errors
- **Memory Issues**: Large file handling
- **Format Issues**: Conversion failures
- **Network Issues**: Upload failures
- **Storage Issues**: Supabase errors

### User Feedback
- **Progress Indicators**: Real-time processing status
- **Error Messages**: Clear error descriptions
- **Retry Options**: Ability to retry failed operations
- **Fallback Handling**: Graceful degradation

## Storage Structure

### File Organization
```
shopimage/
└── property-snap/
    └── {userId}/
        └── {reportId}/
            ├── image_1_timestamp.webp      # Main image
            ├── thumb_small_timestamp.webp # Small thumbnail
            ├── thumb_medium_timestamp.webp # Medium thumbnail
            └── thumb_large_timestamp.webp # Large thumbnail
```

### Metadata Storage
```json
{
  "id": "uuid",
  "filename": "image_1_1234567890.webp",
  "originalFilename": "house.jpg",
  "fileSize": 2048576,
  "originalSize": 5242880,
  "mimeType": "image/webp",
  "storagePath": "property-snap/userId/reportId/image_1_1234567890.webp",
  "url": "https://supabase-url/storage/v1/object/public/shopimage/...",
  "thumbnails": {
    "small": {
      "url": "https://supabase-url/storage/v1/object/public/shopimage/...",
      "size": 51200
    },
    "medium": {
      "url": "https://supabase-url/storage/v1/object/public/shopimage/...",
      "size": 102400
    },
    "large": {
      "url": "https://supabase-url/storage/v1/object/public/shopimage/...",
      "size": 204800
    }
  },
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "webp",
    "compressionRatio": 61
  },
  "isPrimary": true,
  "sortOrder": 0,
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

## Quality Settings

### Compression Levels
- **High Quality**: 90% (for important images)
- **Standard Quality**: 85% (default)
- **Optimized Quality**: 75% (for large files)
- **Thumbnail Quality**: 75% (for thumbnails)

### Size Optimization
- **Large Files (>8MB)**: Aggressive compression
- **Medium Files (2-8MB)**: Standard compression
- **Small Files (<2MB)**: Light compression
- **Thumbnails**: Optimized for size

## Monitoring and Analytics

### Processing Metrics
- **Success Rate**: Percentage of successful processing
- **Compression Ratio**: Average size reduction
- **Processing Time**: Average processing duration
- **Error Rate**: Percentage of failed processing

### User Experience Metrics
- **Upload Time**: Time from selection to completion
- **Progress Feedback**: User satisfaction with progress indicators
- **Error Recovery**: Success rate of retry operations
- **Storage Usage**: User storage consumption

## Security Considerations

### File Validation
- **Type Verification**: Strict file type checking
- **Size Limits**: Enforced file size restrictions
- **Content Scanning**: Basic file integrity checks
- **Path Sanitization**: Safe file path generation

### Access Control
- **User Authentication**: Required for all operations
- **Storage Policies**: RLS policies for file access
- **Rate Limiting**: Prevent abuse of processing resources
- **Audit Logging**: Track all processing operations

## Future Enhancements

### Advanced Features
- **AI-Powered Optimization**: Smart quality adjustment
- **Batch Processing**: Process multiple reports
- **Format Detection**: Automatic format optimization
- **Watermarking**: Add watermarks to images

### Performance Improvements
- **CDN Integration**: Global image delivery
- **Progressive Loading**: Load images progressively
- **Lazy Loading**: Load images on demand
- **Caching**: Advanced caching strategies

### User Experience
- **Drag & Drop**: Enhanced file selection
- **Preview**: Real-time image preview
- **Editing**: Basic image editing tools
- **Filters**: Apply image filters

## Troubleshooting

### Common Issues
1. **Large File Uploads**: Increase timeout settings
2. **Memory Issues**: Process images in smaller batches
3. **Format Issues**: Ensure proper MIME type handling
4. **Storage Issues**: Check Supabase configuration

### Debug Tools
- **Processing Logs**: Detailed processing information
- **Error Tracking**: Comprehensive error reporting
- **Performance Metrics**: Processing time analysis
- **Storage Monitoring**: Storage usage tracking

## Dependencies

### Required Packages
```json
{
  "sharp": "^0.33.0",
  "jimp": "^0.22.10"
}
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

This comprehensive image processing service provides efficient, secure, and user-friendly image handling for the Property Snap feature, ensuring optimal performance and user experience.
