import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { uploadPropertyImagesServer } from '@/lib/storage-server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    // 1. Check Authentication with Supabase
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in Prisma database
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const images = formData.getAll('images');
    
    // Safely parse JSON data
    let locationData, nearbyPlaces;
    try {
      locationData = JSON.parse(formData.get('location') || '{}');
      nearbyPlaces = JSON.parse(formData.get('nearbyPlaces') || '[]');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON data',
        details: parseError.message,
        type: 'ParseError'
      }, { status: 400 });
    }
    
    // Debug: Log received data
    console.log('Received form data:');
    console.log('- Images count:', images.length);
    console.log('- Location:', locationData);
    console.log('- Nearby places count:', nearbyPlaces.length);
    console.log('- Province:', formData.get('province'));
    console.log('- Region:', formData.get('region'));
    
    // Extract new form fields
    const propertyType = formData.get('propertyType');
    const listingType = formData.get('listingType');
    const price = formData.get('price');
    const area = formData.get('area');
    const landArea = formData.get('landArea');
    const bedrooms = formData.get('bedrooms');
    const bathrooms = formData.get('bathrooms');
    const floors = formData.get('floors');
    const buildingAge = formData.get('buildingAge');
    
    // Extract contact fields
    const contactPhone = formData.get('contactPhone');
    const contactEmail = formData.get('contactEmail');
    const contactLine = formData.get('contactLine');
    
    // Extract location fields
    const province = formData.get('province');
    const region = formData.get('region');
    
    // 2. Validate inputs
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (!locationData.lat || !locationData.lng) {
      return NextResponse.json({ error: 'Location coordinates required' }, { status: 400 });
    }

    // Validate required fields
    if (!formData.get('title')) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    console.log('Validation passed, proceeding with report creation...');

    // 3. Generate unique identifiers
    const reportId = crypto.randomUUID();
    const shareToken = generateShareToken();
    
    // 4. Upload images to Supabase Storage
    const uploadResults = await uploadPropertyImagesServer(
      images, 
      prismaUser.id, 
      reportId
    );

    // Check for upload failures
    const failedUploads = uploadResults.filter(result => !result.success);
    if (failedUploads.length > 0) {
      console.error('Some uploads failed:', failedUploads);
      return NextResponse.json({
        error: 'Some images failed to upload',
        failedUploads: failedUploads.map(f => f.error)
      }, { status: 400 });
    }

    // 5. Process uploaded images for database storage
    const processedImages = uploadResults.map((result, index) => ({
      id: crypto.randomUUID(),
      filename: result.filename,
      originalFilename: images[index].name,
      fileSize: result.size,
      mimeType: result.type,
      storagePath: result.path,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      isPrimary: index === 0,
      sortOrder: index,
      uploadedAt: result.uploadedAt
    }));

    // 6. Process nearby places
    const processedPlaces = nearbyPlaces.map(place => ({
      id: crypto.randomUUID(),
      name: place.name,
      type: place.type,
      category: place.category,
      distanceKm: place.distance ? parseFloat(place.distance) : null,
      travelTimeMinutes: place.travelTime,
      rating: place.rating ? parseFloat(place.rating) : null,
      address: place.address,
      phone: place.phone,
      website: place.website,
      photoUrl: place.photo_url || place.photo
    }));

    // 7. Create property report in database
    try {
      console.log('Creating property report with data:', {
        reportId,
        userId: prismaUser.id,
        title: formData.get('title') || 'รายงานอสังหาริมทรัพย์',
        locationLat: parseFloat(locationData.lat),
        locationLng: parseFloat(locationData.lng),
        province: province,
        region: region
      });

      const report = await prisma.propertyReport.create({
        data: {
          id: reportId,
          userId: prismaUser.id,
          title: formData.get('title') || 'รายงานอสังหาริมทรัพย์',
          description: formData.get('description'),
          locationLat: parseFloat(locationData.lat),
          locationLng: parseFloat(locationData.lng),
          address: locationData.address,
          formattedAddress: locationData.formattedAddress,
          userImages: processedImages,
          nearbyPlaces: processedPlaces,
          shareToken: shareToken,
          viewCount: 0,
          shareCount: 0,
          isPublic: true,
          status: 'PENDING', // New reports start as PENDING and need admin approval
          // New fields
          propertyType: propertyType,
          listingType: listingType,
          price: price ? parseFloat(price) : null,
          area: area ? parseFloat(area) : null,
          landArea: landArea ? parseFloat(landArea) : null,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          bathrooms: bathrooms ? parseInt(bathrooms) : null,
          floors: floors ? parseInt(floors) : null,
          buildingAge: buildingAge ? parseInt(buildingAge) : null,
          
          // Contact fields
          contactPhone: contactPhone,
          contactEmail: contactEmail,
          contactLine: contactLine,
          
          // Location fields
          province: province,
          region: region
        }
      });

      console.log(`✅ Property report created: ${report.id} for user: ${prismaUser.email}`);

      return NextResponse.json({
        success: true,
        reportId: report.id,
        shareToken: report.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${report.shareToken}`,
        imagesProcessed: images.length,
        planInfo: {
          currentPlan: prismaUser.plan || 'FREE',
          reportsUsed: 1,
          reportsLimit: prismaUser.plan === 'PRO' ? 50 : prismaUser.plan === 'BUSINESS' ? 200 : 3
        }
      });
    } catch (dbError) {
      console.error('Database error details:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack
      });
      
      // If database table doesn't exist, return mock response
      if (dbError.code === 'P2021' || dbError.message.includes('relation') || dbError.message.includes('table')) {
        console.log('📝 Database table not found, returning mock response');
        
        return NextResponse.json({
          success: true,
          reportId: reportId,
          shareToken: shareToken,
          shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${shareToken}`,
          imagesProcessed: images.length,
          planInfo: {
            currentPlan: prismaUser.plan || 'FREE',
            reportsUsed: 1,
            reportsLimit: prismaUser.plan === 'PRO' ? 50 : prismaUser.plan === 'BUSINESS' ? 200 : 3
          },
          note: 'Mock response - Database table not created yet'
        });
      }
      
      // Return detailed error for other database issues
      return NextResponse.json({ 
        error: 'Database error',
        details: dbError.message || 'Unknown database error',
        type: 'DatabaseError',
        code: dbError.code,
        meta: dbError.meta
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating property report:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Failed to create report',
      details: error.message || 'Unknown error',
      type: error.name || 'Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Generate share token
function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
