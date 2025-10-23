"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentIntent) {
      setError('Payment information not found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        console.log('🔍 Fetching order by payment intent:', paymentIntent);
        const response = await fetch(`/api/orders/by-payment-intent/${paymentIntent}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const result = await response.json();
        
        if (result.error) {
          setError(result.error);
        } else if (!result.order) {
          setError('Order not found');
        } else {
          console.log('✅ Order found:', result.order.order_number, '- Status:', result.order.payment_status);
          setOrder(result.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Unable to load order details');
      }
      setLoading(false);
    };

    fetchOrder();
    localStorage.removeItem('mica-checkout-data');
    localStorage.removeItem('mica-payment-intent'); // ✅ Clear payment intent too
  }, [paymentIntent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-lg font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <Link
            href="/en/mica-magnetic-photos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">Thank you for your order</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Order Number</label>
                <p className="font-bold text-lg text-purple-600">{order.order_number}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Payment Status</label>
                <p className="font-semibold">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Customer Name</label>
                <p className="font-semibold">{order.customer_name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-semibold">{order.customer_email}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <p className="font-semibold">{order.quantity} images</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Product Price</label>
                <p className="font-semibold">฿{(order.total_price - (order.shipping_cost || 0)).toFixed(2)}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Shipping Cost</label>
                <p className="font-semibold">฿{order.shipping_cost || 0}</p>
              </div>

              <div className="md:col-span-2 border-t-2 border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <label className="text-lg font-bold">Total Amount</label>
                  <p className="font-bold text-xl text-purple-600">฿{order.total_price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.recipient_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.address_line_1}</span>
                </div>
                {order.shipping_address.address_line_2 && (
                  <div>
                    <span className="text-gray-600">Additional Details:</span>
                    <span className="font-semibold ml-2">{order.shipping_address.address_line_2}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">City/District:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.city}</span>
                </div>
                <div>
                  <span className="text-gray-600">Province/State:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.province}</span>
                </div>
                <div>
                  <span className="text-gray-600">Postal Code:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.postal_code}</span>
                </div>
                <div>
                  <span className="text-gray-600">Country:</span>
                  <span className="font-semibold ml-2">{order.shipping_address.country}</span>
                </div>
              </div>
            </div>
          )}
          {order.scene_url && (
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Your Design</h3>
              <img
                src={order.scene_url}
                alt="Your design"
                className="w-full rounded-lg border-2 border-gray-300"
              />
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mail className="text-blue-600" size={20} />
              Next Steps
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <p>Confirmation email sent to <strong>{order.customer_email}</strong></p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <p>Production will begin within 1-2 business days</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <p>You will receive shipping notification when ready</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <p>Expected delivery: 3-5 business days</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/en/mica-magnetic-photos"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-black rounded-lg hover:bg-gray-50 font-semibold transition-all"
            >
              <ArrowLeft size={20} />
              Order Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

