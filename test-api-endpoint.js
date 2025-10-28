// test-api-endpoint.js
const fetch = require('node-fetch');

async function testPropertySnapAPI() {
  console.log('🧪 Testing Property Snap API Endpoint...\n');

  const baseUrl =  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  try {
    // Test 1: Test the create endpoint with mock data
    console.log('1. Testing /api/property-snap/create endpoint...');
    
    const formData = new FormData();
    
    // Add mock image file
    const mockImageBlob = new Blob(['mock image data'], { type: 'image/jpeg' });
    formData.append('images', mockImageBlob, 'test-image.jpg');
    
    // Add location data
    formData.append('location', JSON.stringify({
      lat: 13.7563,
      lng: 100.5018,
      address: '123 Test Street, Bangkok',
      formattedAddress: '123 Test Street, Bangkok, Thailand'
    }));
    
    // Add nearby places
    formData.append('nearbyPlaces', JSON.stringify([
      {
        name: 'Central World',
        type: 'shopping_mall',
        distance: '500m',
        rating: 4.5,
        photoUrl: 'https://example.com/central-world.jpg'
      }
    ]));
    
    // Add other form data
    formData.append('title', 'Test Property Report');
    formData.append('description', 'This is a test property report');

    const response = await fetch(`${baseUrl}/api/property-snap/create`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test-token' // Mock auth
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API endpoint responded successfully');
      console.log('   - Share Token:', result.shareToken);
      console.log('   - Report ID:', result.reportId);
      console.log('   - Success:', result.success);
    } else {
      const error = await response.text();
      console.log('⚠️ API endpoint error:', response.status, error);
    }

    // Test 2: Test user reports endpoint
    console.log('\n2. Testing /api/property-snap/user-reports endpoint...');
    
    const userReportsResponse = await fetch(`${baseUrl}/api/property-snap/user-reports`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    if (userReportsResponse.ok) {
      const userReports = await userReportsResponse.json();
      console.log('✅ User reports endpoint responded');
      console.log('   - Reports count:', userReports.reports?.length || 0);
    } else {
      const error = await userReportsResponse.text();
      console.log('⚠️ User reports endpoint error:', userReportsResponse.status, error);
    }

    // Test 3: Test Google Places nearby endpoint
    console.log('\n3. Testing /api/google-places/nearby endpoint...');
    
    const placesResponse = await fetch(`${baseUrl}/api/google-places/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: { lat: 13.7563, lng: 100.5018 },
        radius: 2000,
        type: 'point_of_interest',
        language: 'th'
      })
    });

    if (placesResponse.ok) {
      const places = await placesResponse.json();
      console.log('✅ Google Places endpoint responded');
      console.log('   - Places found:', places.results?.length || 0);
    } else {
      const error = await placesResponse.text();
      console.log('⚠️ Google Places endpoint error:', placesResponse.status, error);
    }

    console.log('\n🎉 API endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPropertySnapAPI();
