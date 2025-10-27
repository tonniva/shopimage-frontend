import { NextResponse } from 'next/server';
import { createServerSupabase, createServerSupabaseAdmin } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// Helper function to check admin
async function checkAdmin() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    const isAdmin = true; // Temporarily allow all logged-in users
    
    if (!isAdmin) {
      return { isAdmin: false, error: 'Forbidden' };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error('Error checking admin:', error);
    return { isAdmin: false, error: error.message };
  }
}

// PUT - Update ad
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const adminCheck = await checkAdmin();
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    // Handle both FormData and JSON
    const contentType = request.headers.get('content-type') || '';
    let data = {};
    let image = null;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      image = formData.get('image');
      const dataStr = formData.get('data');
      
      if (!dataStr) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
      }

      data = JSON.parse(dataStr);
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.data) {
        data = JSON.parse(body.data);
      } else {
        // Direct status update
        data = { status: body.status || 'inactive' };
      }
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
    
    // Check if ad exists
    const existingAd = await prisma.advertisement.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Handle image upload
    let imageUrl = existingAd.imageUrl;
    if (image && image instanceof File) {
      const adminSupabase = createServerSupabaseAdmin();
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate unique filename
      const timestamp = Date.now();
      const ext = image.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}.${ext}`;
      const filePath = `advertise/${filename}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await adminSupabase.storage
        .from('shopimage')
        .upload(filePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: image.type
        });

      if (!uploadError) {
        const { data: { publicUrl } } = adminSupabase.storage
          .from('shopimage')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
    }

    // Update in database
    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        link: data.link,
        imageUrl,
        status: data.status || existingAd.status,
        priority: parseInt(data.priority) || existingAd.priority,
        weight: parseInt(data.weight) || existingAd.weight,
        position: data.position || existingAd.position,
        targetPages: data.targetPages || existingAd.targetPages,
        startDate: data.startDate ? new Date(data.startDate) : existingAd.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existingAd.endDate
      }
    });

    return NextResponse.json({ success: true, ad });

  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete ad
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const adminCheck = await checkAdmin();
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    // Check if ad exists
    const existingAd = await prisma.advertisement.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Delete from database (cascade will handle file deletion if needed)
    await prisma.advertisement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ad', details: error.message },
      { status: 500 }
    );
  }
}

