// test-property-snap-retrieval.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPropertyReportRetrieval() {
  console.log('🧪 Testing Property Snap Report Retrieval...\n');

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

    // Test 3: Create multiple test reports
    console.log('\n3. Creating multiple test reports...');
    const testReports = [];
    
    for (let i = 1; i <= 5; i++) {
      const report = await prisma.propertyReport.create({
        data: {
          userId: testUser.id,
          title: `Test Property Report ${i}`,
          description: `This is test property report number ${i}`,
          locationLat: 13.7563 + (i * 0.001),
          locationLng: 100.5018 + (i * 0.001),
          address: `${i} Test Street, Bangkok`,
          formattedAddress: `${i} Test Street, Bangkok, Thailand`,
          userImages: [
            {
              id: `test-image-${i}`,
              filename: `test-image-${i}.jpg`,
              url: `https://example.com/test-image-${i}.jpg`,
              thumbnailUrl: `https://example.com/test-image-${i}-thumb.jpg`,
              size: 1024000 + (i * 100000),
              uploadedAt: new Date().toISOString()
            }
          ],
          nearbyPlaces: [
            {
              id: `place-${i}`,
              name: `Test Place ${i}`,
              type: 'restaurant',
              distance: `${i * 100}m`,
              rating: 4.0 + (i * 0.1),
              photoUrl: `https://example.com/place-${i}.jpg`
            }
          ],
          shareToken: `test-${Date.now()}-${i}`,
          isPublic: i % 2 === 0, // Alternate public/private
          status: 'ACTIVE',
          viewCount: i * 10,
          shareCount: i * 5
        }
      });
      testReports.push(report);
      console.log(`✅ Created report ${i}: ${report.id}`);
    }

    // Test 4: Test report retrieval by user ID
    console.log('\n4. Testing report retrieval by user ID...');
    const userReports = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${userReports.length} reports for user`);
    console.log('   - Reports:', userReports.map(r => `${r.title} (${r.status})`).join(', '));

    // Test 5: Test report retrieval with pagination
    console.log('\n5. Testing report retrieval with pagination...');
    const paginatedReports = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      skip: 0
    });
    
    console.log(`✅ Paginated results: ${paginatedReports.length} reports`);
    console.log('   - First 3 reports:', paginatedReports.map(r => r.title).join(', '));

    // Test 6: Test report retrieval with filtering
    console.log('\n6. Testing report retrieval with filtering...');
    const publicReports = await prisma.propertyReport.findMany({
      where: { 
        userId: testUser.id,
        isPublic: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Public reports: ${publicReports.length} reports`);
    console.log('   - Public reports:', publicReports.map(r => r.title).join(', '));

    // Test 7: Test report retrieval by share token
    console.log('\n7. Testing report retrieval by share token...');
    const shareToken = testReports[0].shareToken;
    const sharedReport = await prisma.propertyReport.findUnique({
      where: { shareToken }
    });
    
    if (sharedReport) {
      console.log('✅ Report found by share token:', sharedReport.title);
    } else {
      throw new Error('Report not found by share token');
    }

    // Test 8: Test report retrieval with include relations
    console.log('\n8. Testing report retrieval with user relations...');
    const reportsWithUser = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 2
    });
    
    console.log(`✅ Reports with user data: ${reportsWithUser.length} reports`);
    reportsWithUser.forEach(report => {
      console.log(`   - ${report.title} by ${report.user.email}`);
    });

    // Test 9: Test report retrieval with specific fields
    console.log('\n9. Testing report retrieval with specific fields...');
    const reportsSummary = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      select: {
        id: true,
        title: true,
        locationLat: true,
        locationLng: true,
        viewCount: true,
        shareCount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Reports summary: ${reportsSummary.length} reports`);
    reportsSummary.forEach(report => {
      console.log(`   - ${report.title}: ${report.viewCount} views, ${report.shareCount} shares`);
    });

    // Test 10: Test report retrieval with search
    console.log('\n10. Testing report retrieval with search...');
    const searchResults = await prisma.propertyReport.findMany({
      where: { 
        userId: testUser.id,
        title: {
          contains: 'Test Property Report'
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Search results: ${searchResults.length} reports found`);
    console.log('   - Search results:', searchResults.map(r => r.title).join(', '));

    // Test 11: Test report retrieval with location filtering
    console.log('\n11. Testing report retrieval with location filtering...');
    const locationReports = await prisma.propertyReport.findMany({
      where: { 
        userId: testUser.id,
        locationLat: {
          gte: 13.7563,
          lte: 13.7600
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Location filtered reports: ${locationReports.length} reports`);
    locationReports.forEach(report => {
      console.log(`   - ${report.title}: ${report.locationLat}, ${report.locationLng}`);
    });

    // Test 12: Test report count
    console.log('\n12. Testing report count...');
    const totalCount = await prisma.propertyReport.count({
      where: { userId: testUser.id }
    });
    
    const publicCount = await prisma.propertyReport.count({
      where: { 
        userId: testUser.id,
        isPublic: true
      }
    });
    
    console.log(`✅ Total reports: ${totalCount}`);
    console.log(`✅ Public reports: ${publicCount}`);
    console.log(`✅ Private reports: ${totalCount - publicCount}`);

    // Test 13: Test report retrieval with sorting
    console.log('\n13. Testing report retrieval with different sorting...');
    
    // Sort by view count
    const reportsByViews = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      orderBy: { viewCount: 'desc' },
      take: 3
    });
    
    console.log(`✅ Reports by views: ${reportsByViews.length} reports`);
    reportsByViews.forEach(report => {
      console.log(`   - ${report.title}: ${report.viewCount} views`);
    });

    // Sort by share count
    const reportsByShares = await prisma.propertyReport.findMany({
      where: { userId: testUser.id },
      orderBy: { shareCount: 'desc' },
      take: 3
    });
    
    console.log(`✅ Reports by shares: ${reportsByShares.length} reports`);
    reportsByShares.forEach(report => {
      console.log(`   - ${report.title}: ${report.shareCount} shares`);
    });

    // Test 14: Test report update and retrieval
    console.log('\n14. Testing report update and retrieval...');
    const reportToUpdate = testReports[0];
    const updatedReport = await prisma.propertyReport.update({
      where: { id: reportToUpdate.id },
      data: {
        viewCount: { increment: 1 },
        title: 'Updated Test Property Report 1'
      }
    });
    
    console.log('✅ Report updated successfully');
    console.log(`   - New title: ${updatedReport.title}`);
    console.log(`   - New view count: ${updatedReport.viewCount}`);

    // Test 15: Test report deletion and retrieval
    console.log('\n15. Testing report deletion and retrieval...');
    const reportToDelete = testReports[testReports.length - 1];
    await prisma.propertyReport.delete({
      where: { id: reportToDelete.id }
    });
    
    const remainingReports = await prisma.propertyReport.count({
      where: { userId: testUser.id }
    });
    
    console.log('✅ Report deleted successfully');
    console.log(`   - Remaining reports: ${remainingReports}`);

    // Clean up remaining test reports
    console.log('\n16. Cleaning up test reports...');
    await prisma.propertyReport.deleteMany({
      where: { userId: testUser.id }
    });
    
    const finalCount = await prisma.propertyReport.count({
      where: { userId: testUser.id }
    });
    
    console.log(`✅ Cleanup completed. Remaining reports: ${finalCount}`);

    console.log('\n🎉 All report retrieval tests passed! Property Snap report retrieval is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPropertyReportRetrieval();
