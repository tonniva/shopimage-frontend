# Google Places API Integration Documentation

This document describes the comprehensive Google Places API integration for the Property Snap feature, providing rich location data, nearby places, and detailed place information.

## Overview

The Google Places API integration provides:
- **Nearby Places Search**: Find places within a specified radius
- **Text Search**: Search places by name or description
- **Place Details**: Get comprehensive information about specific places
- **Thai Language Support**: Localized results in Thai language
- **Photo Integration**: Access to Google Places photos
- **Reviews & Ratings**: User reviews and rating information
- **Real-time Data**: Up-to-date place information
- **Categorized Results**: Organized by place types and categories

## Architecture

### Service Layer
- **Google Places Library**: Core service using @googlemaps/google-maps-services-js
- **API Routes**: RESTful endpoints for different search types
- **React Hooks**: Custom hooks for client-side integration
- **Components**: Reusable UI components for place display

### Data Flow
1. **Client Request** → API Route
2. **API Route** → Google Places Service
3. **Google Places Service** → Google Maps API
4. **Response Processing** → Data Enrichment
5. **Formatted Response** → Client

## File Structure

```
lib/
└── google-places.js              # Core Google Places service

app/api/google-places/
├── nearby/route.js               # Nearby places search
├── search/route.js              # Text-based search
└── details/route.js             # Place details

hooks/
└── useGooglePlaces.js           # React hook for Google Places

components/
├── GooglePlacesResults.js       # Results display component
└── GooglePlacesSearch.js       # Search interface component

utils/
└── google-places-utils.js       # Utility functions
```

## API Endpoints

### Nearby Places Search
```
POST /api/google-places/nearby
Content-Type: application/json

{
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "radius": 2000,
  "type": "point_of_interest",
  "language": "th"
}

Response:
{
  "success": true,
  "results": [...],
  "totalResults": 15,
  "searchParams": {...}
}
```

### Text Search
```
POST /api/google-places/search
Content-Type: application/json

{
  "query": "ร้านอาหาร",
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "radius": 2000,
  "language": "th"
}

Response:
{
  "success": true,
  "places": [...],
  "totalResults": 8,
  "searchParams": {...}
}
```

### Place Details
```
GET /api/google-places/details?place_id=ChIJ...&language=th

Response:
{
  "success": true,
  "place": {
    "place_id": "ChIJ...",
    "name": "ชื่อสถานที่",
    "formatted_address": "ที่อยู่",
    "location": {
      "lat": 13.7563,
      "lng": 100.5018
    },
    "rating": 4.5,
    "user_ratings_total": 1234,
    "photos": [...],
    "reviews": [...],
    "opening_hours": {...},
    "phone": "+66...",
    "website": "https://...",
    "google_url": "https://...",
    "types": [...],
    "primary_type": "restaurant"
  }
}
```

## Configuration

### Environment Variables
```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### Service Configuration
```javascript
export const GOOGLE_PLACES_CONFIG = {
  API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  DEFAULT_RADIUS: 2000, // 2km
  MAX_RADIUS: 50000, // 50km
  DEFAULT_LANGUAGE: 'th',
  SUPPORTED_LANGUAGES: ['th', 'en'],
  PHOTO_MAX_WIDTH: 400,
  PHOTO_MAX_HEIGHT: 300,
  REVIEWS_LIMIT: 5,
  PLACES_LIMIT: 20
};
```

### Place Types
```javascript
export const PLACE_TYPES = {
  ATTRACTIONS: 'tourist_attraction',
  RESTAURANTS: 'restaurant',
  SHOPPING: 'shopping_mall',
  TRANSPORT: 'transit_station',
  HEALTHCARE: 'hospital',
  EDUCATION: 'school',
  ENTERTAINMENT: 'amusement_park',
  ACCOMMODATION: 'lodging',
  SERVICES: 'establishment',
  POINTS_OF_INTEREST: 'point_of_interest'
};
```

## Usage Examples

### React Hook Usage
```javascript
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

const { 
  loading, 
  error, 
  searchNearby, 
  getPlaceDetails,
  getAllNearbyPlaces 
} = useGooglePlaces();

// Search nearby places
const result = await searchNearby({
  location: { lat: 13.7563, lng: 100.5018 },
  radius: 2000,
  type: 'restaurant',
  language: 'th'
});

// Get place details
const details = await getPlaceDetails('ChIJ...', 'th');

// Get all nearby places by category
const allPlaces = await getAllNearbyPlaces(location, 2000);
```

### Component Usage
```javascript
import GooglePlacesSearch from '@/components/GooglePlacesSearch';
import GooglePlacesResults from '@/components/GooglePlacesResults';

// Search component
<GooglePlacesSearch
  location={location}
  onPlaceSelect={handlePlaceSelect}
  initialRadius={2000}
  showFilters={true}
/>

// Results component
<GooglePlacesResults
  places={places}
  loading={loading}
  error={error}
  onPlaceSelect={handlePlaceSelect}
/>
```

### Service Usage
```javascript
import { searchNearbyPlaces, getPlaceDetails } from '@/lib/google-places';

// Search nearby places
const result = await searchNearbyPlaces({
  location: { lat: 13.7563, lng: 100.5018 },
  radius: 2000,
  type: 'point_of_interest',
  language: 'th'
});

// Get place details
const details = await getPlaceDetails('ChIJ...', 'th');
```

## Data Structure

### Place Object
```javascript
{
  // Basic Info
  place_id: "ChIJ...",
  name: "ชื่อสถานที่",
  formatted_address: "ที่อยู่เต็ม",
  
  // Location
  location: {
    lat: 13.7563,
    lng: 100.5018
  },
  distance: 500, // meters from search origin
  
  // Contact Info
  phone: "+66 2 123 4567",
  website: "https://example.com",
  google_url: "https://maps.google.com/...",
  
  // Ratings & Reviews
  rating: 4.5,
  user_ratings_total: 1234,
  reviews: [
    {
      author_name: "ชื่อผู้รีวิว",
      rating: 5,
      text: "รีวิว...",
      relative_time_description: "2 สัปดาห์ที่แล้ว"
    }
  ],
  
  // Business Info
  price_level: 2, // 0-4 scale
  opening_hours: {
    open_now: true,
    weekday_text: ["จันทร์: 08:00-22:00", ...]
  },
  business_status: "OPERATIONAL",
  
  // Media
  photos: [
    {
      photo_reference: "CmRa...",
      url: "https://maps.googleapis.com/...",
      width: 400,
      height: 300
    }
  ],
  primary_photo: { ... },
  
  // Categories
  types: ["restaurant", "food", "establishment"],
  primary_type: "restaurant",
  
  // Additional
  vicinity: "ย่านใกล้เคียง",
  permanently_closed: false,
  utc_offset: 420 // minutes
}
```

## Features

### Search Capabilities
- **Nearby Search**: Find places within radius
- **Text Search**: Search by name or description
- **Category Filtering**: Filter by place type
- **Distance Sorting**: Sort by proximity
- **Rating Filtering**: Filter by minimum rating

### Data Enrichment
- **Thai Localization**: Thai names and descriptions
- **Photo Integration**: High-quality place photos
- **Review Processing**: User reviews and ratings
- **Opening Hours**: Current status and hours
- **Contact Information**: Phone, website, address
- **Distance Calculation**: Accurate distance from origin

### User Experience
- **Real-time Search**: Instant search results
- **Progressive Loading**: Load more results
- **Error Handling**: Graceful error management
- **Loading States**: Visual feedback during search
- **Responsive Design**: Mobile-friendly interface

## Performance Optimizations

### Caching Strategy
- **API Response Caching**: Cache frequent searches
- **Photo Caching**: Cache place photos
- **Location Caching**: Cache nearby places by location

### Request Optimization
- **Batch Requests**: Combine multiple API calls
- **Debounced Search**: Reduce API calls during typing
- **Pagination**: Load results in chunks
- **Lazy Loading**: Load images on demand

### Data Processing
- **Parallel Processing**: Process multiple places simultaneously
- **Data Compression**: Minimize response size
- **Selective Fields**: Request only needed data
- **Error Recovery**: Retry failed requests

## Error Handling

### API Errors
- **Rate Limiting**: Handle API quota exceeded
- **Invalid Requests**: Validate input parameters
- **Network Errors**: Retry failed requests
- **Authentication**: Handle API key issues

### User Experience
- **Error Messages**: Clear error descriptions
- **Fallback Data**: Show cached or mock data
- **Retry Options**: Allow users to retry
- **Offline Support**: Handle network issues

### Error Types
```javascript
// API Errors
{
  error: "INVALID_REQUEST",
  message: "Invalid location coordinates"
}

// Network Errors
{
  error: "NETWORK_ERROR",
  message: "Failed to connect to Google Places API"
}

// Rate Limiting
{
  error: "QUOTA_EXCEEDED",
  message: "API quota exceeded"
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
- **Data Minimization**: Request only necessary data
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
- **Usage Patterns**: Analyze search patterns

### User Analytics
- **Search Queries**: Track popular searches
- **Place Interactions**: Monitor place selections
- **User Behavior**: Analyze user patterns
- **Feature Usage**: Track feature adoption

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
- **Google API**: Test Google Places integration
- **Component Tests**: Test React components
- **Hook Tests**: Test custom hooks

### End-to-End Tests
- **User Workflows**: Test complete user journeys
- **Search Flows**: Test search functionality
- **Error Scenarios**: Test error handling
- **Performance Tests**: Test under load

## Future Enhancements

### Advanced Features
- **AI-Powered Recommendations**: Smart place suggestions
- **Personalized Results**: User-specific recommendations
- **Real-time Updates**: Live place information
- **Social Integration**: Share places with friends

### Performance Improvements
- **CDN Integration**: Global content delivery
- **Advanced Caching**: Multi-layer caching
- **Predictive Loading**: Preload likely results
- **Background Sync**: Sync data in background

### User Experience
- **Voice Search**: Voice-activated search
- **AR Integration**: Augmented reality features
- **Offline Support**: Offline place data
- **Accessibility**: Enhanced accessibility features

## Troubleshooting

### Common Issues
1. **API Key Issues**: Verify API key configuration
2. **Rate Limiting**: Check API quota usage
3. **Location Errors**: Validate coordinates
4. **Network Issues**: Check connectivity

### Debug Tools
- **API Logging**: Detailed API request logs
- **Error Tracking**: Comprehensive error reporting
- **Performance Monitoring**: Real-time performance data
- **User Analytics**: User behavior insights

### Support Resources
- **Google Places API Documentation**: Official documentation
- **Community Forums**: Developer community
- **Error Codes**: Comprehensive error code reference
- **Best Practices**: Implementation guidelines

This comprehensive Google Places API integration provides rich location data and enhanced user experience for the Property Snap feature, enabling users to discover and explore nearby places with detailed information and seamless interaction.
