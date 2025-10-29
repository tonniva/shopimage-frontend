'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Star,
  Calendar,
  Eye,
  Share2,
  Download,
  ArrowLeft,
  ExternalLink,
  Navigation,
  Clock,
  Phone,
  Globe,
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
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { trackPropertySnap, trackEvent, EVENTS, CATEGORIES } from '@/lib/analytics';
import ImagePreviewModal from '@/components/ImagePreviewModal';

export default function SharedPropertyReportPage() {
  const params = useParams();
  const { shareToken } = params;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [headerImageIndex, setHeaderImageIndex] = useState(0);
  const [nearbyPlaceIndex, setNearbyPlaceIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    if (shareToken) {
      fetchReport();
    }
  }, [shareToken, fetchReport]);

  useEffect(() => {
    if (report) {
      trackPropertySnap.view(report.id, false);
      fetchAds();
    }
  }, [report]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      
      const progress = scrollableHeight > 0 
        ? Math.min(scrollTop / scrollableHeight, 1) 
        : 0;
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header slideshow effect
  useEffect(() => {
    if (report?.headerImages && report.headerImages.length > 1) {
      const interval = setInterval(() => {
        setHeaderImageIndex((prev) => (prev + 1) % report.headerImages.length);
      }, 5000); // เปลี่ยนรูปทุก 5 วินาที

      return () => clearInterval(interval);
    }
  }, [report?.headerImages]);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads/fetch?position=sidebar');
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const getPlaceIcon = (type) => {
    switch (type) {
      case 'school':
        return '🏫';
      case 'hospital':
        return '🏥';
      case 'shopping':
        return '🛍️';
      case 'transit':
        return '🚇';
      case 'market':
        return '🏪';
      default:
        return '📍';
    }
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'house':
        return Home;
      case 'condo':
        return Building;
      case 'land':
        return Map;
      case 'commercial':
        return ShoppingBag;
      case 'office':
        return Briefcase;
      default:
        return Home;
    }
  };

  const getListingTypeIcon = (type) => {
    switch (type) {
      case 'sale':
        return DollarSign;
      case 'rent':
        return Clock;
      case 'both':
        return DollarSign;
      default:
        return DollarSign;
    }
  };

  const getPlaceTypeName = (type) => {
    switch (type) {
      case 'school':
        return 'การศึกษา';
      case 'hospital':
        return 'สุขภาพ';
      case 'shopping':
        return 'ช้อปปิ้ง';
      case 'transit':
        return 'การเดินทาง';
      case 'market':
        return 'ตลาด';
      default:
        return 'อื่นๆ';
    }
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: window.location.href
        });

        trackPropertySnap.share(report.id, 'native_share');
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Share canceled by user');
          return;
        }

        console.error('Share error:', error);
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('คัดลอกลิ้งแล้ว!');
          trackPropertySnap.share(report.id, 'clipboard_fallback');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('ไม่สามารถแชร์หรือคัดลอกลิ้งได้');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('คัดลอกลิ้งแล้ว!');
        trackPropertySnap.share(report.id, 'clipboard');
      } catch (error) {
        console.error('Clipboard error:', error);
        alert('ไม่สามารถคัดลอกลิ้งได้');
      }
    }
  };

  const openInMaps = () => {
    const mapsUrl = `https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`;
    window.open(mapsUrl, '_blank');
    trackPropertySnap.openMaps(report.id);
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
      {/* Professional Header */}
      <div 
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-50 transition-opacity duration-300"
        style={{ opacity: scrollProgress >= 0.1 ? 0 : 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">รายงานอสังหาริมทรัพย์</h1>
                <p className="text-sm text-gray-600 font-medium">Property Report</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={shareReport}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                title="แชร์รายงาน"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">แชร์</span>
              </button>
              <button
                onClick={openInMaps}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 hover:border-blue-300"
                title="เปิดใน Google Maps"
              >
                <ExternalLink className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - 9 columns */}
          <div className="lg:col-span-9 space-y-6">
            {/* Dynamic Header Slideshow */}
            {report.headerImages && report.headerImages.length > 0 && (
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden shadow-2xl h-64 sm:h-80 md:h-96">
                  {report.headerImages.map((img, index) => (
                    <div 
                      key={index} 
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        headerImageIndex === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Header ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hero Image Gallery */}
            {report.images && report.images.length > 0 && (
          <div className="bg-white rounded-sm shadow-lg overflow-hidden mb-6">
            {/* Main Image */}
            <div className="relative">
              <div className="aspect-[16/9] bg-gray-100">
                {report.images && report.images.length > 0 && report.images[currentImageIndex] ? (
                  <img
                    src={report.images[currentImageIndex].url || '/api/placeholder/800/600'}
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
              {report.images && report.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {report.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {report.images && report.images.length > 1 && (
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
                        src={image.thumbnail || image.url || '/api/placeholder/200/200'}
                        alt={image.alt || 'รูปภาพอสังหาริมทรัพย์'}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Property Overview */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 mb-6 backdrop-blur-sm">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                {report.title}
              </h1>
              {report.status === 'APPROVED' && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    ตรวจสอบแล้ว
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap break-keep">
              {report.description}
            </p>
          </div>

          {/* Price and Key Info */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-xl p-4 mb-4 border border-emerald-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-2xl font-bold text-white">฿</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                      {report.listingType === 'sale' && 'ขาย'}
                      {report.listingType === 'rent' && 'ให้เช่า'}
                      {report.listingType === 'both' && 'ขาย/เช่า'}
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                      {Number(report.price).toLocaleString('en-US')} บาท
                    </div>
                  </div>
                </div>
              </div>

              {report.area && (
                <div className="text-center lg:text-right bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-emerald-200">
                  <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">ราคาต่อตร.ม.</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(Number(report.price) / Number(report.area)).toLocaleString('en-US')} บาท
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {/* Area */}
            {report.area && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 text-center hover:shadow-lg transition-all duration-300 border border-blue-100 hover:scale-105 group">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Square className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {report.area}
                </div>
                <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">ตร.ม.</div>
              </div>
            )}

            {/* Land Area */}
            {report.landArea && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 text-center hover:shadow-lg transition-all duration-300 border border-emerald-100 hover:scale-105 group">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <TreePine className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {report.landArea}
                </div>
                <div className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">ตร.ว.</div>
              </div>
            )}

            {/* Bedrooms */}
            {report.bedrooms && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 text-center hover:shadow-lg transition-all duration-300 border border-purple-100 hover:scale-105 group">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Bed className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {report.bedrooms}
                </div>
                <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">ห้องนอน</div>
              </div>
            )}

            {/* Bathrooms */}
            {report.bathrooms && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 text-center hover:shadow-lg transition-all duration-300 border border-cyan-100 hover:scale-105 group">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Bath className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {report.bathrooms}
                </div>
                <div className="text-sm font-semibold text-cyan-600 uppercase tracking-wide">ห้องน้ำ</div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(report.floors || report.buildingAge) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {report.floors && (
                <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-blue-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">
                      จำนวนชั้น
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {report.floors} ชั้น
                    </div>
                  </div>
                </div>
              )}

              {report.buildingAge && (
                <div className="flex items-center gap-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-orange-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">
                      อายุอาคาร
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {report.buildingAge} ปี
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center sm:items-start gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">สร้างเมื่อ</span>
                </div>
                <span className="font-bold text-gray-900 text-base">{new Date(report.createdAt).toLocaleDateString('th-TH')}</span>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">ยอดดู</span>
                </div>
                <span className="font-bold text-gray-900 text-base">{report.viewCount}</span>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">แชร์</span>
                </div>
                <span className="font-bold text-gray-900 text-base">{report.shareCount}</span>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">สร้างโดย</span>
                </div>
                <span className="font-bold text-gray-900 text-base">{report.user?.name || 'ผู้ใช้'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(report.contactPhone || report.contactEmail || report.contactLine) && (
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">ช่องทางการติดต่อ</h3>
                <p className="text-sm text-gray-600">ติดต่อเจ้าของทรัพย์สิน</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {report.contactPhone && (
                <div className="flex items-center gap-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">โทรศัพท์</div>
                    <a
                      href={`tel:${report.contactPhone}`}
                      className="text-base font-bold text-gray-900 hover:text-green-600 transition-colors block"
                    >
                      {report.contactPhone}
                    </a>
                  </div>
                </div>
              )}
              {report.contactEmail && (
                <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">อีเมล</div>
                    <a
                      href={`mailto:${report.contactEmail}`}
                      className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                    >
                      {report.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {report.contactLine && (
                <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Line</div>
                    <span className="text-base font-bold text-gray-900 block">{report.contactLine}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-2">ตำแหน่ง</h3>
                <p className="text-gray-700 text-base mb-4 break-words leading-relaxed">{report.location.address}</p>
                {(report.province || report.region) && (
                  <div className="flex flex-wrap gap-3">
                    {report.province && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        <MapPin className="w-4 h-4" />
                        {report.province}
                      </span>
                    )}
                    {report.region && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <Globe className="w-4 h-4" />
                        {report.region}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={openInMaps}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 flex-shrink-0 shadow-lg shadow-emerald-500/30"
            >
              <Navigation className="w-5 h-5" />
              <span>เปิดในแผนที่</span>
            </button>
          </div>
        </div>

        {/* Nearby Places */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">สถานที่ใกล้เคียง</h2>
              <p className="text-sm text-gray-600 font-medium">สถานที่สำคัญรอบๆ พื้นที่</p>
            </div>
          </div>

          {report.nearbyPlaces && report.nearbyPlaces.length > 0 ? (
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex gap-6" style={{ width: 'max-content' }}>
                  {Array.from({ length: Math.ceil(report.nearbyPlaces.length / 4) }).map((_, pageIndex) => (
                    <div key={pageIndex} className="flex gap-6 flex-shrink-0">
                      <div className="grid grid-cols-2 grid-rows-2 gap-4 w-[calc(100vw-4rem)] max-w-[800px]">
                        {report.nearbyPlaces.slice(pageIndex * 4, pageIndex * 4 + 4).map((place, idx) => (
                          <div key={idx} className="w-full">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full flex flex-col">
                              {/* Place Image */}
                              <div className="mb-3">
                                {(place.primary_photo?.url || place.photos?.[0]?.url || place.photoUrl || place.photo) ? (
                                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 shadow-sm">
                                    <img
                                      src={place.primary_photo?.url || place.photos?.[0]?.url || place.photoUrl || place.photo}
                                      alt={place.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={e => {
                                        e.target.style.display = 'none';
                                        if (
                                          e.target.nextSibling &&
                                          e.target.nextSibling.style
                                        ) {
                                          e.target.nextSibling.style.display = 'flex';
                                        }
                                      }}
                                    />
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center hidden">
                                      <span className="text-2xl">{getPlaceIcon(place.type || place.primary_type)}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="text-3xl">{getPlaceIcon(place.type || place.primary_type)}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col flex-grow">
                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-xs leading-tight group-hover:text-blue-600 transition-colors flex-grow">{place.name}</h4>

                                <div className="flex flex-col gap-1.5 mt-auto">
                                  <div className="flex items-center text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full w-fit">
                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {typeof place.distance === 'number'
                                        ? `${(place.distance / 1000).toFixed(1)} กม.`
                                        : place.distance
                                          ? place.distance
                                          : place.distanceKm
                                            ? `${place.distanceKm} กม.`
                                            : 'ไม่ระบุ'
                                      }
                                    </span>
                                  </div> 
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>ไม่มีข้อมูลสถานที่ใกล้เคียง</p>
            </div>
          )}
        </div>

            {/* Footer */}
            <div className="text-center mt-12 mb-8">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold mb-2">
                      สร้าง Link แบบนี้ด้วย  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">Property Snap</span>
                    </p>
                    <a 
                      href="/property-snap" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/30"
                    >
                      <span>ลง ขาย ฟรี</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ads Sidebar - 3 columns */}
          <div className="lg:col-span-3">
            <div className="sticky top-4 space-y-6">
              {ads.length > 0 ? (
                ads.map((ad) => (
                  <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    {ad.link ? (
                      <a href={ad.link} target="_blank" rel="noopener noreferrer" onClick={() => {
                        fetch(`/api/ads/${ad.id}/click`, { method: 'POST' });
                      }}>
                        <div className="relative">
                          <img 
                            src={ad.imageUrl || 'https://via.placeholder.com/320x250'} 
                            alt={ad.title} 
                            className="w-full h-auto"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/320x250';
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            โฆษณา
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">{ad.title}</h4>
                          {ad.description && (
                            <p className="text-xs text-gray-600">{ad.description}</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <>
                        <div className="relative">
                          <img 
                            src={ad.imageUrl || 'https://via.placeholder.com/320x250'} 
                            alt={ad.title} 
                            className="w-full h-auto"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/320x250';
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            โฆษณา
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">{ad.title}</h4>
                          {ad.description && (
                            <p className="text-xs text-gray-600">{ad.description}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>ไม่มีโฆษณาในตอนนี้</p>
                </div>
              )}
            </div>
          </div>
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
