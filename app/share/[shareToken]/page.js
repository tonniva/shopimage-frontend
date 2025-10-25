'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Eye,
  Share2,
  ExternalLink,
  Navigation,
  Clock,
  Phone,
  User,
  Home,
  Building,
  Map,
  ShoppingBag,
  Briefcase,
  DollarSign,
  Square,
  TreePine,
  Bed,
  Bath,
  Layers,
  Calendar as CalendarIcon,
  Mail,
  MessageCircle
} from 'lucide-react';
import { trackPropertySnap } from '@/lib/analytics';
import ImagePreviewModal from '@/components/ImagePreviewModal';

export default function SharedPropertyReportPage() {
  const params = useParams();
  const { shareToken } = params ?? {};
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/property-snap/share/${shareToken}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('รายงานไม่พบหรือไม่สามารถเข้าถึงได้');
        } else {
          setError('เกิดข้อผิดพลาดในการโหลดรายงาน');
        }
        return;
      }
      const data = await response.json();
      setReport(data.report || data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('เกิดข้อผิดพลาดในการโหลดรายงาน');
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    if (shareToken) fetchReport();
  }, [shareToken, fetchReport]);

  useEffect(() => {
    if (report?.id) {
      // false = not owner
      trackPropertySnap?.view?.(report.id, false);
    }
  }, [report]);

  const getPlaceIcon = (type) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'shopping': return '🛍️';
      case 'transit': return '🚇';
      case 'market': return '🏪';
      default: return '📍';
    }
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'house': return Home;
      case 'condo': return Building;
      case 'land': return Map;
      case 'commercial': return ShoppingBag;
      case 'office': return Briefcase;
      default: return Home;
    }
  };

  const getListingTypeIcon = (type) => {
    switch (type) {
      case 'sale': return DollarSign;
      case 'rent': return Clock;
      case 'both': return DollarSign;
      default: return DollarSign;
    }
  };

  const getPlaceTypeName = (type) => {
    switch (type) {
      case 'school': return 'การศึกษา';
      case 'hospital': return 'สุขภาพ';
      case 'shopping': return 'ช้อปปิ้ง';
      case 'transit': return 'การเดินทาง';
      case 'market': return 'ตลาด';
      default: return 'อื่นๆ';
    }
  };

  const shareReport = async () => {
    if (!report) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.description,
          url
        });
        trackPropertySnap?.share?.(report.id, 'native_share');
      } catch (error) {
        if (error.name === 'AbortError') return; // ผู้ใช้กดยกเลิก
        try {
          await navigator.clipboard.writeText(url);
          alert('คัดลอกลิ้งแล้ว!');
          trackPropertySnap?.share?.(report.id, 'clipboard_fallback');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('ไม่สามารถแชร์หรือคัดลอกลิ้งได้');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('คัดลอกลิ้งแล้ว!');
        trackPropertySnap?.share?.(report.id, 'clipboard');
      } catch (error) {
        console.error('Clipboard error:', error);
        alert('ไม่สามารถคัดลอกลิ้งได้');
      }
    }
  };

  const openInMaps = () => {
    if (!report?.location?.lat || !report?.location?.lng) return;
    const mapsUrl = `https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`;
    window.open(mapsUrl, '_blank');
    trackPropertySnap?.openMaps?.(report.id);
  };

  const openImagePreview = (index) => {
    setPreviewImageIndex(index);
    setShowImagePreview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลดรายงาน...</h2>
          <p className="text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบรายงาน</h2>
          <p className="text-gray-500 mb-4">{error || 'รายงานอาจถูกลบหรือไม่ถูกต้อง'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  const PlaceholderMain = "/api/placeholder/800-600";
  const PlaceholderThumb = "/api/placeholder/200-200";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">รายงานอสังหาริมทรัพย์</h1>
                <p className="text-xs text-gray-500">Property Report</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={shareReport}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="แชร์รายงาน"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={openInMaps}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="เปิดใน Google Maps"
              >
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 py-2">
        {/* Hero Image Gallery */}
        {report.images && report.images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Main Image */}
            <div className="relative">
              <div className="aspect-[16/9] bg-gray-100">
                {report.images[currentImageIndex] ? (
                  <img
                    src={report.images[currentImageIndex].url || PlaceholderMain}
                    alt={report.images[currentImageIndex].alt || 'รูปภาพอสังหาริมทรัพย์'}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => openImagePreview(currentImageIndex)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-lg">ไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>
              
              {/* Image Counter */}
              {report.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {report.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {report.images.length > 1 && (
              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {report.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      onDoubleClick={() => openImagePreview(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                        currentImageIndex === index 
                          ? 'ring-2 ring-blue-500 scale-105' 
                          : 'hover:ring-2 hover:ring-gray-300 hover:scale-105'
                      }`}
                    >
                      <img
                        src={image.thumbnail || image.url || PlaceholderThumb}
                        alt={image.alt || 'รูปภาพอสังหาริมทรัพย์'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = PlaceholderThumb;
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Property Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {report.title}
            </h1>
            <p className="text-gray-600 leading-relaxed text-lg">
              {report.description}
            </p>
          </div>
            
          {/* Price and Key Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-2 mb-2">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                  <div className="text-sm text-gray-600">
                      {report.listingType === 'sale' && 'ขาย'}
                      {report.listingType === 'rent' && 'ให้เช่า'}
                      {report.listingType === 'both' && 'ขาย/เช่า'}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Number(report.price).toLocaleString('en-US')} บาท
                    </div>
                  
                  </div>
                </div>
              </div>
              
              {report.area && (
                <div className="text-center lg:text-right">
                  <div className="text-sm text-gray-500 mb-1">ราคาต่อตร.ม.</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {Math.round(Number(report.price) / Number(report.area)).toLocaleString('en-US')} บาท/ตร.ม.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            {report.area && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-1">
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{report.area}</div>
                <div className="text-xs text-gray-600">ตร.ม.</div>
              </div>
            )}
            {report.landArea && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-1">
                  <TreePine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{report.landArea}</div>
                <div className="text-xs text-gray-600">ตร.ว.</div>
              </div>
            )}
            {report.bedrooms && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-1">
                  <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{report.bedrooms}</div>
                <div className="text-xs text-gray-600">ห้องนอน</div>
              </div>
            )}
            {report.bathrooms && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-1">
                  <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{report.bathrooms}</div>
                <div className="text-xs text-gray-600">ห้องน้ำ</div>
              </div>
            )}
          </div>

          {(report.floors || report.buildingAge) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
              {report.floors && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 sm:p-3 hover:bg-blue-100 transition-colors">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-xs sm:text-sm">จำนวนชั้น</div>
                    <div className="text-xs text-gray-600">{report.floors} ชั้น</div>
                  </div>
                </div>
              )}
              {report.buildingAge && (
                <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-2 sm:p-3 hover:bg-orange-100 transition-colors">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-xs sm:text-sm">อายุอาคาร</div>
                    <div className="text-xs text-gray-600">{report.buildingAge} ปี</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>สร้างเมื่อ {new Date(report.createdAt).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{report.viewCount} ครั้ง</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span>{report.shareCount} แชร์</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>โดย {report.user?.name || 'ผู้ใช้'}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        {(report.contactPhone || report.contactEmail || report.contactLine) && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-2 sm:p-3 mb-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">ช่องทางการติดต่อ</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.contactPhone && (
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                  <Phone className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">โทรศัพท์</div>
                    <a href={`tel:${report.contactPhone}`} className="text-sm font-medium text-gray-800 hover:text-blue-600">
                      {report.contactPhone}
                    </a>
                  </div>
                </div>
              )}
              {report.contactEmail && (
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">อีเมล</div>
                    <a href={`mailto:${report.contactEmail}`} className="text-sm font-medium text-gray-800 hover:text-blue-600">
                      {report.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {report.contactLine && (
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-600">Line</div>
                    <span className="text-sm font-medium text-gray-800">{report.contactLine}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 mb-1">ตำแหน่ง</h3>
                <p className="text-gray-700 text-sm sm:text-base break-words">{report.location?.address}</p>
                {(report.province || report.region) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.province && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📍 {report.province}
                      </span>
                    )}
                    {report.region && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🗺️ {report.region}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={openInMaps}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start flex-shrink-0"
            >
              <Navigation className="w-4 h-4" />
              เปิดในแผนที่
            </button>
          </div>
        </div>

        {/* Nearby Places */}
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">สถานที่ใกล้เคียง</h2>
              <p className="text-sm text-gray-500">สถานที่สำคัญรอบๆ พื้นที่</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {report.nearbyPlaces && report.nearbyPlaces.length > 0 ? (
              report.nearbyPlaces.map((place, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 group">
                  {/* Place Image */}
                  <div className="mb-4">
                    {(place.primary_photo?.url || place.photos?.[0]?.url || place.photoUrl || place.photo) ? (
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={place.primary_photo?.url || place.photos?.[0]?.url || place.photoUrl || place.photo}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = PlaceholderThumb;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">{getPlaceIcon(place.type || place.primary_type)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">{place.name}</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-blue-600 font-medium">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {typeof place.distance === 'number' 
                            ? `${(place.distance / 1000).toFixed(1)} กม.`
                            : (place.distance || (place.distanceKm ? `${place.distanceKm} กม.` : 'ไม่ระบุระยะทาง'))
                          }
                        </span>
                      </div>
                      {place.rating && (
                        <div className="flex items-center text-sm text-yellow-600">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span className="font-medium">{place.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ไม่มีข้อมูลสถานที่ใกล้เคียง</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            สร้างด้วย 🏠 Property Snap • 
            <a href="/property-snap" className="text-blue-600 hover:underline ml-1">
              สร้างรายงานของคุณ
            </a>
          </p>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        images={report?.images || []}
        currentIndex={previewImageIndex}
        onIndexChange={setPreviewImageIndex}
      />
    </div>
  );
}