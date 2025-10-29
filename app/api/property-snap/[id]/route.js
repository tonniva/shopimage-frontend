import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { deletePropertyReportImagesServer } from '@/lib/storage-server';

/**
 * GET /api/property-snap/[id]
 * Get a property report by ID (for owner/admin to view status)
 */

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Get the report
    const report = await prisma.propertyReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Transform data for frontend
    const transformedReport = {
      id: report.id,
      shareToken: report.shareToken,
      title: report.title,
      description: report.description,
      status: report.status,
      rejectionReason: report.rejectionReason,
      reviewedBy: report.reviewedBy,
      reviewedAt: report.reviewedAt,
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
      province: report.province,
      region: report.region,
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
      viewCount: report.viewCount,
      shareCount: report.shareCount,
      user: {
        name: report.user.name || 'ผู้ใช้',
        id: report.userId
      }
    };

    return NextResponse.json({
      report: transformedReport
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

/**
 * PUT /api/property-snap/[id]
 * Update a property report
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    console.log('📝 PUT /api/property-snap/' + id, 'starting...');
    
    // Get authenticated user
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Auth failed:', authError || 'No user');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please login to update reports', type: 'AuthError' },
        { status: 401 }
      );
    }
    
    console.log('✅ Auth success:', user.email);

    // Get user from User table
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true }
    });

    if (!dbUser) {
      console.log('❌ User not found in database:', user.email);
      return NextResponse.json(
        { error: 'User not found', details: 'Your account is not in the database', type: 'UserNotFound' },
        { status: 403 }
      );
    }

    console.log('✅ DB User found:', dbUser.id);

    // Get the report to check ownership
    const report = await prisma.propertyReport.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!report) {
      console.log('❌ Report not found:', id);
      return NextResponse.json(
        { error: 'Report not found', details: `No report found with id: ${id}`, type: 'NotFound' },
        { status: 404 }
      );
    }
    
    console.log('✅ Report found, owner userId:', report.userId);

    // Check ownership - compare userId (cuid) with dbUser.id
    if (report.userId !== dbUser.id) {
      console.log('❌ Ownership check failed:', report.userId, 'vs', dbUser.id);
      return NextResponse.json(
        { error: 'Forbidden', details: 'You can only update your own reports', type: 'Forbidden' },
        { status: 403 }
      );
    }
    
    console.log('✅ Ownership verified');

    // Parse form data
    console.log('📦 Parsing form data...');
    const formData = await request.formData();
    
    console.log('📊 Form data received:', {
      title: formData.get('title'),
      hasImages: formData.getAll('images').length > 0,
      imageCount: formData.getAll('images').length
    });
    
    // Parse location if provided
    let locationData = null;
    const locationString = formData.get('location');
    if (locationString) {
      try {
        locationData = JSON.parse(locationString);
      } catch (e) {
        console.error('Error parsing location:', e);
      }
    }

    // Parse nearby places if provided
    let nearbyPlacesData = [];
    const nearbyPlacesString = formData.get('nearbyPlaces');
    if (nearbyPlacesString) {
      try {
        nearbyPlacesData = JSON.parse(nearbyPlacesString);
      } catch (e) {
        console.error('Error parsing nearby places:', e);
      }
    }

    // Parse image order if provided
    let imageOrderData = [];
    const imageOrderString = formData.get('imageOrder');
    if (imageOrderString) {
      try {
        imageOrderData = JSON.parse(imageOrderString);
        console.log('📸 Received image order:', imageOrderData.length, 'images');
      } catch (e) {
        console.error('Error parsing image order:', e);
      }
    }

    const updates = {
      title: formData.get('title') || undefined,
      description: formData.get('description') || undefined,
      propertyType: formData.get('propertyType') || undefined,
      listingType: formData.get('listingType') || undefined,
      price: formData.get('price') ? parseFloat(formData.get('price')) : undefined,
      area: formData.get('area') ? parseFloat(formData.get('area')) : undefined,
      landArea: formData.get('landArea') ? parseFloat(formData.get('landArea')) : undefined,
      bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms')) : undefined,
      bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms')) : undefined,
      floors: formData.get('floors') ? parseInt(formData.get('floors')) : undefined,
      buildingAge: formData.get('buildingAge') ? parseInt(formData.get('buildingAge')) : undefined,
      contactPhone: formData.get('contactPhone') || undefined,
      contactEmail: formData.get('contactEmail') || undefined,
      contactLine: formData.get('contactLine') || undefined,
      province: formData.get('province') || undefined,
      region: formData.get('region') || undefined,
      locationLat: locationData?.lat || formData.get('locationLat') ? parseFloat(formData.get('locationLat')) : undefined,
      locationLng: locationData?.lng || formData.get('locationLng') ? parseFloat(formData.get('locationLng')) : undefined,
      address: locationData?.address || formData.get('address') || undefined,
      formattedAddress: locationData?.formattedAddress || formData.get('formattedAddress') || undefined,
      nearbyPlaces: nearbyPlacesData.length > 0 ? nearbyPlacesData : undefined,
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    console.log('📝 Updates to apply:', Object.keys(updates));

    // Get existing report data to preserve required fields
    const existingReport = await prisma.propertyReport.findUnique({
      where: { id },
      select: { 
        userImages: true,
        locationLat: true,
        locationLng: true,
        address: true,
        formattedAddress: true,
        nearbyPlaces: true
      }
    });

    // If location updates don't include lat/lng, use existing values
    if (!updates.locationLat && !updates.locationLng && existingReport) {
      updates.locationLat = existingReport.locationLat;
      updates.locationLng = existingReport.locationLng;
      console.log('📍 Using existing location:', { lat: updates.locationLat, lng: updates.locationLng });
    }

    // If address is not being updated, keep existing address
    if (!updates.address && existingReport?.address) {
      updates.address = existingReport.address;
    }
    if (!updates.formattedAddress && existingReport?.formattedAddress) {
      updates.formattedAddress = existingReport.formattedAddress;
    }

    // If nearbyPlaces is not being updated, keep existing nearbyPlaces
    if (!updates.nearbyPlaces && existingReport?.nearbyPlaces) {
      updates.nearbyPlaces = existingReport.nearbyPlaces;
    }

    const existingImages = existingReport?.userImages || [];

    // Process new images if any
    const imageFiles = [];
    const imageEntries = Array.from(formData.getAll('images'));
    
    for (const entry of imageEntries) {
      if (entry instanceof File) {
        imageFiles.push(entry);
      }
    }

    let updatedImages = existingImages;

    // If image order is provided, reorder images according to the new order
    if (imageOrderData.length > 0) {
      console.log('🔄 Reordering images according to provided order');
      
      // Map of existing images by URL
      const existingImagesMap = new Map();
      if (Array.isArray(existingImages)) {
        existingImages.forEach((img, idx) => {
          const url = typeof img === 'string' ? img : img.url;
          existingImagesMap.set(url, img);
        });
      }
      
      // Build ordered images array from imageOrderData
      updatedImages = imageOrderData.map(imgOrder => {
        // If it's marked as new, it will be uploaded later
        if (imgOrder.isNew) {
          return { url: imgOrder.url, alt: imgOrder.alt };
        }
        // Otherwise, use existing image data
        const url = imgOrder.url;
        const existingImg = existingImagesMap.get(url);
        return existingImg || { url: url, alt: imgOrder.alt };
      });
      
      console.log('✅ Reordered images:', updatedImages.length);
    }

    if (imageFiles.length > 0) {
      // Upload new images to Supabase storage
      const uploadedUrls = [];
      
      for (const file of imageFiles) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `property-snap/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-snap')
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('property-snap')
            .getPublicUrl(filePath);

          uploadedUrls.push({
            url: publicUrl,
            alt: file.name
          });
        } catch (uploadErr) {
          console.error('Error uploading file:', uploadErr);
        }
      }

      // If image order is provided, replace new image URLs in the ordered array
      if (imageOrderData.length > 0) {
        console.log('🔄 Replacing new image URLs in ordered array');
        let uploadIndex = 0;
        updatedImages = updatedImages.map(img => {
          // Check if this was marked as new
          const imgOrder = imageOrderData.find(io => io.url === img.url || io.url === img);
          if (imgOrder && imgOrder.isNew && uploadIndex < uploadedUrls.length) {
            const newImg = uploadedUrls[uploadIndex];
            uploadIndex++;
            return { url: newImg.url, alt: newImg.alt };
          }
          return img;
        });
        
        // Add any remaining uploaded images at the end if there are more uploads than new images
        if (uploadIndex < uploadedUrls.length) {
          updatedImages = [...updatedImages, ...uploadedUrls.slice(uploadIndex)];
        }
      } else {
        // No image order provided, just append new images
        updatedImages = [...existingImages, ...uploadedUrls];
      }
    }

    // Update the report
    const updatedReport = await prisma.propertyReport.update({
      where: { id },
      data: {
        ...updates,
        userImages: updatedImages,
        updatedAt: new Date()
      },
      select: {
        id: true,
        shareToken: true,
        title: true,
        status: true
      }
    });

    console.log('✅ Report updated successfully:', updatedReport.id);

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      shareToken: updatedReport.shareToken,
      reportId: updatedReport.id
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update report',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/property-snap/[id]
 * Delete a property report
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    console.log('🗑️ DELETE /api/property-snap/' + id, 'starting...');
    
    // Get authenticated user
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Auth failed:', authError || 'No user');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please login to delete reports', type: 'AuthError' },
        { status: 401 }
      );
    }
    
    console.log('✅ Auth success:', user.email);

    // Get user from User table
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true }
    });

    if (!dbUser) {
      console.log('❌ User not found in database:', user.email);
      return NextResponse.json(
        { error: 'User not found', details: 'Your account is not in the database', type: 'UserNotFound' },
        { status: 403 }
      );
    }

    console.log('✅ DB User found:', dbUser.id);

    // Get the report to check ownership
    const report = await prisma.propertyReport.findUnique({
      where: { id },
      select: { 
        id: true,
        userId: true,
        userImages: true
      }
    });

    if (!report) {
      console.log('❌ Report not found:', id);
      return NextResponse.json(
        { error: 'Report not found', details: `No report found with id: ${id}`, type: 'NotFound' },
        { status: 404 }
      );
    }
    
    console.log('✅ Report found, owner userId:', report.userId);

    // Check ownership - compare userId (cuid) with dbUser.id
    if (report.userId !== dbUser.id) {
      console.log('❌ Ownership check failed:', report.userId, 'vs', dbUser.id);
      return NextResponse.json(
        { error: 'Forbidden', details: 'You can only delete your own reports', type: 'Forbidden' },
        { status: 403 }
      );
    }
    
    console.log('✅ Ownership verified');

    // Delete images from Supabase Storage if they exist
    try {
      await deletePropertyReportImagesServer(dbUser.id, id);
      console.log('✅ Images deleted from storage');
    } catch (storageError) {
      console.error('⚠️ Warning: Failed to delete images from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete the report from database
    await prisma.propertyReport.delete({
      where: {
        id,
        userId: dbUser.id
      }
    });

    console.log('✅ Report deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete report',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
