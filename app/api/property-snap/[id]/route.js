import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { uploadPropertyImagesServer } from '@/lib/storage-server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Check Authentication
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

    // Fetch report
    const report = await prisma.propertyReport.findFirst({
      where: {
        id: id,
        userId: prismaUser.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedReport = {
      id: report.id,
      shareToken: report.shareToken,
      title: report.title,
      description: report.description,
      propertyType: report.propertyType,
      listingType: report.listingType,
      price: report.price,
      area: report.area,
      landArea: report.landArea,
      bedrooms: report.bedrooms,
      bathrooms: report.bathrooms,
      floors: report.floors,
      buildingAge: report.buildingAge,
      contactPhone: report.contactPhone,
      contactEmail: report.contactEmail,
      contactLine: report.contactLine,
      location: {
        lat: report.locationLat,
        lng: report.locationLng,
        address: report.address,
        formattedAddress: report.formattedAddress
      },
      images: report.userImages || [],
      nearbyPlaces: report.nearbyPlaces || [],
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      user: report.user
    };

    return NextResponse.json({ report: transformedReport });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch report',
      details: error.message || 'Unknown error',
      type: error.name || 'Error'
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // Check Authentication
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

    // Check if report exists and belongs to user
    const existingReport = await prisma.propertyReport.findFirst({
      where: {
        id: id,
        userId: prismaUser.id
      }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const images = formData.getAll('images');
    const locationData = JSON.parse(formData.get('location'));
    const nearbyPlaces = JSON.parse(formData.get('nearbyPlaces'));
    
    // Extract form fields
    const title = formData.get('title');
    const description = formData.get('description');
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

    // Handle image uploads if new images are provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      try {
        uploadedImages = await uploadPropertyImagesServer(images, prismaUser.id);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json({ 
          error: 'Failed to upload images',
          details: uploadError.message || 'Unknown upload error',
          type: 'UploadError'
        }, { status: 500 });
      }
    }

    // Update report in database
    try {
      const updateData = {
        title: title,
        description: description,
        propertyType: propertyType,
        listingType: listingType,
        price: price ? parseFloat(price) : null,
        area: area ? parseFloat(area) : null,
        landArea: landArea ? parseFloat(landArea) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        floors: floors ? parseInt(floors) : null,
        buildingAge: buildingAge ? parseInt(buildingAge) : null,
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        contactLine: contactLine,
        province: province,
        region: region,
        nearbyPlaces: nearbyPlaces,
        updatedAt: new Date()
      };

      // Add new images to existing images if any
      if (uploadedImages.length > 0) {
        const existingImages = existingReport.userImages || [];
        updateData.userImages = [...existingImages, ...uploadedImages];
      }

      const updatedReport = await prisma.propertyReport.update({
        where: { id: id },
        data: updateData
      });

      console.log(`✅ Property report updated: ${updatedReport.id} for user: ${prismaUser.email}`);

      return NextResponse.json({
        success: true,
        reportId: updatedReport.id,
        shareToken: updatedReport.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${updatedReport.shareToken}`,
        imagesProcessed: uploadedImages.length,
        message: 'Report updated successfully'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      return NextResponse.json({ 
        error: 'Database error',
        details: dbError.message || 'Unknown database error',
        type: 'DatabaseError',
        code: dbError.code
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating property report:', error);
    return NextResponse.json({ 
      error: 'Failed to update report',
      details: error.message || 'Unknown error',
      type: error.name || 'Error'
    }, { status: 500 });
  }
}
