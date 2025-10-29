'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, Eye, Share2, Phone, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { trackPropertySnap } from '@/lib/analytics';

export default function PropertySearchClient({ 
  categorySlug, 
  provinceSlug, 
  decodedCategorySlug, 
  decodedProvinceSlug,
  categoryThai,
  provinceThai,
  categoryInfo 
}) {
  const router = useRouter();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Debounce search term (wait 1200ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearchTerm !== searchTerm) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to first page when search changes
      }
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);
  
  // Track page view on mount
  useEffect(() => {
    if (categoryThai && provinceThai) {
      trackPropertySnap.searchPageView(categoryThai, provinceThai);
    }
  }, [categoryThai, provinceThai]);

  // Fetch properties
  useEffect(() => {
    if (!categorySlug || !provinceSlug) return;
    
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Send decoded values to API, use debounced search term
        const url = `/api/property-snap/search?category=${decodedCategorySlug}&province=${decodedProvinceSlug}&page=${currentPage}&limit=20&search=${encodeURIComponent(debouncedSearchTerm)}`;
        console.log('🔍 Fetching:', url);
        console.log('📝 Params:', { categorySlug, provinceSlug, decodedCategorySlug, decodedProvinceSlug, debouncedSearchTerm });
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotal(data.pagination?.total || 0);
          
          // Track search event when search term changes or page changes
          if (debouncedSearchTerm || currentPage > 1) {
            trackPropertySnap.search(categoryThai, provinceThai, debouncedSearchTerm, data.pagination?.total || 0);
          }
          
          // Track pagination
          if (currentPage > 1) {
            trackPropertySnap.pagination(currentPage, categoryThai, provinceThai);
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [categorySlug, provinceSlug, currentPage, debouncedSearchTerm, decodedCategorySlug, decodedProvinceSlug, categoryThai, provinceThai]);
  
  const formatPrice = (price) => {
    if (!price) return 'ไม่ระบุราคา';
    return new Intl.NumberFormat('th-TH').format(price) + ' บาท';
  };
  
  const handleShare = (shareToken) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    
    // Track share event
    trackPropertySnap.shareFromSearch(shareToken, categoryThai, provinceThai);
    
    if (navigator.share) {
      navigator.share({
        title: 'รายละเอียดอสังหาริมทรัพย์',
        text: 'ดูรายละเอียดอสังหาริมทรัพย์',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('คัดลอกลิงก์เรียบร้อยแล้ว');
    }
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    trackPropertySnap.viewModeChange(mode);
  };
  
  const handlePropertyClick = (propertyId) => {
    trackPropertySnap.propertyClick(propertyId, categoryThai, provinceThai);
  };
  
  const handlePhoneClick = (propertyId) => {
    trackPropertySnap.phoneClick(propertyId, categoryThai, provinceThai);
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Pagination tracking will be done in fetchProperties useEffect
  };
  
  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-3xl">{categoryInfo?.icon || '🏠'}</span> {categoryThai}
              </h1>
              <p className="text-gray-600 mt-1">
                <MapPin className="inline w-4 h-4" /> จังหวัด{provinceThai}
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="search-input"
              placeholder={`ค้นหา ${categoryThai}ใน${provinceThai}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>
          
          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-600">
            พบทั้งหมด <span className="font-semibold text-gray-900">{total}</span> รายการ
          </div>
        </div>
      </div>
      
      {/* Properties List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบรายการ</h3>
            <p className="text-gray-600">ไม่มีรายการ {categoryThai}ในจังหวัด{provinceThai}</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {properties.map((property) => {
                const images = Array.isArray(property.images) ? property.images : [];
                const firstImage = images[0]?.url || images[0] || null;
                
                return (
                  <div
                    key={property.id}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className={viewMode === 'list' ? 'w-80 h-full' : 'w-full aspect-video'}>
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Home className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {property.title}
                        </h3>
                        <button
                          onClick={() => handleShare(property.shareToken)}
                          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {property.description || 'ไม่มีรายละเอียด'}
                      </p>
                      
                      {/* Price */}
                      <div className="mb-3">
                        <span className="text-2xl font-bold text-emerald-600">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                      
                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {property.area && (
                          <span>{property.area.toLocaleString('th-TH')} ตร.ม.</span>
                        )}
                        {property.bedrooms && (
                          <span>{property.bedrooms} ห้องนอน</span>
                        )}
                        {property.bathrooms && (
                          <span>{property.bathrooms} ห้องน้ำ</span>
                        )}
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{property.location?.address || 'ไม่ระบุที่อยู่'}</span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/share/${property.shareToken}`}
                          onClick={() => handlePropertyClick(property.id)}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold text-center hover:from-emerald-700 hover:to-teal-700 transition-all"
                        >
                          ดูรายละเอียด
                        </Link>
                        {property.contactPhone && (
                          <a
                            href={`tel:${property.contactPhone}`}
                            onClick={() => handlePhoneClick(property.id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{property.viewCount || 0}</span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(property.createdAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

