'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { 
  CheckCircle, 
  Share2, 
  Copy, 
  ExternalLink,
  Download,
  Eye,
  MapPin,
  Star,
  Calendar,
  User
} from 'lucide-react';
import { trackPropertySnap, trackEvent, EVENTS, CATEGORIES } from '@/lib/analytics';

export default function PropertySnapSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user, ready } = useAuth();
  const { shareToken } = params;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Check authentication
  useEffect(() => {
    if (ready && !user) {
      // User not logged in, redirect to login
      router.push('/property-snap?login=required');
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (shareToken) {
      setShareUrl(`${window.location.origin}/share/${shareToken}`);
      
      // Fetch real report data from API
      const fetchReport = async () => {
        try {
          // First try to get the report ID from shareToken
          let reportId = null;
          
          // Try to fetch from share API
          const shareResponse = await fetch(`/api/property-snap/share/${shareToken}`);
          
          if (shareResponse.ok) {
            const shareData = await shareResponse.json();
            setReport(shareData.report);
            setLoading(false);
            trackPropertySnap.view(shareData.report?.id || shareToken);
            return;
          } else if (shareResponse.status === 403) {
            // Report exists but not approved, fetch by token for status display
            const tokenResponse = await fetch(`/api/property-snap/by-token/${shareToken}`);
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              setReport(tokenData.report);
              setLoading(false);
              return;
            } else if (tokenResponse.status === 403) {
              // User is not the owner of this report
              console.error('Forbidden: User is not the owner');
              setReport(null);
              setLoading(false);
              return;
            } else if (tokenResponse.status === 401) {
              // User not logged in
              setReport(null);
              setLoading(false);
              return;
            }
          }
          
          console.error('Failed to fetch report:', shareResponse.status);
          setReport(null);
        } catch (error) {
          console.error('Error fetching report:', error);
          setReport(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchReport();
    }
  }, [shareToken]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy action
      trackPropertySnap.shareCopy(report?.id || 'unknown');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(report?.title || 'Property Report');
    
    let shareUrl_platform = '';
    switch (platform) {
      case 'facebook':
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        trackPropertySnap.shareFacebook(report?.id || 'unknown');
        break;
      case 'line':
        shareUrl_platform = `https://line.me/R/msg/text/?${encodedTitle}%20${encodedUrl}`;
        trackPropertySnap.shareLine(report?.id || 'unknown');
        break;
      case 'twitter':
        shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        trackPropertySnap.share(report?.id || 'unknown', 'twitter');
        break;
      default:
        return;
    }
    
    window.open(shareUrl_platform, '_blank', 'width=600,height=400');
  };

  const getPlaceIcon = (type) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'shopping': return '🛍️';
      case 'transit': return '🚇';
      case 'market': return '🏪';
      case 'restaurant': return '🍽️';
      case 'tourist_attraction': return '🏛️';
      case 'bank': return '🏦';
      case 'gas_station': return '⛽';
      case 'pharmacy': return '💊';
      default: return '📍';
    }
  };

  const getPlaceTypeName = (type) => {
    switch (type) {
      case 'school': return 'การศึกษา';
      case 'hospital': return 'สุขภาพ';
      case 'shopping': return 'ช้อปปิ้ง';
      case 'transit': return 'การเดินทาง';
      case 'market': return 'ตลาด';
      case 'restaurant': return 'ร้านอาหาร';
      case 'tourist_attraction': return 'สถานที่ท่องเที่ยว';
      case 'bank': return 'ธนาคาร';
      case 'gas_station': return 'ปั๊มน้ำมัน';
      case 'pharmacy': return 'ร้านยา';
      default: return 'อื่นๆ';
    }
  };

  // Show loading or redirect if not authenticated
  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6">หน้านี้สำหรับผู้ที่สร้างรายงานเท่านั้น</p>
          <Link
            href="/property-snap"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ไปที่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลดรายงาน...</h2>
          <p className="text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">ไม่สามารถเข้าถึงรายงานนี้</h2>
          <p className="text-gray-600 mb-6">รายงานนี้ไม่ใช่ของคุณ คุณสามารถเข้าถึงเฉพาะรายงานที่คุณสร้างเท่านั้น</p>
          <button
            onClick={() => router.push('/property-snap')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {report?.status === 'PENDING' ? '⏳ กำลังรอการอนุมัติ' : 
               report?.status === 'APPROVED' ? '🎉 สร้างรายงานสำเร็จ!' :
               report?.status === 'REJECTED' ? '❌ ถูกปฏิเสธ' :
               '📝 สร้างรายงาน'}
            </h1>
            <p className="text-lg text-gray-600">
              {report?.status === 'PENDING' ? 'รายงานของคุณกำลังรอการอนุมัติจาก admin' :
               report?.status === 'APPROVED' ? 'รายงาน Property Snap ของคุณพร้อมแชร์แล้ว' :
               report?.status === 'REJECTED' ? `รายงานถูกปฏิเสธ: ${report.rejectionReason || 'ไม่ระบุเหตุผล'}` :
               'ระบบกำลังประมวลผล'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Report Preview */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {report.title || 'รายงานอสังหาริมทรัพย์'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {report.description || 'รายงาน Property Snap'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>สร้างเมื่อ {report.createdAt ? new Date(report.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{report.viewCount || 0} ครั้ง</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Share Token</div>
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {shareToken}
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">รูปภาพ</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images?.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.thumbnail || image.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>
                )) || []}
              </div>
            </div>

            {/* Location */}
            {report.location && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  ตำแหน่ง
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">
                    {report.location.address || 'ไม่ระบุที่อยู่'}
                  </p>
                  <p className="text-sm text-gray-600">
                    ละติจูด: {report.location.lat || 'ไม่ระบุ'}, ลองจิจูด: {report.location.lng || 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
            )}

            {/* Nearby Places */}
            {report.nearbyPlaces && report.nearbyPlaces.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">สถานที่ใกล้เคียง</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {report.nearbyPlaces.map((place, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    {/* Photo */}
                    <div className="mb-3">
                      {place.photoUrl || place.photo_url ? (
                        <img 
                          src={place.photoUrl || place.photo_url} 
                          alt={place.name}
                          className="w-full h-24 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-3xl">{getPlaceIcon(place.type)}</span>
                        </div>
                      )}
                      {place.photoUrl || place.photo_url ? (
                        <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hidden">
                          <span className="text-3xl">{getPlaceIcon(place.type)}</span>
                        </div>
                      ) : null}
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{place.name}</h4>
                      {(place.distance || place.distanceKm) && (
                        <div className="flex items-center text-xs text-blue-600 font-medium">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{place.distance || `${place.distanceKm} กม.`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Share Section - Only show if approved */}
          {report?.status === 'APPROVED' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-blue-600" />
              แชร์รายงาน
            </h3>
            
            {/* Share URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ลิ้งแชร์รายงาน
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                แชร์ไปยัง
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => shareToSocial('line')}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  💬 Line
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex-1 bg-sky-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                >
                  🐦 Twitter
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => window.open(shareUrl, '_blank')}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                ดูรายงาน
              </button>
              
              <button
                onClick={() => router.push('/property-snap')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                🏠 สร้างรายงานใหม่
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
