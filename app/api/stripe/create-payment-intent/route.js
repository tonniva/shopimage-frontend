import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  // Initialize clients inside the function
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { amount, customerInfo, designData, fileUrls, sceneUrl, shippingAddress, shippingCost } = await request.json();

    // Validate input
    if (!amount || !customerInfo || !designData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // 1. Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone || null,
        product_type: designData.productType || 'mica-magnetic-photos',
        quantity: designData.quantity || fileUrls?.length || 1,
        total_price: amount / 100, // Convert from cents to baht
        shipping_cost: shippingCost || 0, // ✅ เพิ่มค่าจัดส่ง
        design_data: designData,
        file_urls: fileUrls || [],
        scene_url: sceneUrl || null,
        shipping_address: shippingAddress || null, // ✅ เพิ่มที่อยู่จัดส่ง
        payment_status: 'pending',
        production_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Supabase error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // 2. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in cents (satang)
      currency: 'thb',
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_email: customerInfo.email,
        product_type: order.product_type,
        quantity: order.quantity
      },
      description: `Order ${order.order_number} - ${order.product_type}`,
      receipt_email: customerInfo.email
    });

    // 3. Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent: paymentIntent.id })
      .eq('id', order.id);

    console.log('✅ Order created:', order.order_number);
    console.log('✅ Payment Intent created:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.order_number
    });

  } catch (error) {
    console.error('❌ Payment intent error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function generateOrderNumber() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${date}-${random}`;
}

