'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { 
  Camera, 
  MapPin, 
  Save, 
  ArrowLeft, 
  Share2,
  Star,
  Upload,
  X,
  CheckCircle
} from 'lucide-react';
import { trackPropertySnap } from '@/lib/analytics';

export default function CreatePropertySnapPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const fileInputRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [locationInput, setLocationInput] = useState('');
  const [useCoordinates, setUseCoordinates] = useState(false);

  // ถ้าไม่ได้ล็อกอิน → เด้งไป /login
  useEffect(() => { 
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      setImages(prev => [...prev, ...newImages]);
      
      // Track image upload
      const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      trackPropertySnap.upload(validFiles.length, totalSize);
    }
  };

  const removeImage = (id) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleLocationSelect = async (lat, lng, address) => {
    setLocation({ lat, lng, address });
    
    // Fetch nearby places
    try {
      const response = await fetch('/api/google-places/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { lat, lng },
          radius: 2000,
          type: 'point_of_interest'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const places = data.results?.slice(0, 8).map(place => ({
          name: place.name,
          type: place.primary_type || place.types?.[0] || 'สถานที่',
          distance: place.distance ? `${(place.distance / 1000).toFixed(1)} กม.` : 'ไม่ระบุ',
          rating: place.rating || 0,
          photo_url: place.primary_photo?.url || null,
          place_id: place.place_id,
          formatted_address: place.formatted_address || null,
          phone: place.phone || null,
          website: place.website || null,
          google_url: place.google_url || null,
          price_level: place.price_level || null,
          opening_hours: place.opening_hours || null,
          reviews: place.reviews || [],
          user_ratings_total: place.user_ratings_total || 0,
          types: place.types || []
        })) || [];
        
        setNearbyPlaces(places);
      } else {
        console.error('Google Places API error:', response.status);
        // Use mock data as fallback
        const mockPlaces = [
          { name: 'สถานีขนส่ง', type: 'transit_station', distance: '0.5 กม.', rating: 4.0, photo_url: '/api/placeholder/400/200' },
          { name: 'ตลาดสด', type: 'market', distance: '0.8 กม.', rating: 3.8 },
          { name: 'โรงพยาบาล', type: 'hospital', distance: '1.2 กม.', rating: 4.2, photo_url: '/api/placeholder/400/200' },
          { name: 'โรงเรียน', type: 'school', distance: '1.5 กม.', rating: 4.1 },
          { name: 'วัด', type: 'temple', distance: '2.0 กม.', rating: 4.5, photo_url: '/api/placeholder/400/200' }
        ];
        setNearbyPlaces(mockPlaces);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนสร้างรายงาน');
      return;
    }

    if (images.length === 0) {
      alert('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป');
      return;
    }

    if (!location) {
      alert('กรุณาระบุตำแหน่ง');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      
      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image.file);
      });
      
      // Add location data
      formDataToSend.append('location', JSON.stringify(location));
      formDataToSend.append('nearbyPlaces', JSON.stringify(nearbyPlaces));
      formDataToSend.append('title', 'รายงานอสังหาริมทรัพย์');
      formDataToSend.append('description', 'รายงานอสังหาริมทรัพย์ที่สร้างจาก Property Snap');

      setUploadProgress(50);

      const response = await fetch('/api/property-snap/create', {
        method: 'POST',
        body: formDataToSend
      });

      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        
        // Track successful report creation
        trackPropertySnap.create(result.reportId, images.length, nearbyPlaces.length);
        
        router.push(`/property-snap/success/${result.shareToken}`);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`Failed to create report: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      const errorMessage = error.message.includes('Failed to create report:') 
        ? error.message 
        : `เกิดข้อผิดพลาดในการสร้างรายงาน: ${error.message}`;
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const steps = [
    { number: 1, title: 'อัปโหลดรูป', icon: Camera, completed: images.length > 0 },
    { number: 2, title: 'ระบุตำแหน่ง', icon: MapPin, completed: !!location },
    { number: 3, title: 'ข้อมูลเพิ่มเติม', icon: Save, completed: false }
  ];

  // Helper function to get place icon
  const getPlaceIcon = (type) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'shopping_mall': 
      case 'shopping': return '🛍️';
      case 'transit_station':
      case 'transit': return '🚇';
      case 'restaurant': return '🍽️';
      case 'gas_station': return '⛽';
      case 'bank': return '🏦';
      case 'pharmacy': return '💊';
      case 'park': return '🌳';
      case 'gym': return '💪';
      case 'library': return '📚';
      case 'church': return '⛪';
      case 'mosque': return '🕌';
      case 'temple': return '🏛️';
      case 'police': return '👮';
      case 'fire_station': return '🚒';
      case 'post_office': return '📮';
      case 'atm': return '🏧';
      case 'convenience_store': return '🏪';
      case 'supermarket': return '🛒';
      case 'market': return '🏪';
      default: return '📍';
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🏠 Property Snap</h1>
                <p className="text-sm text-gray-600">สร้างรายงานอสังหาริมทรัพย์</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                ขั้นตอน {step} จาก 3
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((stepItem, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  stepItem.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step === stepItem.number
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {stepItem.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  stepItem.completed ? 'text-green-600' : 
                  step === stepItem.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    steps[index + 1].completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Image Upload */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Camera className="w-6 h-6" />
                อัปโหลดรูปภาพ
              </h2>
              
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">คลิกเพื่อเลือกรูปภาพ</p>
                <p className="text-sm text-gray-500">รองรับ JPG, PNG ขนาดไม่เกิน 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    รูปภาพที่เลือก ({images.length} รูป)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={images.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  ถัดไป
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                ระบุตำแหน่ง
              </h2>
              
              {/* Location Input Toggle */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setUseCoordinates(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !useCoordinates 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Google Maps Link
                  </button>
                  <button
                    onClick={() => setUseCoordinates(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      useCoordinates 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    พิกัด
                  </button>
                </div>

                {!useCoordinates ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ลิงก์ Google Maps
                    </label>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const coords = extractCoordinatesFromGoogleMapsLink(locationInput);
                        if (coords) {
                          handleLocationSelect(coords.lat, coords.lng, `ตำแหน่งจาก Google Maps (${coords.lat}, ${coords.lng})`);
                        } else {
                          alert('ไม่สามารถดึงพิกัดจากลิงก์ได้ กรุณาตรวจสอบลิงก์');
                        }
                      }}
                      className="mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ดึงพิกัด
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ละติจูด (Latitude)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="13.7563"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setLocationInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ลองจิจูด (Longitude)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="100.5018"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => {
                          const lat = document.querySelector('input[placeholder="13.7563"]').value;
                          const lng = e.target.value;
                          if (lat && lng) {
                            handleLocationSelect(parseFloat(lat), parseFloat(lng), `ตำแหน่ง (${lat}, ${lng})`);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Location */}
              {location && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">ตำแหน่งที่เลือก:</h3>
                  <p className="text-green-700">{location.address}</p>
                  <p className="text-sm text-green-600">
                    ละติจูด: {location.lat}, ลองจิจูด: {location.lng}
                  </p>
                </div>
              )}

              {/* Nearby Places Preview */}
              {nearbyPlaces.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานที่ใกล้เคียง
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {nearbyPlaces.map((place, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        {/* Photo */}
                        <div className="mb-3">
                          {place.photo_url ? (
                            <img 
                              src={place.photo_url} 
                              alt={place.name}
                              className="w-full h-24 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                              <span className="text-3xl">{getPlaceIcon(place.type)}</span>
                            </div>
                          )}
                          {place.photo_url && (
                            <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200 hidden">
                              <span className="text-3xl">{getPlaceIcon(place.type)}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{place.name}</h4>
                          {place.distance && (
                            <div className="flex items-center text-xs text-blue-600 font-medium">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{place.distance}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ย้อนกลับ
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      กำลังสร้างรายงาน...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      สร้างรายงาน
                    </>
                  )}
                </button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    กำลังประมวลผล... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract coordinates from Google Maps link
function extractCoordinatesFromGoogleMapsLink(url) {
  try {
    // Handle different Google Maps URL formats
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // @lat,lng
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,  // !3dlat!4dlng
      /center=(-?\d+\.?\d*)%2C(-?\d+\.?\d*)/,  // center=lat%2Clng
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return null;
  }
}
