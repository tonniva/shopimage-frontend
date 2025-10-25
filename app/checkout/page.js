"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShoppingCart, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShippingAddress from "../../components/ShippingAddress";

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
  const [isAddressReady, setIsAddressReady] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);

  // ✅ ฟังก์ชันคำนวณค่าจัดส่ง
  const calculateShippingCost = (country) => {
    switch(country) {
      case 'TH': return 50;  // ประเทศไทย
      case 'US': return 200; // สหรัฐอเมริกา
      case 'GB': return 200; // สหราชอาณาจักร
      case 'AU': return 200; // ออสเตรเลีย
      case 'SG': return 100; // สิงคโปร์
      case 'JP': return 150; // ญี่ปุ่น
      case 'KR': return 150; // เกาหลีใต้
      default: return 150;   // ประเทศอื่นๆ
    }
  };

  // ✅ useEffect สำหรับโหลดข้อมูลเริ่มต้น
  useEffect(() => {
    // ✅ ป้องกันการเรียกซ้ำ
    if (hasInitialized.current) {
      console.log('⚠️ useEffect already called, skipping...');
      return;
    }
    hasInitialized.current = true;

    // Get design data from localStorage
    const savedDesign = localStorage.getItem('mica-checkout-data');
    
    if (!savedDesign) {
      setError('ไม่พบข้อมูลการสั่งซื้อ กรุณาเริ่มใหม่');
      setLoading(false);
      return;
    }

    const data = JSON.parse(savedDesign);
    setDesignData(data);
    setLoading(false); // ✅ โหลดข้อมูลเสร็จแล้ว
  }, []);

  // ✅ useEffect สำหรับสร้าง Payment Intent เมื่อที่อยู่พร้อม
  useEffect(() => {
    if (!designData || !isAddressReady) {
      console.log('⏳ Waiting for design data and shipping address...');
      return;
    }

    // ✅ Check if Payment Intent already exists
    const savedPaymentData = localStorage.getItem('mica-payment-intent');
    if (savedPaymentData) {
      try {
        const paymentData = JSON.parse(savedPaymentData);
        console.log('♻️ Using existing Payment Intent:', paymentData.orderNumber);
        setClientSecret(paymentData.clientSecret);
        setOrderId(paymentData.orderId);
        setOrderNumber(paymentData.orderNumber);
        return;
      } catch (err) {
        console.error('Error parsing saved payment data:', err);
        localStorage.removeItem('mica-payment-intent');
      }
    }

    // ✅ Create new payment intent only if not exists
    console.log('🆕 Creating new Payment Intent with shipping address...');
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: (designData.totalPrice + shippingCost) * 100, // รวมค่าจัดส่ง
        customerInfo: {
          name: designData.customerName,
          email: designData.customerEmail,
          phone: designData.customerPhone
        },
        designData: {
          productType: 'mica-magnetic-photos',
          quantity: designData.quantity,
          imagePositions: designData.imagePositions,
          imageZoom: designData.imageZoom,
          selectedBackground: designData.selectedBackground,
          selectedSize: designData.selectedSize
        },
        fileUrls: designData.fileUrls,
        sceneUrl: designData.sceneUrl,
        shippingAddress: shippingAddress, // ✅ เพิ่มที่อยู่จัดส่ง
        shippingCost: shippingCost // ✅ เพิ่มค่าจัดส่ง
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        throw new Error(result.error);
      }
      
      // ✅ Save Payment Intent to localStorage to prevent duplicate creation
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
    })
    .catch(err => {
      setError(err.message);
    });
  }, [designData, isAddressReady, shippingAddress, shippingCost]); // ✅ dependencies สำหรับ Payment Intent

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-lg font-semibold">กำลังเตรียมการชำระเงิน...</p>
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
            <h2 className="text-2xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/mica-magnetic-photos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowLeft size={20} />
              กลับไปหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <CreditCard className="text-purple-600" size={32} />
              ชำระเงิน
            </h1>
            <p className="text-gray-600">
              Order #{orderNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart size={20} />
                สรุปรายการสั่งซื้อ
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">สินค้า:</span>
                  <span className="font-semibold">Mica Magnetic Photos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวน:</span>
                  <span className="font-semibold">{designData?.quantity} รูป</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ขนาด:</span>
                  <span className="font-semibold">{designData?.sizeLabel}</span>
                </div>
                
                {/* ✅ เพิ่มค่าจัดส่ง */}
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าจัดส่ง:</span>
                  <span className="font-semibold">฿{shippingCost}</span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">ยอดรวมทั้งหมด:</span>
                    <span className="font-bold text-purple-600 text-2xl">
                      ฿{(designData?.totalPrice || 0) + shippingCost}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">ข้อมูลลูกค้า</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">ชื่อ:</span>
                  <span className="font-semibold ml-2">{designData?.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">อีเมล:</span>
                  <span className="font-semibold ml-2">{designData?.customerEmail}</span>
                </div>
                {designData?.customerPhone && (
                  <div>
                    <span className="text-gray-600">โทรศัพท์:</span>
                    <span className="font-semibold ml-2">{designData?.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <ShippingAddress
              onAddressChange={(address) => {
                setShippingAddress(address);
                
                // ✅ คำนวณค่าจัดส่งตามประเทศ
                const cost = calculateShippingCost(address.country || 'TH');
                setShippingCost(cost);
                
                // ✅ ตรวจสอบว่าที่อยู่ครบถ้วนแล้วหรือยัง
                const isComplete = address.recipient_name && 
                                  address.phone && 
                                  address.address_line_1 && 
                                  address.city && 
                                  address.province && 
                                  address.postal_code;
                
                console.log('📍 Address validation:', {
                  recipient_name: !!address.recipient_name,
                  phone: !!address.phone,
                  address_line_1: !!address.address_line_1,
                  city: !!address.city,
                  province: !!address.province,
                  postal_code: !!address.postal_code,
                  country: address.country,
                  shippingCost: cost,
                  isComplete
                });
                
                setIsAddressReady(isComplete);
              }}
              onValidationError={(errors) => {
                setAddressErrors(errors);
              }}
              provider="simple" // ✅ ใช้ Simple Form ที่ใช้งานง่าย
              country="TH"
              required={true}
            />

          </div>

          {/* Right - Payment Form */}
          <div>
            <div className="bg-white border-2 border-black rounded-xl p-6   top-8">
              <h3 className="text-xl font-bold mb-6">วิธีการชำระเงิน</h3>
              
              {/* ✅ แสดงสถานะที่อยู่ */}
              {!isAddressReady && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="text-blue-600">📝</div>
                    <div>
                      <p className="font-semibold text-blue-800">กรุณากรอกข้อมูลการจัดส่ง</p>
                      <p className="text-sm text-blue-700">ชื่อผู้รับ, เบอร์โทร, และที่อยู่หลัก (ฟิลด์อื่นๆ เป็นตัวเลือก)</p>
                    </div>
                  </div>
                </div>
              )}
              
              {clientSecret && isAddressReady && (
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#9333ea',
                      }
                    }
                  }}
                >
                  <CheckoutForm orderId={orderId} orderNumber={orderNumber} />
                </Elements>
              )}
              
              {!clientSecret && isAddressReady && (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={32} />
                  <p className="text-gray-600">กำลังเตรียมการชำระเงิน...</p>
                </div>
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

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // ✅ Don't send order_id, let order-success page fetch it from payment_intent
        return_url: `${window.location.origin}/order-success`,
      },
    });

    // This point will only be reached if there's an immediate error
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
            กำลังดำเนินการ...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            ชำระเงิน
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 ชำระเงินอย่างปลอดภัยด้วย Stripe
      </p>
    </form>
  );
}

