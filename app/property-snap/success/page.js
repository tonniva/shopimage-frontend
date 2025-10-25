'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Eye, 
  Share2, 
  Calendar,
  MapPin,
  Image as ImageIcon,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { trackPropertySnap, trackEvent, EVENTS, CATEGORIES } from '@/lib/analytics';
import StorageUsage from '@/components/StorageUsage';

export default function PropertySnapSuccessPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && user) {
      fetchUserReports();
    } else if (ready && !user) {
      router.push('/login');
    }
  }, [ready, user, router]);

  const fetchUserReports = async () => {
    try {
      const response = await fetch('/api/property-snap/user-reports');
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        
        // Track page view
        trackPropertySnap.view('user-reports-list');
      } else {
        console.error('Failed to fetch reports:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    trackEvent(EVENTS.REPORT_CREATE, CATEGORIES.PROPERTY_REPORT, 'create-new-button');
    router.push('/property-snap/create');
  };

  const handleViewReport = (shareToken) => {
    trackPropertySnap.view(shareToken);
    window.open(`/share/${shareToken}`, '_blank');
  };

  const handleShareReport = (shareToken) => {
    trackPropertySnap.share(shareToken, 'direct-link');
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    alert('คัดลอกลิ้งก์แชร์แล้ว!');
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายงานนี้?')) return;
    
    try {
      const response = await fetch(`/api/property-snap/delete/${reportId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setReports(reports.filter(report => report.id !== reportId));
        alert('ลบรายงานสำเร็จ!');
      } else {
        alert('เกิดข้อผิดพลาดในการลบรายงาน');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('เกิดข้อผิดพลาดในการลบรายงาน');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลดรายงาน...</h2>
          <p className="text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📊 รายงานของฉัน
              </h1>
              <p className="text-lg text-gray-600">
                จัดการรายงาน Property Snap ของคุณ
              </p>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างรายงานใหม่
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Storage Usage */}
          <div className="mb-8">
            <StorageUsage />
          </div>
          
          {reports.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                ยังไม่มีรายงาน
              </h3>
              <p className="text-gray-500 mb-6">
                เริ่มสร้างรายงาน Property Snap แรกของคุณ
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                สร้างรายงานแรก
              </button>
            </div>
          ) : (
            /* Reports Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Image */}
                  <div className="aspect-video bg-gray-100 relative">
                    {report.images && report.images.length > 0 ? (
                      <img
                        src={report.images[0].thumbnail || report.images[0].url}
                        alt={report.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Image Count */}
                    {report.images && report.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        +{report.images.length - 1}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {report.title || 'รายงานอสังหาริมทรัพย์'}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {report.description || 'รายงาน Property Snap'}
                    </p>
                    
                    {/* Location */}
                    {report.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{report.location.address || 'ไม่ระบุที่อยู่'}</span>
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{report.viewCount || 0}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewReport(report.share_token)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        ดู
                      </button>
                      
                      <button
                        onClick={() => handleShareReport(report.share_token)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Share2 className="w-4 h-4" />
                        แชร์
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
