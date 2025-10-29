'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  ArrowLeft,
  Save,
  Share2,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Star,
  Phone,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { trackPropertySnap, trackEvent, EVENTS, CATEGORIES as ANALYTICS_CATEGORIES } from '@/lib/analytics';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { validateImageFile, compressImages, formatFileSize } from '@/utils/image-utils';
import ImageProcessingProgress from '@/components/ImageProcessingProgress';
import { ALL_PROVINCES, getAllRegions, getRegionByProvince } from '@/lib/thailand-data';
import { CATEGORIES, getCategorySlug, getProvinceSlug } from '@/lib/property-mappings';

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

// Sortable Image Item Component
function SortableImageItem({ image, index, totalImages, onMoveUp, onMoveDown, onRemove, formatFileSize }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
        <img
          src={image.preview}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Image Order Badge */}
      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
        #{index + 1}
      </div>
      
      {/* Control Buttons */}
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity space-y-1 z-20">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="bg-blue-500 text-white rounded-full p-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          title="เลื่อนขึ้น"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === totalImages - 1}
          className="bg-indigo-500 text-white rounded-full p-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
          title="เลื่อนลง"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => onRemove(image.id)}
          className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
          title="ลบรูป"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-2 left-2 bg-gray-900/70 text-white px-2 py-1 rounded-full text-xs font-semibold cursor-grab active:cursor-grabbing hover:bg-gray-900"
      >
        ⋮⋮ ลากเพื่อเรียงลำดับ
      </div>

      <div className="mt-2 text-xs text-gray-600">
        <p className="truncate">{image.name}</p>
        <p>{formatFileSize(image.size)}</p>
      </div>
    </div>
  );
}

export default function CreatePropertySnapPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  
  // Form states
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  
  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [location, setLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [locationInputType, setLocationInputType] = useState('coordinates'); // 'coordinates' or 'link'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', // Category (e.g., 'ขายบ้าน', 'ให้เช่าคอนโด')
    propertyType: 'house',
    listingType: 'sale',
    price: '',
    area: '',
    landArea: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    buildingAge: '',
    contactPhone: '',
    contactEmail: '',
    contactLine: '',
    province: '',
    region: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingResults, setProcessingResults] = useState(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  
  const fileInputRef = useRef(null);
  const { processImages, processing, progress, error: processingError } = useImageProcessing();

  // Redirect if not logged in
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validationResults = files.map(file => ({
      file,
      validation: validateImageFile(file)
    }));
    
    const validFiles = validationResults.filter(result => result.validation.valid);
    const invalidFiles = validationResults.filter(result => !result.validation.valid);
    
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(result => 
        `${result.file.name}: ${result.validation.errors.join(', ')}`
      ).join('\n');
      alert(`ไฟล์ต่อไปนี้มีปัญหา:\n${errorMessages}`);
    }
    
    if (validFiles.length === 0) {
      return;
    }
    
    // Calculate total size of valid files
    const totalSize = validFiles.reduce((sum, result) => sum + result.file.size, 0);
    
    // Track image upload
    trackPropertySnap.upload(validFiles.length, totalSize);
    
    // Process images with compression
    try {
      setShowProcessingModal(true);
      const compressedFiles = await compressImages(validFiles.map(result => result.file));
      
      // Add processed images to state
      const newImages = compressedFiles.map((file, index) => ({
        id: crypto.randomUUID(),
        file: file,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file),
        originalSize: validFiles[index].file.size,
        compressionRatio: Math.round(((validFiles[index].file.size - file.size) / validFiles[index].file.size) * 100)
      }));
      
      const updatedImages = [...images, ...newImages].slice(0, 10); // Max 10 images
      setImages(updatedImages);
      
      // Track upload with processed data
      trackPropertySnap.upload(updatedImages.length, updatedImages.reduce((total, img) => total + img.size, 0));
      
      // Show processing results
      setProcessingResults({
        totalImages: files.length,
        processedCount: validFiles.length,
        errorCount: invalidFiles.length,
        processedImages: newImages.map(img => ({
          filename: img.name,
          originalSize: img.originalSize,
          compressedSize: img.size,
          compressionRatio: img.compressionRatio
        })),
        errors: invalidFiles.map(result => ({
          filename: result.file.name,
          error: result.validation.errors.join(', ')
        }))
      });
      
    } catch (error) {
      console.error('Image processing error:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
    }
  };

  const removeImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
  };

  const moveImageUp = (index) => {
    if (index === 0) return; // Already at top
    const updatedImages = [...images];
    [updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]];
    setImages(updatedImages);
  };

  const moveImageDown = (index) => {
    if (index === images.length - 1) return; // Already at bottom
    const updatedImages = [...images];
    [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];
    setImages(updatedImages);
  };

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extract coordinates from Google Maps link
  const extractCoordinatesFromLink = (link) => {
    try {
      // Handle different Google Maps link formats
      let lat, lng;
      
      // Format 1: https://maps.google.com/maps?q=lat,lng
      const qMatch = link.match(/[?&]q=([^&]+)/);
      if (qMatch) {
        const coords = qMatch[1].split(',');
        if (coords.length >= 2) {
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1]);
        }
      }
      
      // Format 2: https://www.google.com/maps/place/.../@lat,lng,zoom
      const atMatch = link.match(/@([^,]+),([^,]+)/);
      if (atMatch && !lat) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
      }
      
      // Format 3: https://maps.google.com/maps?ll=lat,lng
      const llMatch = link.match(/[?&]ll=([^&]+)/);
      if (llMatch && !lat) {
        const coords = llMatch[1].split(',');
        if (coords.length >= 2) {
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1]);
        }
      }
      
      // Format 4: https://www.google.com/maps/@lat,lng,zoom
      const directMatch = link.match(/\/@([^,]+),([^,]+)/);
      if (directMatch && !lat) {
        lat = parseFloat(directMatch[1]);
        lng = parseFloat(directMatch[2]);
      }
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting coordinates:', error);
      return null;
    }
  };

  // Handle Google Maps link input
  const handleGoogleMapsLink = () => {
    if (!googleMapsLink.trim()) {
      alert('กรุณากรอกลิ้ง Google Maps');
      return;
    }
    
    console.log('Processing Google Maps link:', googleMapsLink);
    const coords = extractCoordinatesFromLink(googleMapsLink);
    console.log('Extracted coordinates:', coords);
    
    if (coords) {
      console.log('Calling handleLocationSelect with:', coords);
      handleLocationSelect(coords.lat, coords.lng, `ตำแหน่งจาก Google Maps (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`);
      setGoogleMapsLink(''); // Clear the input
    } else {
      alert('ไม่สามารถดึงพิกัดจากลิ้งนี้ได้ กรุณาตรวจสอบลิ้ง Google Maps');
    }
  };

  // Handle removing nearby places
  const removeNearbyPlace = (index) => {
    const updatedPlaces = nearbyPlaces.filter((_, i) => i !== index);
    setNearbyPlaces(updatedPlaces);
    trackPropertySnap.places(updatedPlaces.length);
  };

  // Handle province selection
  const handleProvinceChange = (province) => {
    const regionData = getRegionByProvince(province);
    setFormData(prev => ({
      ...prev,
      province: province,
      region: regionData ? regionData.name : ''
    }));
  };

  const handleLocationSelect = async (lat, lng, address) => {
    setLocation({ lat, lng, address });
    
    // Track location selection
    trackPropertySnap.location(lat, lng, address);
    
    try {
      // Call Google Places API to find nearby places
      const response = await fetch('/api/google-places/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: { lat, lng },
          radius: 2000, // 2km radius
          type: 'establishment',
          language: 'th'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Google Places API Response:', data);
        const places = data.places?.map(place => ({
          name: place.name,
          type: place.primary_type || place.types?.[0] || 'สถานที่',
          distance: place.distance ? `${(place.distance / 1000).toFixed(1)} กม.` : 'ไม่ระบุ',
          rating: place.rating || 0,
          photo_url: place.primary_photo?.url || null,
          place_id: place.place_id,
          // Additional details
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
        trackPropertySnap.places(places.length);
        
        //alert(`✅ เลือกตำแหน่งสำเร็จ!\n\n📍 ${address}\n\nพบสถานที่ใกล้เคียง ${places.length} แห่ง`);
      } else {
        throw new Error('Failed to fetch places');
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      console.log('Using fallback mock data');
      
      // Fallback to mock data if API fails
      const mockPlaces = [
        { name: 'สถานีขนส่ง', type: 'transit_station', distance: '0.5 กม.', rating: 4.0, photo_url: '/api/placeholder/400/200' },
        { name: 'ตลาดสด', type: 'market', distance: '0.8 กม.', rating: 3.8 },
        { name: 'โรงพยาบาล', type: 'hospital', distance: '1.2 กม.', rating: 4.2, photo_url: '/api/placeholder/400/200' },
        { name: 'โรงเรียน', type: 'school', distance: '1.5 กม.', rating: 4.1 },
        { name: 'วัด', type: 'temple', distance: '2.0 กม.', rating: 4.5, photo_url: '/api/placeholder/400/200' }
      ];
      
      setNearbyPlaces(mockPlaces);
      trackPropertySnap.places(mockPlaces.length);
      
      //alert(`✅ เลือกตำแหน่งสำเร็จ!\n\n📍 ${address}\n\nพบสถานที่ใกล้เคียง ${mockPlaces.length} แห่ง (ข้อมูลตัวอย่าง)`);
    }
  };

  const handleSubmit = async () => {
    if (!images.length || !location) {
      alert('กรุณาอัปโหลดรูปภาพและระบุตำแหน่ง');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title || 'Property Report');
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', JSON.stringify(location));
      formDataToSend.append('nearbyPlaces', JSON.stringify(nearbyPlaces));
      
      // Add new property fields
      formDataToSend.append('category', formData.category); // Category for SEO
      formDataToSend.append('categorySlug', getCategorySlug(formData.category)); // Category slug
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('listingType', formData.listingType);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('landArea', formData.landArea);
      formDataToSend.append('bedrooms', formData.bedrooms);
      formDataToSend.append('bathrooms', formData.bathrooms);
      formDataToSend.append('floors', formData.floors);
      formDataToSend.append('buildingAge', formData.buildingAge);
      
      // Add contact fields
      formDataToSend.append('contactPhone', formData.contactPhone);
      formDataToSend.append('contactEmail', formData.contactEmail);
      formDataToSend.append('contactLine', formData.contactLine);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('provinceSlug', getProvinceSlug(formData.province)); // Province slug
      formDataToSend.append('region', formData.region);
      
      images.forEach(image => {
        formDataToSend.append('images', image.file);
      });

      // Debug: Log form data being sent
      console.log('Form data being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'images') {
          console.log(`${key}: [File object]`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Debug: Log current form state
      console.log('Current form state:', formData);
      console.log('Current location:', location);
      console.log('Current nearby places:', nearbyPlaces);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/property-snap/create', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        
        // Track successful report creation
        trackPropertySnap.create(result.reportId, images.length, nearbyPlaces.length);
        
        router.push(`/property-snap/success/${result.shareToken}`);
      } else {
        console.log('API Response not OK, status:', response.status);
        console.log('API Response statusText:', response.statusText);
        
        let errorData;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            errorData = text ? JSON.parse(text) : {};
          } else {
            const text = await response.text();
            errorData = text ? { error: text, details: text } : { error: 'Unknown error' };
          }
          console.log('API Error Data:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { 
            error: `HTTP ${response.status}: ${response.statusText}`, 
            details: 'Failed to parse error response' 
          };
        }
        
        console.error('API Error:', errorData);
        
        // Show more detailed error message
        const errorMessage = errorData.details || errorData.error || 'Unknown error';
        const errorType = errorData.type || 'Error';
        
        throw new Error(`${errorType}: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      
      // Show detailed error message
      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างรายงาน';
      
      if (error.message.includes('DatabaseError:')) {
        errorMessage = 'เกิดข้อผิดพลาดฐานข้อมูล: ' + error.message.replace('DatabaseError: ', '');
      } else if (error.message.includes('Error:')) {
        errorMessage = error.message.replace('Error: ', '');
      } else {
        errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      }
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b top-0">
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
                ขั้นตอน {step} จาก 2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((stepItem, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  stepItem.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step === stepItem.number
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {stepItem.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  stepItem.completed || step === stepItem.number
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Upload Images */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-600" />
                อัปโหลดรูปภาพอสังหาริมทรัพย์
              </h2>
              
              <div className="mb-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-sm text-gray-500">
                    รองรับ JPG, PNG, WebP (ขนาดไม่เกิน 5MB) สูงสุด 10 รูป
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Preview Grid with Drag & Drop */}
              {images.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map((img) => img.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {images.map((image, index) => (
                        <SortableImageItem
                          key={image.id}
                          image={image}
                          index={index}
                          totalImages={images.length}
                          onMoveUp={moveImageUp}
                          onMoveDown={moveImageDown}
                          onRemove={removeImage}
                          formatFileSize={formatFileSize}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={images.length === 0}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  ถัดไป
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-600" />
                ระบุตำแหน่งอสังหาริมทรัพย์
              </h2>
              
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2 text-center">
                    ระบุตำแหน่งอสังหาริมทรัพย์
                  </p>
                  <p className="text-sm text-gray-500 mb-6 text-center">
                    เลือกวิธีระบุตำแหน่งที่สะดวกสำหรับคุณ
                  </p>
                  
                  {/* Input Type Selection */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setLocationInputType('coordinates')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        locationInputType === 'coordinates'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      📍 กรอกพิกัด
                    </button>
                    <button
                      onClick={() => setLocationInputType('link')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        locationInputType === 'link'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🔗 ลิ้ง Google Maps
                    </button>
                  </div>
                  
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">💡</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">วิธีกรอกข้อมูลตำแหน่ง</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p><strong>📍 กรอกพิกัด:</strong> กรอกละติจูดและลองจิจูด (เช่น 13.7563, 100.5018)</p>
                          <p><strong>🔗 ลิ้ง Google Maps:</strong> คัดลอกลิ้งจาก Google Maps แล้ววางที่นี่</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coordinates Input */}
                  {locationInputType === 'coordinates' && (
                    <div className="space-y-4">
                      <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <p className="font-medium mb-1">กรอกพิกัดละติจูดและลองจิจูด</p>
                        <p className="text-xs text-gray-500">ตัวอย่าง: ละติจูด 13.7563, ลองจิจูด 100.5018</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ละติจูด (Latitude)</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="เช่น 13.7563"
                            value={customLat}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => setCustomLat(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ลองจิจูด (Longitude)</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="เช่น 100.5018"
                            value={customLng}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => setCustomLng(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (customLat && customLng) {
                            handleLocationSelect(parseFloat(customLat), parseFloat(customLng), `ตำแหน่งที่กำหนดเอง (${customLat}, ${customLng})`);
                          } else {
                            alert('กรุณากรอกพิกัดให้ครบถ้วน');
                          }
                        }}
                        disabled={!customLat || !customLng}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        ยืนยันตำแหน่ง
                      </button>
                    </div>
                  )}
                  
                  {/* Google Maps Link Input */}
                  {locationInputType === 'link' && (
                    <div className="space-y-4">
                      <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <p className="font-medium mb-1">วางลิ้ง Google Maps ที่นี่</p>
                        <p className="text-xs text-gray-500">คัดลอกลิ้งจาก Google Maps แล้ววางในช่องด้านล่าง</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ลิ้ง Google Maps</label>
                        <input
                          type="url"
                          placeholder="https://maps.google.com/maps?q=13.7563,100.5018"
                          value={googleMapsLink}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onChange={(e) => setGoogleMapsLink(e.target.value)}
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          if (googleMapsLink) {
                            handleGoogleMapsLink();
                          } else {
                            alert('กรุณากรอกลิ้ง Google Maps');
                          }
                        }}
                        disabled={!googleMapsLink.trim()}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        ยืนยันตำแหน่ง
                      </button>
                    </div>
                  )}
                  
                  {/* Sample Locations */}
                  
                </div>
              </div>

              {location && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">ตำแหน่งที่เลือก</span>
                  </div>
                  <p className="text-green-700">{location.address}</p>
                  <p className="text-sm text-green-600">
                    ละติจูด: {location.lat}, ลองจิจูด: {location.lng}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ย้อนกลับ
                </button>
                
                <button
                  onClick={() => setStep(3)}
                  disabled={!location}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  ถัดไป
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Save className="w-6 h-6 text-purple-600" />
                ข้อมูลเพิ่มเติม
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อรายงาน
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="เช่น บ้านเดี่ยว 2 ชั้น บางกะปิ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="อธิบายรายละเอียดของอสังหาริมทรัพย์..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category - New field for SEO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const category = e.target.value;
                      const categoryInfo = CATEGORIES[category];
                      setFormData({
                        ...formData,
                        category: category,
                        propertyType: categoryInfo?.propertyType || formData.propertyType,
                        listingType: categoryInfo?.listingType || formData.listingType
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    <optgroup label="ขาย">
                      <option value="ขายบ้าน">🏠 ขายบ้าน</option>
                      <option value="ขายคอนโด">🏢 ขายคอนโด</option>
                      <option value="ขายทาวน์เฮาส์">🏡 ขายทาวน์เฮาส์</option>
                      <option value="ขายที่ดิน">🏞️ ขายที่ดิน</option>
                      <option value="ขายอาคารพาณิชย์">🏪 ขายอาคารพาณิชย์</option>
                      <option value="ขายโรงงาน">🏭 ขายโรงงาน</option>
                    </optgroup>
                    <optgroup label="ให้เช่า">
                      <option value="ให้เช่าบ้าน">🏠 ให้เช่าบ้าน</option>
                      <option value="ให้เช่าคอนโด">🏢 ให้เช่าคอนโด</option>
                      <option value="ให้เช่าทาวน์เฮาส์">🏡 ให้เช่าทาวน์เฮาส์</option>
                      <option value="ให้เช่าที่ดิน">🏞️ ให้เช่าที่ดิน</option>
                      <option value="ให้เช่าอาคารพาณิชย์">🏪 ให้เช่าอาคารพาณิชย์</option>
                      <option value="ให้เช่าห้องพัก">🛏️ ให้เช่าห้องพัก</option>
                    </optgroup>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทอสังหาริมทรัพย์
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="house">บ้าน</option>
                    <option value="condo">คอนโด</option>
                    <option value="townhouse">ทาวน์เฮาส์</option>
                    <option value="land">ที่ดิน</option>
                    <option value="commercial">เชิงพาณิชย์</option>
                    <option value="office">ออฟฟิศ</option>
                    <option value="factory">โรงงาน</option>
                    <option value="room">ห้องพัก</option>
                  </select>
                </div>

                {/* Province and Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จังหวัด
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {ALL_PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ภาค
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="จะแสดงอัตโนมัติเมื่อเลือกจังหวัด"
                    />
                  </div>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทการขาย
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="listingType"
                        value="sale"
                        checked={formData.listingType === 'sale'}
                        onChange={(e) => setFormData({...formData, listingType: e.target.value})}
                        className="mr-2"
                      />
                      ขาย
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="listingType"
                        value="rent"
                        checked={formData.listingType === 'rent'}
                        onChange={(e) => setFormData({...formData, listingType: e.target.value})}
                        className="mr-2"
                      />
                      ให้เช่า
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="listingType"
                        value="both"
                        checked={formData.listingType === 'both'}
                        onChange={(e) => setFormData({...formData, listingType: e.target.value})}
                        className="mr-2"
                      />
                      ขาย/เช่า
                    </label>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคา (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="เช่น 5000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      พื้นที่ใช้สอย (ตร.ม.)
                    </label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      placeholder="เช่น 120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่ดิน (ตร.ว.)
                    </label>
                    <input
                      type="number"
                      value={formData.landArea}
                      onChange={(e) => setFormData({...formData, landArea: e.target.value})}
                      placeholder="เช่น 50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ห้องนอน
                    </label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      placeholder="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ห้องน้ำ
                    </label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                      placeholder="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนชั้น
                    </label>
                    <input
                      type="number"
                      value={formData.floors}
                      onChange={(e) => setFormData({...formData, floors: e.target.value})}
                      placeholder="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อายุอาคาร (ปี)
                    </label>
                    <input
                      type="number"
                      value={formData.buildingAge}
                      onChange={(e) => setFormData({...formData, buildingAge: e.target.value})}
                      placeholder="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    ช่องทางการติดต่อ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        placeholder="เช่น 081-234-5678"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        อีเมล
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                        placeholder="เช่น example@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Line ID
                      </label>
                      <input
                        type="text"
                        value={formData.contactLine}
                        onChange={(e) => setFormData({...formData, contactLine: e.target.value})}
                        placeholder="เช่น @username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * ช่องทางการติดต่อไม่บังคับ แต่จะช่วยให้ผู้สนใจติดต่อคุณได้ง่ายขึ้น
                  </p>
                </div>
                {nearbyPlaces.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สถานที่ใกล้เคียง
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {nearbyPlaces.map((place, index) => (
                        <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          {/* Remove button */}
                          <button
                            onClick={() => removeNearbyPlace(index)}
                            className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full transition-colors z-10"
                            title="ลบสถานที่นี้"
                          >
                            <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                          </button>
                          
                          <div className="flex items-start gap-3 pr-6">
                            {/* Photo */}
                            <div className="flex-shrink-0">
                              {place.photo_url ? (
                                <img 
                                  src={place.photo_url} 
                                  alt={place.name}
                                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                                  <span className="text-2xl">{getPlaceIcon(place.type)}</span>
                                </div>
                              )}
                              {place.photo_url && (
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200 hidden">
                                  <span className="text-2xl">{getPlaceIcon(place.type)}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 text-lg">{place.name}</h4>
                                  <p className="text-sm text-gray-600 capitalize">{place.type}</p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium text-gray-700">{place.rating}</span>
                                  {place.user_ratings_total > 0 && (
                                    <span className="text-xs text-gray-500">({place.user_ratings_total})</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Address */}
                              {place.formatted_address && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{place.formatted_address}</p>
                              )}
                              
                              {/* Distance */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-blue-600 font-medium">{place.distance}</span>
                                {place.price_level !== null && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">ราคา:</span>
                                    <span className="text-sm font-medium text-green-600">
                                      {'$'.repeat(place.price_level + 1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Contact Info */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {place.phone && (
                                  <span className="flex items-center gap-1">
                                    📞 {place.phone}
                                  </span>
                                )}
                                {place.website && (
                                  <a 
                                    href={place.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-blue-600"
                                  >
                                    🌐 เว็บไซต์
                                  </a>
                                )}
                                {place.google_url && (
                                  <a 
                                    href={place.google_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-blue-600"
                                  >
                                    🗺️ Google Maps
                                  </a>
                                )}
                              </div>
                              
                              {/* Opening Hours */}
                              {place.opening_hours && place.opening_hours.open_now !== undefined && (
                                <div className="mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    place.opening_hours.open_now 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {place.opening_hours.open_now ? '🟢 เปิดอยู่' : '🔴 ปิดแล้ว'}
                                  </span>
                                </div>
                              )}
                              
                              {/* Reviews Preview */}
                              {place.reviews && place.reviews.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="text-xs text-gray-600 mb-1">รีวิวล่าสุด:</div>
                                  <div className="text-xs text-gray-700 line-clamp-2">
                                    &ldquo;{place.reviews[0].text?.substring(0, 100)}...&rdquo;
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
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
          )}
        </div>
      </div>

      {/* Image Processing Modal */}
      <ImageProcessingProgress
        processing={processing}
        progress={progress}
        error={processingError}
        results={processingResults}
        onClose={() => {
          setShowProcessingModal(false);
          setProcessingResults(null);
        }}
      />
    </div>
  );
}
