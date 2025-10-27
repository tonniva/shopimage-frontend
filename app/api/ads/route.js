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

    // For development: Allow all logged-in users
    const isAdmin = true;
    
    if (!isAdmin) {
      return { isAdmin: false, error: 'Forbidden' };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error('Error checking admin:', error);
    return { isAdmin: false, error: error.message };
  }
}

// GET - Fetch all ads
export async function GET(request) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, ads });

  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ads', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new ad
export async function POST(request) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const formData = await request.formData();
    const image = formData.get('image');
    const dataStr = formData.get('data');
    
    if (!dataStr) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const data = JSON.parse(dataStr);
    
    // Handle image upload
    let imageUrl = '';
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

    // Find Prisma User from Supabase user
    const prismaUser = await prisma.user.findUnique({
      where: { email: adminCheck.user.email },
      select: { id: true }
    });

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Save to database
    const ad = await prisma.advertisement.create({
      data: {
        title: data.title,
        description: data.description,
        link: data.link,
        imageUrl,
        type: 'image',
        status: data.status || 'inactive',
        priority: parseInt(data.priority) || 5,
        weight: parseInt(data.weight) || 1,
        position: data.position || 'sidebar',
        targetPages: data.targetPages || ['all'],
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy: prismaUser.id
      }
    });

    return NextResponse.json({ success: true, ad });

  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ad', details: error.message },
      { status: 500 }
    );
  }
}

