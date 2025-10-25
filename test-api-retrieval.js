// test-api-retrieval.js
const fetch = require('node-fetch');

async function testAPIReportRetrieval() {
  console.log('🧪 Testing Property Snap API Report Retrieval...\n');

  const baseUrl = 'http://localhost:3002';
  
  try {
    // Test 1: Test user reports endpoint
    console.log('1. Testing /api/property-snap/user-reports endpoint...');
    
    const userReportsResponse = await fetch(`${baseUrl}/api/property-snap/user-reports`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    if (userReportsResponse.ok) {
      const userReports = await userReportsResponse.json();
      console.log('✅ User reports endpoint responded');
      console.log('   - Reports count:', userReports.reports?.length || 0);
      console.log('   - Success:', userReports.success);
    } else {
      const error = await userReportsResponse.text();
      console.log('⚠️ User reports endpoint error:', userReportsResponse.status, error);
    }

    // Test 2: Test share endpoint with mock token
    console.log('\n2. Testing /api/property-snap/share/[shareToken] endpoint...');
    
    const mockShareToken = 'test-share-token-123';
    const shareResponse = await fetch(`${baseUrl}/api/property-snap/share/${mockShareToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (shareResponse.ok) {
      const shareData = await shareResponse.json();
      console.log('✅ Share endpoint responded');
      console.log('   - Report found:', shareData.report ? 'Yes' : 'No');
      console.log('   - Success:', shareData.success);
    } else {
      const error = await shareResponse.text();
      console.log('⚠️ Share endpoint error:', shareResponse.status, error);
    }

    // Test 3: Test delete endpoint
    console.log('\n3. Testing /api/property-snap/delete/[reportId] endpoint...');
    
    const mockReportId = 'test-report-id-123';
    const deleteResponse = await fetch(`${baseUrl}/api/property-snap/delete/${mockReportId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ Delete endpoint responded');
      console.log('   - Success:', deleteData.success);
    } else {
      const error = await deleteResponse.text();
      console.log('⚠️ Delete endpoint error:', deleteResponse.status, error);
    }

    // Test 4: Test storage usage endpoint
    console.log('\n4. Testing /api/property-snap/storage endpoint...');
    
    const storageResponse = await fetch(`${baseUrl}/api/property-snap/storage`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    if (storageResponse.ok) {
      const storageData = await storageResponse.json();
      console.log('✅ Storage endpoint responded');
      console.log('   - Usage:', storageData.usage || 'N/A');
      console.log('   - Limit:', storageData.limit || 'N/A');
    } else {
      const error = await storageResponse.text();
      console.log('⚠️ Storage endpoint error:', storageResponse.status, error);
    }

    // Test 5: Test Google Places nearby endpoint
    console.log('\n5. Testing /api/google-places/nearby endpoint...');
    
    const placesResponse = await fetch(`${baseUrl}/api/google-places/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: { lat: 13.7563, lng: 100.5018 },
        radius: 1000,
        type: 'restaurant',
        language: 'th'
      })
    });

    if (placesResponse.ok) {
      const places = await placesResponse.json();
      console.log('✅ Google Places endpoint responded');
      console.log('   - Places found:', places.results?.length || 0);
      console.log('   - Success:', places.success);
    } else {
      const error = await placesResponse.text();
      console.log('⚠️ Google Places endpoint error:', placesResponse.status, error);
    }

    // Test 6: Test Google Street View endpoint
    console.log('\n6. Testing /api/google-street-view/metadata endpoint...');
    
    const streetViewResponse = await fetch(`${baseUrl}/api/google-street-view/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: { lat: 13.7563, lng: 100.5018 }
      })
    });

    if (streetViewResponse.ok) {
      const streetViewData = await streetViewResponse.json();
      console.log('✅ Street View endpoint responded');
      console.log('   - Available:', streetViewData.available || 'N/A');
      console.log('   - Success:', streetViewData.success);
    } else {
      const error = await streetViewResponse.text();
      console.log('⚠️ Street View endpoint error:', streetViewResponse.status, error);
    }

    // Test 7: Test Google Maps static map endpoint
    console.log('\n7. Testing /api/google-maps/static-map endpoint...');
    
    const mapsResponse = await fetch(`${baseUrl}/api/google-maps/static-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: { lat: 13.7563, lng: 100.5018 },
        zoom: 15,
        size: '400x300'
      })
    });

    if (mapsResponse.ok) {
      const mapsData = await mapsResponse.json();
      console.log('✅ Google Maps endpoint responded');
      console.log('   - Map URL:', mapsData.mapUrl ? 'Generated' : 'N/A');
      console.log('   - Success:', mapsData.success);
    } else {
      const error = await mapsResponse.text();
      console.log('⚠️ Google Maps endpoint error:', mapsResponse.status, error);
    }

    console.log('\n🎉 API endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPIReportRetrieval();
