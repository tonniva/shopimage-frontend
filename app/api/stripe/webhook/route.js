import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  // Initialize clients inside the function
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object, supabase);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object, supabase);
      break;

    case 'payment_intent.canceled':
      await handlePaymentCanceled(event.data.object, supabase);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent, supabase) {
  console.log('✅ Payment succeeded:', paymentIntent.id);

  try {
    // Update order status to paid
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        stripe_payment_id: paymentIntent.id,
        paid_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent', paymentIntent.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order:', error);
      throw error;
    }

    console.log('✅ Order updated to paid:', data.order_number);

    // TODO: Send confirmation email to customer
    // await sendOrderConfirmationEmail(data);

    // TODO: Notify admin of new paid order
    // await notifyAdmin(data);

  } catch (error) {
    console.error('❌ Error in handlePaymentSuccess:', error);
  }
}

async function handlePaymentFailed(paymentIntent, supabase) {
  console.log('❌ Payment failed:', paymentIntent.id);

  try {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed'
      })
      .eq('stripe_payment_intent', paymentIntent.id);

    console.log('Order marked as failed');

  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}

async function handlePaymentCanceled(paymentIntent, supabase) {
  console.log('⚠️ Payment canceled:', paymentIntent.id);

  try {
    await supabase
      .from('orders')
      .update({
        payment_status: 'canceled'
      })
      .eq('stripe_payment_intent', paymentIntent.id);

  } catch (error) {
    console.error('Error in handlePaymentCanceled:', error);
  }
}

// Important: Disable body parsing for Stripe webhooks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

