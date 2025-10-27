'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
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
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { trackPropertySnap, trackEvent, EVENTS, CATEGORIES } from '@/lib/analytics';
import { validateImageFile, compressImages, formatFileSize } from '@/utils/image-utils';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { ALL_PROVINCES, getAllRegions, getRegionByProvince } from '@/lib/thailand-data';

// Helper function to get place icon
const getPlaceIcon = (type) => {
  switch (type) {
    case 'school': return '🏫';
    case 'hospital': return '🏥';
    case 'shopping_mall': 
    case 'shopping': return '🛍️';
    case 'transit_station':
    case 'transit': return '🚇';
    case 'market': return '🏪';
    default: return '📍';
  }
};

// Sortable Image Item Component
function SortableImageItem({ image, index, totalImages, onMoveUp, onMoveDown, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id || image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
        <img
          src={image.preview || image.url}
          alt={image.name || 'Property image'}
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
          onClick={() => onRemove(image.id || image.url)}
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
    </div>
  );
}

export default function EditPropertySnapPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationInputType, setLocationInputType] = useState('coordinates');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
  
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Fetch existing report data
  useEffect(() => {
    const fetchReport = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/property-snap/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        
        const data = await response.json();
        const report = data.report || data;
        
        // Populate form data
        setFormData({
          title: report.title || '',
          description: report.description || '',
          propertyType: report.propertyType || 'house',
          listingType: report.listingType || 'sale',
          price: report.price?.toString() || '',
          area: report.area?.toString() || '',
          landArea: report.landArea?.toString() || '',
          bedrooms: report.bedrooms?.toString() || '',
          bathrooms: report.bathrooms?.toString() || '',
          floors: report.floors?.toString() || '',
          buildingAge: report.buildingAge?.toString() || '',
          contactPhone: report.contactPhone || '',
          contactEmail: report.contactEmail || '',
          contactLine: report.contactLine || ''
        });
        
        // Set images
        if (report.images && report.images.length > 0) {
          setImages(report.images.map(img => ({
            file: null,
            url: img.url,
            thumbnail: img.thumbnail,
            preview: img.url,
            name: img.filename || 'image.jpg',
            size: img.size || 0
          })));
        }
        
        // Set location
        if (report.location) {
          setLocation(report.location);
        }
        
        // Set nearby places
        if (report.nearbyPlaces && report.nearbyPlaces.length > 0) {
          setNearbyPlaces(report.nearbyPlaces);
        }
        
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchReport();
    }
  }, [user, id]);

  const handleImageUpload = async (files) => {
    const validFiles = Array.from(files).filter(file => validateImageFile(file));
    
    if (validFiles.length === 0) {
      alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)');
      return;
    }

    try {
      const compressedFiles = await compressImages(validFiles);
      
      const newImages = compressedFiles.map(file => ({
        file: file,
        url: null,
        thumbnail: null,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));

      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error compressing images:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
    }
  };

  const removeImage = (indexOrId) => {
    // Support both index and id
    const imageToRemove = typeof indexOrId === 'number' 
      ? images[indexOrId] 
      : images.find(img => img.id === indexOrId || img.url === indexOrId);
    
    if (imageToRemove) {
      setImages(prev => prev.filter(img => img !== imageToRemove));
    } else {
      // Fallback to index
      setImages(prev => prev.filter((_, i) => i !== indexOrId));
    }
  };

  const moveImageUp = (index) => {
    if (index === 0) return;
    const updatedImages = [...images];
    [updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]];
    setImages(updatedImages);
  };

  const moveImageDown = (index) => {
    if (index === images.length - 1) return;
    const updatedImages = [...images];
    [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];
    setImages(updatedImages);
  };

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item.url) === active.id);
        const newIndex = items.findIndex((item) => (item.id || item.url) === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const openImagePreview = (index) => {
    setPreviewImageIndex(index);
    setShowImagePreview(true);
  };

  const handleLocationUpdate = async (newLocation, newNearbyPlaces) => {
    setIsUpdatingLocation(true);
    try {
      setLocation(newLocation);
      setNearbyPlaces(newNearbyPlaces);
      setShowLocationPicker(false);
      
      // Show success message
      alert('ตำแหน่งอัปเดตเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating location:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Handle removing nearby places
  const removeNearbyPlace = (index) => {
    const updatedPlaces = nearbyPlaces.filter((_, i) => i !== index);
    setNearbyPlaces(updatedPlaces);
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
    try {
      setIsUpdatingLocation(true);
      
      // Create location object
      const newLocation = {
        lat: lat,
        lng: lng,
        address: address || `ตำแหน่งที่เลือก (${lat.toFixed(6)}, ${lng.toFixed(6)})`
      };
      
      // Fetch nearby places from Google Places API
      let nearbyPlacesData = [];
      try {
        const response = await fetch('/api/google-places/nearby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: { lat: lat, lng: lng },
            radius: 2000, // 2km radius
            type: 'establishment',
            language: 'th'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Google Places API Response:', data);
          nearbyPlacesData = data.places || [];
          console.log('Nearby Places Data:', nearbyPlacesData);
        } else {
          console.warn('Failed to fetch nearby places from Google API');
        }
      } catch (apiError) {
        console.warn('Error fetching nearby places:', apiError);
      }
      
      // If no places from API, use mock data
      if (nearbyPlacesData.length === 0) {
        console.log('No places from API, using mock data');
        nearbyPlacesData = [
          {
            name: 'สถานีรถไฟฟ้า BTS',
            distance: '0.5 กม.',
            type: 'transit_station',
            photo_url: null
          },
          {
            name: 'เซ็นทรัลเวิลด์',
            distance: '1.2 กม.',
            type: 'shopping_mall',
            photo_url: null
          },
          {
            name: 'โรงพยาบาล',
            distance: '0.8 กม.',
            type: 'hospital',
            photo_url: null
          }
        ];
      }
      
      console.log('Final nearby places data:', nearbyPlacesData);
      console.log('First place photo data:', nearbyPlacesData[0]?.primary_photo || nearbyPlacesData[0]?.photos?.[0]);
      setLocation(newLocation);
      setNearbyPlaces(nearbyPlacesData);
      setShowLocationPicker(false);
      
      alert('ตำแหน่งอัปเดตเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error selecting location:', error);
      alert('เกิดข้อผิดพลาดในการเลือกตำแหน่ง');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const parseMapsLink = (link) => {
    try {
      // Handle different Google Maps URL formats
      const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // @lat,lng
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,  // !3dlat!4dlng
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // ll=lat,lng
      ];
      
      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing maps link:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!images.length || !location) {
      alert('กรุณาอัปโหลดรูปภาพและระบุตำแหน่ง');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title || 'Property Report');
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', JSON.stringify(location));
      formDataToSend.append('nearbyPlaces', JSON.stringify(nearbyPlaces));
      
      // Add property fields
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
      
      // Add new images only
      images.forEach(image => {
        if (image.file) {
          formDataToSend.append('images', image.file);
        }
      });

      const response = await fetch(`/api/property-snap/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        
        // Track successful update
        trackPropertySnap.update(id, images.length, nearbyPlaces.length);
        
        setTimeout(() => {
          router.push(`/share/${result.shareToken}`);
        }, 2000);
      } else {
        // Try to parse error response, but handle empty/invalid response
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
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { 
            error: `HTTP ${response.status}: ${response.statusText}`, 
            details: 'Failed to parse error response' 
          };
        }
        
        console.error('API Error:', errorData);
        
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status} error`;
        const errorType = errorData.type || 'Error';
        
        throw new Error(`${errorType}: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการอัปเดตรายงาน';
      
      if (error.message.includes('DatabaseError:')) {
        errorMessage = 'เกิดข้อผิดพลาดฐานข้อมูล: ' + error.message.replace('DatabaseError: ', '');
      } else if (error.message.includes('Error:')) {
        errorMessage = error.message.replace('Error: ', '');
      } else {
        errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลรายงาน...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/property-snap')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">อัปเดตสำเร็จ!</h2>
          <p className="text-gray-600 mb-4">กำลังนำคุณไปยังหน้าแสดงรายงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/property-snap')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">แก้ไขรายงานอสังหาริมทรัพย์</h1>
                <p className="text-sm text-gray-600">อัปเดตข้อมูลรายงานของคุณ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Images Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            รูปภาพ
          </h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เพิ่มรูปภาพใหม่
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600">คลิกเพื่อเลือกรูปภาพ</span>
                <span className="text-sm text-gray-500">JPG, PNG, WebP (สูงสุด 10MB)</span>
              </label>
            </div>
          </div>

          {/* Current Images with Drag & Drop */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">รูปภาพปัจจุบัน</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map(img => img.id || img.url)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <SortableImageItem
                        key={image.id || image.url}
                        image={image}
                        index={index}
                        totalImages={images.length}
                        onMoveUp={moveImageUp}
                        onMoveDown={moveImageDown}
                        onRemove={removeImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            รายละเอียดอสังหาริมทรัพย์
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อรายงาน
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="เช่น บ้านเดี่ยว 2 ชั้น สวยงาม"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="อธิบายรายละเอียดของอสังหาริมทรัพย์..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทอสังหาริมทรัพย์
              </label>
              <select
                value={formData.propertyType || ''}
                onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="house">บ้าน</option>
                <option value="condo">คอนโด</option>
                <option value="land">ที่ดิน</option>
                <option value="commercial">เชิงพาณิชย์</option>
                <option value="office">ออฟฟิศ</option>
              </select>
            </div>

            {/* Province and Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จังหวัด
                </label>
                <select
                  value={formData.province || ''}
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
                  value={formData.region || ''}
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
                value={formData.price || ''}
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
                  value={formData.area || ''}
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
                  value={formData.landArea || ''}
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
                  value={formData.bedrooms || ''}
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
                  value={formData.bathrooms || ''}
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
                  value={formData.floors || ''}
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
                  value={formData.buildingAge || ''}
                  onChange={(e) => setFormData({...formData, buildingAge: e.target.value})}
                  placeholder="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2">
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
                    value={formData.contactPhone || ''}
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
                    value={formData.contactEmail || ''}
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
                    value={formData.contactLine || ''}
                    onChange={(e) => setFormData({...formData, contactLine: e.target.value})}
                    placeholder="เช่น @username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              ตำแหน่ง
            </h2>
            <button
              onClick={() => {
                // Clear all values when opening modal
                setCustomLat('');
                setCustomLng('');
                setMapsLink('');
                setLocationInputType('coordinates');
                setShowLocationPicker(true);
              }}
              disabled={isUpdatingLocation}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {isUpdatingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังอัปเดต...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  แก้ไขตำแหน่ง
                </>
              )}
            </button>
          </div>
          
          {location ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-800">{location.address}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span>ละติจูด: {location.lat}</span>
                <span className="mx-2">•</span>
                <span>ลองจิจูด: {location.lng}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบข้อมูลตำแหน่ง</p>
              <button
                onClick={() => {
                  // Clear initial values when no location exists
                  setCustomLat('');
                  setCustomLng('');
                  setMapsLink('');
                  setLocationInputType('coordinates');
                  setShowLocationPicker(true);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                เลือกตำแหน่ง
              </button>
            </div>
          )}
        </div>

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              สถานที่ใกล้เคียง
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyPlaces.map((place, index) => (
                <div key={index} className="relative bg-gray-50 rounded-lg p-4">
                  {/* Remove button */}
                  <button
                    onClick={() => removeNearbyPlace(index)}
                    className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full transition-colors z-10"
                    title="ลบสถานที่นี้"
                  >
                    <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </button>
                  
                  <div className="flex items-start gap-3 pr-6">
                    {/* Image or Icon */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {place.primary_photo?.url || place.photos?.[0]?.url || place.photo_url || place.photo ? (
                        <img
                          src={place.primary_photo?.url || place.photos?.[0]?.url || place.photo_url || place.photo}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{getPlaceIcon(place.type || place.primary_type)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">{place.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-blue-600 font-medium">
                          {typeof place.distance === 'number' 
                            ? `${(place.distance / 1000).toFixed(1)} กม.`
                            : place.distance || 'ไม่ระบุระยะทาง'
                          }
                        </span>
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>{place.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        images={images.map(img => ({ url: img.preview || img.url }))}
        currentIndex={previewImageIndex}
        onIndexChange={setPreviewImageIndex}
      />

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  แก้ไขตำแหน่ง
                </h2>
                <button
                  onClick={() => {
                    // Reset form when closing modal
                    setCustomLat('');
                    setCustomLng('');
                    setMapsLink('');
                    setLocationInputType('coordinates');
                    setShowLocationPicker(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ละติจูด (Latitude)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={customLat}
                        onChange={(e) => setCustomLat(e.target.value)}
                        placeholder="เช่น 13.7563"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ลองจิจูด (Longitude)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={customLng}
                        onChange={(e) => setCustomLng(e.target.value)}
                        placeholder="เช่น 100.5018"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    disabled={isUpdatingLocation || !customLat || !customLng}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpdatingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        กำลังดึงข้อมูลสถานที่ใกล้เคียง...
                      </>
                    ) : (
                      'ยืนยันตำแหน่ง'
                    )}
                  </button>
                </div>
              )}
              
              {/* Maps Link Input */}
              {locationInputType === 'link' && (
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <p className="font-medium mb-1">วางลิ้ง Google Maps ที่นี่</p>
                    <p className="text-xs text-gray-500">คัดลอกลิ้งจาก Google Maps แล้ววางในช่องด้านล่าง</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ลิ้ง Google Maps
                    </label>
                    <input
                      type="url"
                      value={mapsLink}
                      onChange={(e) => setMapsLink(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (mapsLink) {
                        const coords = parseMapsLink(mapsLink);
                        if (coords) {
                          handleLocationSelect(coords.lat, coords.lng, `ตำแหน่งจาก Google Maps (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`);
                        } else {
                          alert('ไม่สามารถอ่านพิกัดจากลิ้งนี้ได้ กรุณาตรวจสอบลิ้ง Google Maps');
                        }
                      } else {
                        alert('กรุณากรอกลิ้ง Google Maps');
                      }
                    }}
                    disabled={isUpdatingLocation || !mapsLink}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpdatingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        กำลังดึงข้อมูลสถานที่ใกล้เคียง...
                      </>
                    ) : (
                      'ยืนยันตำแหน่ง'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
