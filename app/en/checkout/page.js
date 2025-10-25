"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShoppingCart, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShippingAddress from "../../../components/ShippingAddress";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [designData, setDesignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ เพิ่ม ref เพื่อป้องกันการเรียกซ้ำ
  const hasInitialized = useRef(false);
  
  // ✅ เพิ่ม state สำหรับที่อยู่จัดส่ง
  const [shippingAddress, setShippingAddress] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    // ✅ ป้องกันการเรียกซ้ำ
    if (hasInitialized.current) {
      console.log('⚠️ useEffect already called, skipping...');
      return;
    }
    hasInitialized.current = true;

    const savedDesign = localStorage.getItem('mica-checkout-data');
    
    if (!savedDesign) {
      setError('No order data found. Please start over.');
      setLoading(false);
      return;
    }

    const data = JSON.parse(savedDesign);
    setDesignData(data);

    // ✅ Check if Payment Intent already exists
    const savedPaymentData = localStorage.getItem('mica-payment-intent');
    if (savedPaymentData) {
      try {
        const paymentData = JSON.parse(savedPaymentData);
        console.log('♻️ Using existing Payment Intent:', paymentData.orderNumber);
        setClientSecret(paymentData.clientSecret);
        setOrderId(paymentData.orderId);
        setOrderNumber(paymentData.orderNumber);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error parsing saved payment data:', err);
        localStorage.removeItem('mica-payment-intent');
      }
    }

    // ✅ Create new payment intent only if not exists
    console.log('🆕 Creating new Payment Intent...');
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: data.totalPrice * 100,
        customerInfo: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone
        },
        designData: {
          productType: 'mica-magnetic-photos',
          quantity: data.quantity,
          imagePositions: data.imagePositions,
          imageZoom: data.imageZoom,
          selectedBackground: data.selectedBackground,
          selectedSize: data.selectedSize
        },
        fileUrls: data.fileUrls,
        sceneUrl: data.sceneUrl,
        shippingAddress: shippingAddress // ✅ เพิ่มที่อยู่จัดส่ง
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.error) throw new Error(result.error);
      
      // ✅ Save Payment Intent to localStorage
      const paymentData = {
        clientSecret: result.clientSecret,
        orderId: result.orderId,
        orderNumber: result.orderNumber
      };
      localStorage.setItem('mica-payment-intent', JSON.stringify(paymentData));
      console.log('💾 Payment Intent saved:', result.orderNumber);
      
      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
      setOrderNumber(result.orderNumber);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-lg font-semibold">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/en/mica-magnetic-photos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <CreditCard className="text-purple-600" size={32} />
              Checkout
            </h1>
            <p className="text-gray-600">Order #{orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart size={20} />
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-semibold">Mica Magnetic Photos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{designData?.quantity} images</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold">{designData?.sizeLabel}</span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-purple-600 text-2xl">
                      ฿{designData?.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Customer Information</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold ml-2">{designData?.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold ml-2">{designData?.customerEmail}</span>
                </div>
                {designData?.customerPhone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold ml-2">{designData?.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <ShippingAddress
              onAddressChange={(address, errors) => {
                setShippingAddress(address);
                setAddressErrors(errors);
              }}
              provider="google" // สามารถเปลี่ยนเป็น "simple" หรือ "manual"
              country="TH"
              required={true}
            />
          </div>

          <div>
            <div className="bg-white border-2 border-black rounded-xl p-6   top-8">
              <h3 className="text-xl font-bold mb-6">Payment Method</h3>
              
              {clientSecret && (
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: { colorPrimary: '#9333ea' }
                    }
                  }}
                >
                  <CheckoutForm orderId={orderId} orderNumber={orderNumber} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ orderId, orderNumber }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // ✅ Don't send order_id, let order-success page fetch it from payment_intent
        return_url: `${window.location.origin}/en/order-success`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pay Now
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 Secure payment with Stripe
      </p>
    </form>
  );
}

