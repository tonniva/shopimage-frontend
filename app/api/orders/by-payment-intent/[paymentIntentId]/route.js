import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request, { params }) {
  try {
    const { paymentIntentId } = await params;

    console.log('🔍 Fetching order by payment intent:', paymentIntentId);

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase URL' },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' },
        { status: 500 }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('✅ Supabase client created');

    // Fetch order by stripe_payment_intent
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent', paymentIntentId)
      .maybeSingle();

    if (error) {
      console.error('❌ Supabase error fetching order:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    if (!order) {
      console.log('⚠️  Order not found for payment intent:', paymentIntentId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Order found:', order.order_number, '- Status:', order.payment_status);
    return NextResponse.json({ order });

  } catch (error) {
    console.error('❌ Error in GET /api/orders/by-payment-intent/[paymentIntentId]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

