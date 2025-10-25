// test-property-snap-simple.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPropertyReportCreation() {
  console.log('🧪 Testing Property Snap Report Creation...\n');

  try {
    // Test 1: Check if we have any users
    console.log('1. Checking for existing users...');
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('📝 Creating a test user...');
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          plan: 'FREE'
        }
      });
      console.log('✅ Test user created:', testUser.id);
    }

    // Test 2: Get a user for testing
    console.log('\n2. Getting a user for testing...');
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      throw new Error('No user found for testing');
    }
    console.log('✅ Using user:', testUser.email);

    // Test 3: Create a test property report
    console.log('\n3. Creating a test property report...');
    const testReport = await prisma.propertyReport.create({
      data: {
        userId: testUser.id,
        title: 'Test Property Report',
        description: 'This is a test property report for Property Snap feature',
        locationLat: 13.7563,
        locationLng: 100.5018,
        address: '123 Test Street, Bangkok',
        formattedAddress: '123 Test Street, Bangkok, Thailand',
        userImages: [
          {
            id: 'test-image-1',
            filename: 'test-image-1.jpg',
            url: 'https://example.com/test-image-1.jpg',
            thumbnailUrl: 'https://example.com/test-image-1-thumb.jpg',
            size: 1024000,
            uploadedAt: new Date().toISOString()
          }
        ],
        nearbyPlaces: [
          {
            id: 'place-1',
            name: 'Central World',
            type: 'shopping_mall',
            distance: '500m',
            rating: 4.5,
            photoUrl: 'https://example.com/central-world.jpg'
          }
        ],
        shareToken: `test-${Date.now()}`,
        isPublic: true,
        status: 'ACTIVE'
      }
    });
    console.log('✅ Test property report created:', testReport.id);

    // Test 4: Verify the report was created
    console.log('\n4. Verifying the report was created...');
    const createdReport = await prisma.propertyReport.findUnique({
      where: { id: testReport.id },
      include: { user: true }
    });
    
    if (createdReport) {
      console.log('✅ Report verification successful:');
      console.log('   - ID:', createdReport.id);
      console.log('   - Title:', createdReport.title);
      console.log('   - User:', createdReport.user.email);
      console.log('   - Location:', `${createdReport.locationLat}, ${createdReport.locationLng}`);
      console.log('   - Share Token:', createdReport.shareToken);
      console.log('   - Images:', Array.isArray(createdReport.userImages) ? createdReport.userImages.length : 'N/A');
      console.log('   - Nearby Places:', Array.isArray(createdReport.nearbyPlaces) ? createdReport.nearbyPlaces.length : 'N/A');
    } else {
      throw new Error('Report not found after creation');
    }

    // Test 5: Test API endpoint simulation
    console.log('\n5. Testing API endpoint simulation...');
    
    // Simulate the API request data
    const apiRequestData = {
      title: 'API Test Property Report',
      description: 'This is a test via API simulation',
      location: {
        lat: 13.7473,
        lng: 100.5028,
        address: '456 API Test Street, Bangkok'
      },
      nearbyPlaces: [
        {
          name: 'Siam Paragon',
          type: 'shopping_mall',
          distance: '300m',
          rating: 4.8,
          photoUrl: 'https://example.com/siam-paragon.jpg'
        }
      ],
      images: [
        {
          name: 'api-test-image.jpg',
          size: 2048000,
          type: 'image/jpeg'
        }
      ]
    };

    // Simulate the API response
    const apiResponse = await prisma.propertyReport.create({
      data: {
        userId: testUser.id,
        title: apiRequestData.title,
        description: apiRequestData.description,
        locationLat: apiRequestData.location.lat,
        locationLng: apiRequestData.location.lng,
        address: apiRequestData.location.address,
        formattedAddress: apiRequestData.location.address,
        userImages: apiRequestData.images.map((img, index) => ({
          id: `api-image-${index + 1}`,
          filename: img.name,
          url: `https://example.com/${img.name}`,
          thumbnailUrl: `https://example.com/thumb-${img.name}`,
          size: img.size,
          uploadedAt: new Date().toISOString()
        })),
        nearbyPlaces: apiRequestData.nearbyPlaces.map((place, index) => ({
          id: `api-place-${index + 1}`,
          ...place
        })),
        shareToken: `api-test-${Date.now()}`,
        isPublic: true,
        status: 'ACTIVE'
      }
    });

    console.log('✅ API simulation successful:', apiResponse.id);

    // Test 6: Test report retrieval
    console.log('\n6. Testing report retrieval...');
    const allReports = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${allReports.length} reports for user`);

    // Test 7: Test report sharing
    console.log('\n7. Testing report sharing...');
    const shareToken = testReport.shareToken;
    const sharedReport = await prisma.propertyReport.findUnique({
      where: { shareToken }
    });
    
    if (sharedReport) {
      console.log('✅ Report sharing works:', sharedReport.shareToken);
    } else {
      throw new Error('Report sharing failed');
    }

    // Test 8: Test report update
    console.log('\n8. Testing report update...');
    const updatedReport = await prisma.propertyReport.update({
      where: { id: testReport.id },
      data: {
        viewCount: { increment: 1 },
        title: 'Updated Test Property Report'
      }
    });
    console.log('✅ Report update successful:', updatedReport.viewCount);

    // Test 9: Test report deletion
    console.log('\n9. Testing report deletion...');
    await prisma.propertyReport.delete({
      where: { id: testReport.id }
    });
    console.log('✅ Report deletion successful');

    // Clean up API test report
    await prisma.propertyReport.delete({
      where: { id: apiResponse.id }
    });
    console.log('✅ API test report cleaned up');

    console.log('\n🎉 All tests passed! Property Snap report creation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPropertyReportCreation();
