# Property Snap Storage Structure

This document describes the Supabase Storage structure for the Property Snap feature.

## Storage Configuration

### Bucket: `shopimage`
- **Purpose**: Store all Property Snap images
- **Location**: Supabase Storage
- **Access**: Authenticated users only

### Folder Structure
```
shopimage/
└── property-snap/
    └── {userId}/
        └── {reportId}/
            ├── image_1_timestamp.jpg
            ├── image_2_timestamp.jpg
            └── image_3_timestamp.webp
```

## File Organization

### User Folder
- Each user has their own folder: `property-snap/{userId}/`
- User ID is the Supabase Auth UID
- Prevents cross-user access

### Report Folder
- Each property report has its own subfolder: `{userId}/{reportId}/`
- Report ID is a UUID generated for each report
- Allows easy cleanup when reports are deleted

### Image Files
- **Naming**: `image_{index}_{timestamp}.{extension}`
- **Formats**: JPEG, PNG, WebP
- **Size Limit**: 10MB per file
- **Thumbnails**: Generated automatically (planned)

## API Endpoints

### Upload Images
```
POST /api/property-snap/upload
Content-Type: multipart/form-data

FormData:
- images: File[] (multiple files)
- reportId: string
```

### Get Storage Usage
```
GET /api/property-snap/storage

Response:
{
  "success": true,
  "storage": {
    "used": 45.2,
    "limit": 100,
    "usagePercent": 45,
    "fileCount": 12,
    "remaining": 54.8
  },
  "reports": {
    "used": 2,
    "limit": 3,
    "usagePercent": 67,
    "remaining": 1
  },
  "plan": {
    "name": "FREE",
    "limits": {
      "storageMB": 100,
      "reports": 3
    }
  }
}
```

### Delete Images
```
DELETE /api/property-snap/upload?reportId={reportId}&imagePath={path}
```

## Storage Policies

### Row Level Security (RLS)
- All storage operations are protected by RLS policies
- Users can only access their own files
- Public shared reports allow viewing of images

### Policies Applied
1. **Upload Policy**: Users can upload to their own folder
2. **View Policy**: Users can view their own images + public shared images
3. **Update Policy**: Users can update their own images
4. **Delete Policy**: Users can delete their own images

## Usage Limits by Plan

### FREE Plan
- **Storage**: 100MB
- **Reports**: 3 reports
- **Files**: Unlimited per report

### PRO Plan
- **Storage**: 1GB
- **Reports**: 50 reports
- **Files**: Unlimited per report

### BUSINESS Plan
- **Storage**: 5GB
- **Reports**: 200 reports
- **Files**: Unlimited per report

## Client-Side Usage

### React Hook
```javascript
import { usePropertyStorage } from '@/hooks/usePropertyStorage';

const { uploadImages, getStorageUsage, uploading, error } = usePropertyStorage();

// Upload images
const result = await uploadImages(files, userId, reportId);

// Get usage
const usage = await getStorageUsage(userId);
```

### Storage Component
```javascript
import StorageUsage from '@/components/StorageUsage';

<StorageUsage />
```

## Server-Side Usage

### Upload Images
```javascript
import { uploadPropertyImagesServer } from '@/lib/storage-server';

const results = await uploadPropertyImagesServer(files, userId, reportId);
```

### Delete Images
```javascript
import { deletePropertyReportImagesServer } from '@/lib/storage-server';

const success = await deletePropertyReportImagesServer(userId, reportId);
```

## Database Integration

### PropertyReport Model
```prisma
model PropertyReport {
  userImages Json // Array of image metadata
  // ... other fields
}
```

### Image Metadata Structure
```json
{
  "id": "uuid",
  "filename": "image_1_1234567890.jpg",
  "originalFilename": "house.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "storagePath": "property-snap/userId/reportId/image_1_1234567890.jpg",
  "url": "https://supabase-url/storage/v1/object/public/shopimage/...",
  "thumbnailUrl": "https://supabase-url/storage/v1/object/public/shopimage/...",
  "isPrimary": true,
  "sortOrder": 0,
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

## Security Features

### Authentication
- All operations require Supabase authentication
- User ID is extracted from JWT token

### Authorization
- RLS policies prevent unauthorized access
- Users can only access their own files
- Public sharing allows viewing without authentication

### File Validation
- File type validation (JPEG, PNG, WebP only)
- File size limits (10MB per file)
- Filename sanitization

## Cleanup and Maintenance

### Orphaned Files
- Function `cleanup_orphaned_property_images()` removes unreferenced files
- Run periodically to clean up storage

### Storage Usage Monitoring
- Function `get_user_storage_usage()` calculates user storage
- Used for quota enforcement and billing

## Error Handling

### Upload Failures
- Individual file failures don't stop the entire upload
- Failed uploads are reported back to client
- Retry mechanism for transient failures

### Storage Quota
- Warnings when approaching limits
- Hard limits prevent exceeding quota
- Upgrade prompts for free users

## Future Enhancements

### Image Processing
- Automatic WebP conversion
- Thumbnail generation
- Image optimization
- Watermarking

### CDN Integration
- CloudFlare or similar CDN
- Global image delivery
- Caching optimization

### Advanced Features
- Image compression
- Batch operations
- Image metadata extraction
- AI-powered image analysis
