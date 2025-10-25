# Google Maps API Integration Documentation

This document describes the comprehensive Google Maps API integration for the Property Snap feature, providing static map generation, directions, geocoding, and distance calculations.

## Overview

The Google Maps API integration provides:
- **Static Map Generation**: High-quality static map images
- **Property Maps**: Maps with property markers and nearby places
- **Transportation Maps**: Maps showing transportation connections
- **Area Overview**: Maps with radius visualization
- **Directions**: Turn-by-turn directions between points
- **Geocoding**: Address to coordinates conversion
- **Reverse Geocoding**: Coordinates to address conversion
- **Distance Calculation**: Distance and duration between points
- **Multiple Map Types**: Roadmap, satellite, hybrid, terrain
- **Custom Markers**: Property, location, and transportation markers
- **Interactive Display**: Fullscreen viewing and navigation controls

## Architecture

### Service Layer
- **Google Maps Library**: Core service using @googlemaps/google-maps-services-js
- **API Routes**: RESTful endpoints for different map operations
- **React Hooks**: Custom hooks for client-side integration
- **Components**: Interactive UI components for map display

### Data Flow
1. **Client Request** → API Route
2. **API Route** → Google Maps Service
3. **Google Maps Service** → Google Maps API
4. **Response Processing** → Map URL Generation
5. **Formatted Response** → Client Display

## File Structure

```
lib/
└── google-maps.js              # Core Google Maps service

app/api/google-maps/
├── static-map/route.js         # Static map generation
├── property-map/route.js        # Property-specific maps
├── transportation-map/route.js # Transportation maps
├── directions/route.js          # Directions API
├── geocode/route.js            # Geocoding API
└── distance/route.js           # Distance calculation

hooks/
└── useGoogleMaps.js           # React hook for Google Maps

components/
├── GoogleMapsDisplay.js        # Map display component
└── GoogleMapsControls.js       # Control interface component

utils/
└── google-maps-utils.js       # Utility functions
```

## API Endpoints

### Static Map Generation
```
POST /api/google-maps/static-map
Content-Type: application/json

{
  "center": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "zoom": 15,
  "size": {
    "width": 640,
    "height": 480
  },
  "mapType": "roadmap",
  "markers": [
    {
      "location": { "lat": 13.7563, "lng": 100.5018 },
      "style": { "color": "red", "size": "normal" },
      "label": "P"
    }
  ],
  "paths": [
    {
      "points": [
        { "lat": 13.7563, "lng": 100.5018 },
        { "lat": 13.7573, "lng": 100.5028 }
      ],
      "style": {
        "color": "0x0000ff",
        "weight": 2
      }
    }
  ],
  "scale": 1,
  "format": "png",
  "language": "th"
}

Response:
{
  "success": true,
  "mapUrl": "https://maps.googleapis.com/maps/api/staticmap?...",
  "parameters": {...}
}
```

### Property Map Generation
```
POST /api/google-maps/property-map
Content-Type: application/json

{
  "propertyLocation": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "nearbyPlaces": [
    {
      "name": "Central World",
      "location": { "lat": 13.7473, "lng": 100.5018 },
      "type": "shopping_mall"
    }
  ],
  "mapType": "roadmap",
  "size": { "width": 640, "height": 480 },
  "zoom": 15
}

Response:
{
  "success": true,
  "mapUrl": "https://maps.googleapis.com/maps/api/staticmap?...",
  "parameters": {...}
}
```

### Transportation Map Generation
```
POST /api/google-maps/transportation-map
Content-Type: application/json

{
  "propertyLocation": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "transportationStops": [
    {
      "name": "Siam BTS",
      "location": { "lat": 13.7453, "lng": 100.5018 },
      "type": "bts"
    }
  ],
  "mapType": "roadmap",
  "size": { "width": 640, "height": 480 },
  "zoom": 14
}

Response:
{
  "success": true,
  "mapUrl": "https://maps.googleapis.com/maps/api/staticmap?...",
  "parameters": {...}
}
```

### Directions API
```
POST /api/google-maps/directions
Content-Type: application/json

{
  "origin": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "destination": {
    "lat": 13.7473,
    "lng": 100.5018
  },
  "mode": "driving",
  "language": "th",
  "region": "TH"
}

Response:
{
  "success": true,
  "directions": {
    "distance": {
      "text": "1.2 กม.",
      "value": 1200
    },
    "duration": {
      "text": "5 นาที",
      "value": 300
    },
    "startAddress": "ถนนราชดำริ",
    "endAddress": "ถนนพระราม 1",
    "steps": [...],
    "overviewPolyline": "...",
    "bounds": {...}
  }
}
```

### Geocoding API
```
POST /api/google-maps/geocode
Content-Type: application/json

{
  "address": "ถนนราชดำริ กรุงเทพมหานคร",
  "language": "th",
  "operation": "geocode"
}

Response:
{
  "success": true,
  "geocoding": {
    "formattedAddress": "ถนนราชดำริ เขตปทุมวัน กรุงเทพมหานคร 10330",
    "location": {
      "lat": 13.7563,
      "lng": 100.5018
    },
    "placeId": "ChIJ...",
    "types": ["route"],
    "addressComponents": [...]
  }
}
```

### Reverse Geocoding API
```
POST /api/google-maps/geocode
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "language": "th",
  "operation": "reverse"
}

Response:
{
  "success": true,
  "geocoding": {
    "formattedAddress": "ถนนราชดำริ เขตปทุมวัน กรุงเทพมหานคร 10330",
    "location": {
      "lat": 13.7563,
      "lng": 100.5018
    },
    "placeId": "ChIJ...",
    "types": ["street_address"],
    "addressComponents": [...]
  }
}
```

### Distance Calculation API
```
POST /api/google-maps/distance
Content-Type: application/json

{
  "origin": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "destination": {
    "lat": 13.7473,
    "lng": 100.5018
  },
  "mode": "driving"
}

Response:
{
  "success": true,
  "distance": {
    "distance": {
      "text": "1.2 กม.",
      "value": 1200
    },
    "duration": {
      "text": "5 นาที",
      "value": 300
    },
    "mode": "driving"
  }
}
```

## Configuration

### Environment Variables
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# or use the same key as Google Places
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### Service Configuration
```javascript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY,
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
  DEFAULT_MAP_TYPE: 'roadmap',
  SUPPORTED_MAP_TYPES: ['roadmap', 'satellite', 'hybrid', 'terrain'],
  DEFAULT_SIZE: { width: 640, height: 480 },
  MAX_SIZE: { width: 640, height: 640 },
  MIN_SIZE: { width: 100, height: 100 },
  DEFAULT_SCALE: 1,
  SUPPORTED_SCALES: [1, 2],
  DEFAULT_FORMAT: 'png',
  SUPPORTED_FORMATS: ['png', 'jpg', 'gif'],
  DEFAULT_LANGUAGE: 'th',
  SUPPORTED_LANGUAGES: ['th', 'en']
};
```

## Usage Examples

### React Hook Usage
```javascript
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

const { 
  loading, 
  error, 
  generateStaticMap, 
  generatePropertyMap,
  getDirections,
  geocodeAddress,
  reverseGeocode,
  calculateDistance
} = useGoogleMaps();

// Generate static map
const result = await generateStaticMap({
  center: { lat: 13.7563, lng: 100.5018 },
  zoom: 15,
  size: { width: 640, height: 480 },
  mapType: 'roadmap'
});

// Generate property map
const propertyMap = await generatePropertyMap({
  propertyLocation: { lat: 13.7563, lng: 100.5018 },
  nearbyPlaces: places,
  mapType: 'roadmap'
});

// Get directions
const directions = await getDirections({
  origin: { lat: 13.7563, lng: 100.5018 },
  destination: { lat: 13.7473, lng: 100.5018 },
  mode: 'driving'
});

// Geocode address
const geocoding = await geocodeAddress('ถนนราชดำริ กรุงเทพมหานคร');

// Reverse geocode
const reverseGeocoding = await reverseGeocode({ lat: 13.7563, lng: 100.5018 });

// Calculate distance
const distance = await calculateDistance(
  { lat: 13.7563, lng: 100.5018 },
  { lat: 13.7473, lng: 100.5018 },
  'driving'
);
```

### Component Usage
```javascript
import GoogleMapsControls from '@/components/GoogleMapsControls';
import GoogleMapsDisplay from '@/components/GoogleMapsDisplay';

// Control component
<GoogleMapsControls
  location={location}
  nearbyPlaces={nearbyPlaces}
  transportationStops={transportationStops}
  onMapsGenerated={handleMapsGenerated}
  showAdvancedControls={true}
/>

// Display component
<GoogleMapsDisplay
  maps={generatedMaps}
  loading={loading}
  error={error}
  showControls={true}
  showMetadata={true}
/>
```

### Service Usage
```javascript
import { 
  generateStaticMapUrl, 
  generatePropertyMapUrl,
  getDirections,
  geocodeAddress,
  reverseGeocode,
  calculateDistance
} from '@/lib/google-maps';

// Generate static map URL
const mapUrl = generateStaticMapUrl({
  center: { lat: 13.7563, lng: 100.5018 },
  zoom: 15,
  size: { width: 640, height: 480 },
  mapType: 'roadmap'
});

// Generate property map URL
const propertyMapUrl = generatePropertyMapUrl({
  propertyLocation: { lat: 13.7563, lng: 100.5018 },
  nearbyPlaces: places,
  mapType: 'roadmap'
});

// Get directions
const directions = await getDirections({
  origin: { lat: 13.7563, lng: 100.5018 },
  destination: { lat: 13.7473, lng: 100.5018 },
  mode: 'driving'
});

// Geocode address
const geocoding = await geocodeAddress('ถนนราชดำริ กรุงเทพมหานคร');

// Reverse geocode
const reverseGeocoding = await reverseGeocode({ lat: 13.7563, lng: 100.5018 });

// Calculate distance
const distance = await calculateDistance(
  { lat: 13.7563, lng: 100.5018 },
  { lat: 13.7473, lng: 100.5018 },
  'driving'
);
```

## Data Structure

### Map Object
```javascript
{
  // Basic Info
  mapUrl: "https://maps.googleapis.com/maps/api/staticmap?...",
  type: "static", // static, property, transportation, area, comprehensive
  title: "แผนที่พื้นฐาน",
  description: "แผนที่ถนน ขนาด 640×480",
  
  // Map Parameters
  mapType: "roadmap", // roadmap, satellite, hybrid, terrain
  size: { width: 640, height: 480 },
  zoom: 15,
  format: "png", // png, jpg, gif
  scale: 1, // 1, 2
  language: "th",
  
  // Location Data
  center: { lat: 13.7563, lng: 100.5018 },
  markers: [...],
  paths: [...],
  
  // Additional Data
  nearbyPlaces: [...],
  transportationStops: [...],
  radius: 1000, // for area maps
  
  // Metadata
  createdAt: "2024-01-01T00:00:00Z",
  parameters: {...}
}
```

### Directions Object
```javascript
{
  distance: {
    text: "1.2 กม.",
    value: 1200
  },
  duration: {
    text: "5 นาที",
    value: 300
  },
  startAddress: "ถนนราชดำริ",
  endAddress: "ถนนพระราม 1",
  steps: [
    {
      instruction: "เดินทางไปทางเหนือบนถนนราชดำริ",
      distance: { text: "200 ม.", value: 200 },
      duration: { text: "1 นาที", value: 60 },
      startLocation: { lat: 13.7563, lng: 100.5018 },
      endLocation: { lat: 13.7583, lng: 100.5018 },
      travelMode: "DRIVING"
    }
  ],
  overviewPolyline: "...",
  bounds: {
    northeast: { lat: 13.7583, lng: 100.5028 },
    southwest: { lat: 13.7543, lng: 100.5008 }
  }
}
```

### Geocoding Object
```javascript
{
  formattedAddress: "ถนนราชดำริ เขตปทุมวัน กรุงเทพมหานคร 10330",
  location: {
    lat: 13.7563,
    lng: 100.5018
  },
  placeId: "ChIJ...",
  types: ["route"],
  addressComponents: [
    {
      longName: "ถนนราชดำริ",
      shortName: "ถนนราชดำริ",
      types: ["route"]
    },
    {
      longName: "เขตปทุมวัน",
      shortName: "เขตปทุมวัน",
      types: ["administrative_area_level_2", "political"]
    }
  ]
}
```

## Features

### Map Generation
- **Static Maps**: High-quality static map images
- **Property Maps**: Maps with property markers and nearby places
- **Transportation Maps**: Maps showing transportation connections
- **Area Overview**: Maps with radius visualization
- **Comprehensive Maps**: All-in-one maps with multiple data layers

### Map Types
- **Roadmap**: Standard street map
- **Satellite**: Satellite imagery
- **Hybrid**: Satellite with street labels
- **Terrain**: Topographic map

### Customization Options
- **Size Options**: Various image resolutions
- **Zoom Levels**: 1-20 zoom levels
- **Scale Options**: 1x and 2x scale
- **Format Support**: PNG, JPG, GIF formats
- **Language Support**: Thai and English

### Markers and Paths
- **Property Markers**: Blue markers for properties
- **Location Markers**: Green markers for nearby places
- **Transportation Markers**: Color-coded by type
- **Custom Markers**: User-defined markers
- **Path Visualization**: Lines and polygons

### Interactive Display
- **Fullscreen Mode**: Expand maps to full screen
- **Navigation Controls**: Previous/next map navigation
- **Thumbnail Gallery**: Quick map selection
- **Map Type Icons**: Visual map type indicators
- **Metadata Display**: Show map parameters
- **Download Support**: Save maps locally

### Advanced Controls
- **Map Type Selection**: Choose map style
- **Size Selection**: Choose image resolution
- **Zoom Control**: Adjust zoom level
- **Format Options**: Select image format
- **Scale Settings**: Choose image scale
- **Language Selection**: Choose display language

## Performance Optimizations

### Map Loading
- **Lazy Loading**: Load maps on demand
- **Progressive Loading**: Show maps as they load
- **Thumbnail Generation**: Quick preview images
- **Caching Strategy**: Cache frequently accessed maps

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
- **No Coverage**: Handle areas without map data
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
  message: "Map not available at this location"
}

// Network Errors
{
  error: "NETWORK_ERROR",
  message: "Failed to connect to Maps API"
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
- **Map Generation**: Track map generation requests
- **User Interactions**: Monitor user behavior
- **Feature Usage**: Track feature adoption
- **Download Statistics**: Track map downloads

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
- **Google API**: Test Maps integration
- **Component Tests**: Test React components
- **Hook Tests**: Test custom hooks

### End-to-End Tests
- **User Workflows**: Test complete user journeys
- **Map Generation**: Test map generation flows
- **Error Scenarios**: Test error handling
- **Performance Tests**: Test under load

## Future Enhancements

### Advanced Features
- **AI-Powered Maps**: Smart map generation
- **Interactive Maps**: Embedded interactive maps
- **Historical Maps**: Time-based map views
- **Weather Integration**: Weather-aware maps

### Performance Improvements
- **CDN Integration**: Global map delivery
- **Advanced Caching**: Multi-layer caching
- **Predictive Loading**: Preload likely maps
- **Background Processing**: Process maps in background

### User Experience
- **AR Integration**: Augmented reality features
- **Voice Controls**: Voice-activated controls
- **Gesture Support**: Touch and gesture controls
- **Accessibility**: Enhanced accessibility features

## Troubleshooting

### Common Issues
1. **API Key Issues**: Verify API key configuration
2. **No Coverage**: Check map availability
3. **Location Errors**: Validate coordinates
4. **Network Issues**: Check connectivity

### Debug Tools
- **API Logging**: Detailed API request logs
- **Error Tracking**: Comprehensive error reporting
- **Performance Monitoring**: Real-time performance data
- **User Analytics**: User behavior insights

### Support Resources
- **Google Maps API Documentation**: Official documentation
- **Community Forums**: Developer community
- **Error Codes**: Comprehensive error code reference
- **Best Practices**: Implementation guidelines

This comprehensive Google Maps API integration provides powerful mapping capabilities for Property Snap reports, enabling users to visualize properties, nearby places, transportation connections, and area overviews with high-quality static maps and interactive controls.
