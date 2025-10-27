'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Target,
  TrendingUp,
  Link as LinkIcon,
  Save,
  X,
  Settings
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, ad: null });
  const [configModal, setConfigModal] = useState({ open: false });
  const [cacheConfig, setCacheConfig] = useState({
    enabled: true,
    maxAge: 300,
    staleWhileRevalidate: true
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    status: 'inactive',
    priority: 5,
    weight: 1,
    position: 'sidebar',
    targetPages: ['all'],
    startDate: '',
    endDate: ''
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchAds();
    loadCacheConfig();
  }, []);

  const loadCacheConfig = async () => {
    try {
      const response = await fetch('/api/property-snap/cache-config?type=ads_api');
      if (response.ok) {
        const data = await response.json();
        setCacheConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading cache config:', error);
    }
  };

  const saveCacheConfig = async () => {
    try {
      const response = await fetch('/api/property-snap/cache-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ads_api',
          enabled: cacheConfig.enabled,
          maxAge: cacheConfig.maxAge,
          staleWhileRevalidate: cacheConfig.staleWhileRevalidate
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกการตั้งค่าเรียบร้อย',
          confirmButtonColor: '#10B981'
        });
        setConfigModal({ open: false });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการบันทึก',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (error) {
      console.error('Error saving cache config:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการบันทึก',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ads');
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ad = null) => {
    if (ad) {
      setFormData({
        ...ad,
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
      });
      setImagePreview(ad.imageUrl);
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        link: '',
        status: 'inactive',
        priority: 5,
        weight: 1,
        position: 'sidebar',
        targetPages: ['all'],
        startDate: '',
        endDate: ''
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setModal({ open: true, ad });
  };

  const handleCloseModal = () => {
    setModal({ open: false, ad: null });
    setFormData({
      title: '',
      description: '',
      link: '',
      status: 'inactive',
      priority: 5,
      weight: 1,
      position: 'sidebar',
      targetPages: ['all'],
      startDate: '',
      endDate: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    formDataToSend.append('data', JSON.stringify(formData));

    setUploading(true);
    try {
      const url = modal.ad ? `/api/ads/${modal.ad.id}` : '/api/ads';
      const method = modal.ad ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: modal.ad ? 'แก้ไขโฆษณาเรียบร้อย' : 'สร้างโฆษณาใหม่เรียบร้อย',
          confirmButtonColor: '#10B981'
        });
        handleCloseModal();
        fetchAds();
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.error || 'ไม่สามารถบันทึกได้',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกได้',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: newStatus === 'active' ? 'เปิดใช้งานโฆษณาเรียบร้อย' : 'ปิดใช้งานโฆษณาเรียบร้อย',
          confirmButtonColor: '#10B981',
          timer: 1500,
          showConfirmButton: false
        });
        fetchAds();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเปลี่ยนสถานะได้',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเปลี่ยนสถานะได้',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ที่จะลบโฆษณานี้?',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'ลบโฆษณาเรียบร้อย',
            confirmButtonColor: '#10B981'
          });
          fetchAds();
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/property-snap" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🔧 จัดการโฆษณา</h1>
                <p className="text-sm text-gray-600">สร้าง แก้ไข และลบโฆษณา</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfigModal({ open: true })}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                title="ตั้งค่า Cache"
              >
                <Settings className="w-4 h-4" />
                Cache Config
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                สร้างโฆษณาใหม่
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-800">{ads.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เปิดใช้งาน</p>
                <p className="text-2xl font-bold text-green-800">
                  {ads.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รวม Impressions</p>
                <p className="text-2xl font-bold text-orange-800">
                  {ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รวม Clicks</p>
                <p className="text-2xl font-bold text-purple-800">
                  {ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Ads List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">กำลังโหลด...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ยังไม่มีโฆษณา</h3>
            <p className="text-gray-600 mb-6">เริ่มสร้างโฆษณาใหม่ได้เลย</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              สร้างโฆษณาแรก
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-6xl">📢</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {ad.status === 'active' ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        เปิดใช้งาน
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                        ปิดใช้งาน
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{ad.title}</h3>
                  {ad.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.description}</p>
                  )}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(ad.createdAt).toLocaleDateString('th-TH')}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {ad.impressions || 0} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {ad.clicks || 0} clicks
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(ad.id, ad.status)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          ad.status === 'active'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {ad.status === 'active' ? (
                          <span className="flex items-center justify-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            ปิดใช้งาน
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            เปิดใช้งาน
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(ad)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {modal.ad ? 'แก้ไขโฆษณา' : 'สร้างโฆษณาใหม่'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพโฆษณา
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-lg" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อโฆษณา *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ลิงก์เป้าหมาย
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานะ
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">เปิดใช้งาน</option>
                    <option value="inactive">ปิดใช้งาน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความสำคัญ (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ตำแหน่ง
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sidebar">Sidebar</option>
                  <option value="top">Top Banner</option>
                  <option value="between">Between Content</option>
                  <option value="footer">Footer</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่เริ่มแสดง
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {uploading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cache Config Modal */}
      {configModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              Ads API Cache Configuration
            </h3>
            
            <div className="space-y-4">
              {/* Enable Cache */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex-1">
                  <label className="font-medium text-sm sm:text-base text-gray-800">เปิดใช้งาน Cache</label>
                  <p className="text-xs sm:text-sm text-gray-600">ใช้การ Cache เพื่อเพิ่มประสิทธิภาพ</p>
                </div>
                <button
                  onClick={() => setCacheConfig({ ...cacheConfig, enabled: !cacheConfig.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cacheConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      cacheConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Max Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cache Duration (วินาที)
                </label>
                <select
                  value={cacheConfig.maxAge}
                  onChange={(e) => setCacheConfig({ ...cacheConfig, maxAge: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={60}>1 นาที</option>
                  <option value={300}>5 นาที</option>
                  <option value={900}>15 นาที</option>
                  <option value={1800}>30 นาที</option>
                  <option value={3600}>1 ชั่วโมง</option>
                  <option value={7200}>2 ชั่วโมง</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ข้อมูลจะถูก Cache เป็นเวลา {cacheConfig.maxAge} วินาที ({Math.round(cacheConfig.maxAge / 60)} นาที)
                </p>
              </div>

              {/* Stale While Revalidate */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex-1">
                  <label className="font-medium text-sm sm:text-base text-gray-800">Stale While Revalidate</label>
                  <p className="text-xs sm:text-sm text-gray-600">แสดงข้อมูลเก่าในระหว่างอัปเดต</p>
                </div>
                <button
                  onClick={() => setCacheConfig({ ...cacheConfig, staleWhileRevalidate: !cacheConfig.staleWhileRevalidate })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cacheConfig.staleWhileRevalidate ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      cacheConfig.staleWhileRevalidate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={async () => {
                  const result = await Swal.fire({
                    icon: 'question',
                    title: 'ยืนยันการล้าง Cache',
                    text: 'คุณแน่ใจหรือไม่ที่จะล้าง Cache สำหรับโฆษณา?',
                    showCancelButton: true,
                    confirmButtonColor: '#EF4444',
                    cancelButtonColor: '#6B7280',
                    confirmButtonText: 'ล้าง Cache',
                    cancelButtonText: 'ยกเลิก'
                  });
                  
                  if (result.isConfirmed) {
                    try {
                      const response = await fetch('/api/cache/clear', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'ads' })
                      });
                      
                      if (response.ok) {
                        Swal.fire({
                          icon: 'success',
                          title: 'ล้าง Cache สำเร็จ',
                          text: 'Cache ถูกล้างเรียบร้อยแล้ว',
                          confirmButtonColor: '#10B981'
                        });
                      }
                    } catch (error) {
                      Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถล้าง Cache ได้',
                        confirmButtonColor: '#EF4444'
                      });
                    }
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                🧹 ล้าง Cache
              </button>
              <button
                onClick={() => setConfigModal({ open: false })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveCacheConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

