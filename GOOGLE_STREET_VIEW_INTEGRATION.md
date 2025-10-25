# Google Street View API Integration Documentation

This document describes the comprehensive Google Street View API integration for the Property Snap feature, providing 360-degree street-level imagery and panoramic views.

## Overview

The Google Street View API integration provides:
- **360-Degree Imagery**: Full panoramic street-level views
- **Multiple Angles**: Images from different directions (North, East, South, West)
- **Custom Parameters**: Adjustable heading, pitch, FOV, and image quality
- **Property-Specific Views**: Optimized angles for different property types
- **High-Quality Images**: Multiple resolution and quality options
- **Availability Checking**: Verify Street View coverage before generation
- **Interactive Display**: Fullscreen viewing and navigation controls
- **Download Support**: Save images locally

## Architecture

### Service Layer
- **Google Street View Library**: Core service using @googlemaps/google-maps-services-js
- **API Routes**: RESTful endpoints for different Street View operations
- **React Hooks**: Custom hooks for client-side integration
- **Components**: Interactive UI components for Street View display

### Data Flow
1. **Client Request** → API Route
2. **API Route** → Google Street View Service
3. **Google Street View Service** → Google Street View API
4. **Response Processing** → Image URL Generation
5. **Formatted Response** → Client Display

## File Structure

```
lib/
└── google-street-view.js          # Core Street View service

app/api/google-street-view/
├── metadata/route.js              # Street View metadata
├── image/route.js                 # Single image generation
├── multiple/route.js              # Multiple images
├── property/route.js              # Property-specific images
└── availability/route.js         # Availability checking

hooks/
└── useGoogleStreetView.js         # React hook for Street View

components/
├── StreetViewDisplay.js           # Image display component
└── StreetViewControls.js          # Control interface component

utils/
└── street-view-utils.js          # Utility functions
```

## API Endpoints

### Street View Metadata
```
POST /api/google-street-view/metadata
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "heading": 0,
  "pitch": 0,
  "fov": 90,
  "radius": 50
}

Response:
{
  "success": true,
  "metadata": {
    "status": "OK",
    "location": {
      "lat": 13.7563,
      "lng": 100.5018
    },
    "pano_id": "CAoSLEFGMVFpcE5...",
    "date": "2023-01-01",
    "copyright": "©2023 Google",
    "image_width": 2048,
    "image_height": 1024
  }
}
```

### Single Street View Image
```
POST /api/google-street-view/image
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "size": {
    "width": 640,
    "height": 480
  },
  "heading": 0,
  "pitch": 0,
  "fov": 90,
  "format": "jpg",
  "quality": 2
}

Response:
{
  "success": true,
  "imageUrl": "https://maps.googleapis.com/maps/api/streetview?...",
  "parameters": {...}
}
```

### Multiple Street View Images
```
POST /api/google-street-view/multiple
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "size": {
    "width": 640,
    "height": 480
  },
  "angles": [0, 90, 180, 270],
  "quality": 2
}

Response:
{
  "success": true,
  "images": [
    {
      "angle": 0,
      "heading": 0,
      "direction": "เหนือ",
      "url": "https://maps.googleapis.com/maps/api/streetview?...",
      "metadata": {...}
    }
  ],
  "totalImages": 4
}
```

### Property Street View Images
```
POST /api/google-street-view/property
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "propertyType": "house",
  "size": {
    "width": 640,
    "height": 480
  },
  "quality": 3
}

Response:
{
  "success": true,
  "images": [
    {
      "angle": 0,
      "direction": "เหนือ",
      "purpose": "front_view",
      "description": "มุมมองด้านหน้าของhouse",
      "url": "https://maps.googleapis.com/maps/api/streetview?..."
    }
  ],
  "metadata": {...}
}
```

### Availability Check
```
POST /api/google-street-view/availability
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "radius": 50
}

Response:
{
  "success": true,
  "available": true,
  "metadata": {...},
  "error": null
}
```

## Configuration

### Environment Variables
```env
GOOGLE_STREET_VIEW_API_KEY=your_google_street_view_api_key
# or use the same key as Google Places
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### Service Configuration
```javascript
export const STREET_VIEW_CONFIG = {
  API_KEY: process.env.GOOGLE_STREET_VIEW_API_KEY || process.env.GOOGLE_PLACES_API_KEY,
  DEFAULT_SIZE: { width: 640, height: 480 },
  MAX_SIZE: { width: 640, height: 640 },
  MIN_SIZE: { width: 100, height: 100 },
  DEFAULT_FOV: 90,
  MIN_FOV: 10,
  MAX_FOV: 120,
  DEFAULT_PITCH: 0,
  MIN_PITCH: -90,
  MAX_PITCH: 90,
  DEFAULT_HEADING: 0,
  MIN_HEADING: 0,
  MAX_HEADING: 360,
  SUPPORTED_FORMATS: ['jpg', 'png'],
  DEFAULT_FORMAT: 'jpg',
  QUALITY_LEVELS: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3
  }
};
```

## Usage Examples

### React Hook Usage
```javascript
import { useGoogleStreetView } from '@/hooks/useGoogleStreetView';

const { 
  loading, 
  error, 
  getMultipleImages, 
  getPropertyImages,
  checkAvailability 
} = useGoogleStreetView();

// Check availability
const availability = await checkAvailability(location);

// Get multiple images
const result = await getMultipleImages({
  location: { lat: 13.7563, lng: 100.5018 },
  size: { width: 640, height: 480 },
  angles: [0, 90, 180, 270],
  quality: 2
});

// Get property images
const propertyImages = await getPropertyImages({
  location: { lat: 13.7563, lng: 100.5018 },
  propertyType: 'house',
  quality: 3
});
```

### Component Usage
```javascript
import StreetViewControls from '@/components/StreetViewControls';
import StreetViewDisplay from '@/components/StreetViewDisplay';

// Control component
<StreetViewControls
  location={location}
  onImagesGenerated={handleImagesGenerated}
  showAdvancedControls={true}
/>

// Display component
<StreetViewDisplay
  images={streetViewImages}
  loading={loading}
  error={error}
  showControls={true}
  showMetadata={true}
/>
```

### Service Usage
```javascript
import { 
  getMultipleStreetViewImages, 
  generateStreetViewImageUrl,
  checkStreetViewAvailability 
} from '@/lib/google-street-view';

// Get multiple images
const result = await getMultipleStreetViewImages({
  location: { lat: 13.7563, lng: 100.5018 },
  angles: [0, 90, 180, 270],
  quality: 2
});

// Generate single image URL
const imageUrl = generateStreetViewImageUrl({
  location: { lat: 13.7563, lng: 100.5018 },
  heading: 0,
  size: { width: 640, height: 480 }
});

// Check availability
const availability = await checkStreetViewAvailability(location);
```

## Data Structure

### Street View Image Object
```javascript
{
  // Basic Info
  angle: 0,
  heading: 0,
  direction: "เหนือ",
  compassDirection: "N",
  
  // Image Data
  url: "https://maps.googleapis.com/maps/api/streetview?...",
  metadata: {
    location: { lat: 13.7563, lng: 100.5018 },
    size: { width: 640, height: 480 },
    heading: 0,
    pitch: 0,
    fov: 90,
    format: "jpg",
    quality: 2
  },
  
  // Property-Specific
  purpose: "front_view",
  description: "มุมมองด้านหน้าของhouse",
  propertyType: "house",
  
  // Display Info
  formattedHeading: "0°",
  formattedPitch: "0°",
  formattedFov: "90°",
  sizeFormatted: "640×480",
  qualityLevel: "กลาง",
  timestamp: "2024-01-01T00:00:00Z"
}
```

### Street View Metadata Object
```javascript
{
  status: "OK",
  location: {
    lat: 13.7563,
    lng: 100.5018
  },
  pano_id: "CAoSLEFGMVFpcE5...",
  date: "2023-01-01",
  copyright: "©2023 Google",
  links: [...],
  projection_type: "spherical",
  motion_type: "linear",
  image_width: 2048,
  image_height: 1024,
  tile_width: 512,
  tile_height: 512
}
```

## Features

### Image Generation
- **Multiple Angles**: Generate images from different directions
- **Custom Parameters**: Adjust heading, pitch, FOV, and quality
- **Size Options**: Various image resolutions
- **Format Support**: JPG and PNG formats
- **Quality Levels**: Low, medium, and high quality options

### Property-Specific Views
- **House**: All four directions (North, East, South, West)
- **Apartment**: All four directions
- **Condo**: All four directions
- **Commercial**: All four directions
- **Land**: All four directions
- **Corner**: All four directions
- **End**: Three directions (front, right, back)
- **Middle**: Two directions (front, back)

### Interactive Display
- **Fullscreen Mode**: Expand images to full screen
- **Navigation Controls**: Previous/next image navigation
- **Thumbnail Gallery**: Quick image selection
- **Direction Labels**: Show compass directions
- **Metadata Display**: Show image parameters
- **Download Support**: Save images locally

### Advanced Controls
- **Size Selection**: Choose image resolution
- **Quality Settings**: Adjust image quality
- **Format Options**: Select image format
- **Angle Customization**: Choose specific angles
- **Parameter Adjustment**: Fine-tune heading, pitch, FOV
- **Property Type**: Select property-specific settings

## Performance Optimizations

### Image Loading
- **Lazy Loading**: Load images on demand
- **Progressive Loading**: Show images as they load
- **Thumbnail Generation**: Quick preview images
- **Caching Strategy**: Cache frequently accessed images

### API Optimization
- **Batch Requests**: Combine multiple API calls
- **Parameter Validation**: Validate inputs before API calls
- **Error Handling**: Graceful error management
- **Rate Limiting**: Respect API quotas

### User Experience
- **Loading States**: Visual feedback during operations
- **Error Recovery**: Retry failed operations
- **Responsive Design**: Mobile-friendly interface
- **Accessibility**: Screen reader support

## Error Handling

### API Errors
- **Invalid Location**: Handle invalid coordinates
- **No Coverage**: Handle areas without Street View
- **Rate Limiting**: Handle API quota exceeded
- **Network Errors**: Handle connection issues

### User Experience
- **Error Messages**: Clear error descriptions
- **Fallback Options**: Alternative actions
- **Retry Mechanisms**: Allow users to retry
- **Offline Support**: Handle network issues

### Error Types
```javascript
// API Errors
{
  error: "INVALID_REQUEST",
  message: "Invalid location coordinates"
}

// Coverage Errors
{
  error: "NO_COVERAGE",
  message: "Street View not available at this location"
}

// Network Errors
{
  error: "NETWORK_ERROR",
  message: "Failed to connect to Street View API"
}
```

## Security Considerations

### API Key Protection
- **Server-side Only**: API key not exposed to client
- **Environment Variables**: Secure key storage
- **Rate Limiting**: Prevent abuse
- **Request Validation**: Validate all inputs

### Data Privacy
- **No Personal Data**: Don't store personal information
- **Location Privacy**: Respect user location privacy
- **Image Rights**: Respect Google's image rights
- **Secure Transmission**: HTTPS only

### Access Control
- **Authentication**: Require user authentication
- **Authorization**: Check user permissions
- **Input Sanitization**: Sanitize all inputs
- **Output Encoding**: Encode all outputs

## Monitoring and Analytics

### Performance Metrics
- **Response Time**: Track API response times
- **Success Rate**: Monitor API success rates
- **Error Rate**: Track error frequencies
- **Usage Patterns**: Analyze usage patterns

### User Analytics
- **Image Generation**: Track image generation requests
- **User Interactions**: Monitor user behavior
- **Feature Usage**: Track feature adoption
- **Download Statistics**: Track image downloads

### Error Tracking
- **Error Logging**: Log all errors
- **Performance Monitoring**: Track performance issues
- **Alert System**: Alert on critical errors
- **Debug Information**: Collect debug data

## Testing

### Unit Tests
- **Service Functions**: Test core functionality
- **Utility Functions**: Test helper functions
- **Error Handling**: Test error scenarios
- **Data Processing**: Test data transformations

### Integration Tests
- **API Endpoints**: Test API routes
- **Google API**: Test Street View integration
- **Component Tests**: Test React components
- **Hook Tests**: Test custom hooks

### End-to-End Tests
- **User Workflows**: Test complete user journeys
- **Image Generation**: Test image generation flows
- **Error Scenarios**: Test error handling
- **Performance Tests**: Test under load

## Future Enhancements

### Advanced Features
- **AI-Powered Views**: Smart angle selection
- **Virtual Tours**: Interactive 360° tours
- **Historical Views**: Time-based Street View
- **Weather Integration**: Weather-aware views

### Performance Improvements
- **CDN Integration**: Global image delivery
- **Advanced Caching**: Multi-layer caching
- **Predictive Loading**: Preload likely images
- **Background Processing**: Process images in background

### User Experience
- **AR Integration**: Augmented reality features
- **Voice Controls**: Voice-activated controls
- **Gesture Support**: Touch and gesture controls
- **Accessibility**: Enhanced accessibility features

## Troubleshooting

### Common Issues
1. **API Key Issues**: Verify API key configuration
2. **No Coverage**: Check Street View availability
3. **Location Errors**: Validate coordinates
4. **Network Issues**: Check connectivity

### Debug Tools
- **API Logging**: Detailed API request logs
- **Error Tracking**: Comprehensive error reporting
- **Performance Monitoring**: Real-time performance data
- **User Analytics**: User behavior insights

### Support Resources
- **Google Street View API Documentation**: Official documentation
- **Community Forums**: Developer community
- **Error Codes**: Comprehensive error code reference
- **Best Practices**: Implementation guidelines

This comprehensive Google Street View API integration provides immersive street-level imagery for Property Snap reports, enabling users to explore properties from multiple angles with high-quality panoramic views and interactive controls.
