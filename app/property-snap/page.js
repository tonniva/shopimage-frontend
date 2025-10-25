'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { 
  MapPin, 
  Camera, 
  Star, 
  Share2, 
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  Eye,
  Calendar,
  Users,
  ArrowRight,
  Home,
  Building,
  Car,
  ShoppingBag,
  GraduationCap,
  Hospital,
  Coffee,
  Plane,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PropertySnapMainPage() {
  const { user, ready } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/property-snap/list');
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties || []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProperties();
    }
  }, [user]);

  // Handle status change
  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      const response = await fetch(`/api/property-snap/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setProperties(prev => 
          prev.map(prop => 
            prop.id === propertyId 
              ? { ...prop, status: newStatus }
              : prop
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle delete
  const handleDelete = async (propertyId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายงานนี้?')) return;

    try {
      const response = await fetch(`/api/property-snap/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setProperties(prev => prev.filter(prop => prop.id !== propertyId));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const propertyTypes = [
    { id: 'all', name: 'ทั้งหมด', icon: Home },
    { id: 'condo', name: 'คอนโด', icon: Building },
    { id: 'house', name: 'บ้าน', icon: Home },
    { id: 'land', name: 'ที่ดิน', icon: MapPin },
    { id: 'commercial', name: 'เชิงพาณิชย์', icon: ShoppingBag },
    { id: 'office', name: 'ออฟฟิศ', icon: Building }
  ];

  const nearbyPlaceIcons = {
    'school': GraduationCap,
    'hospital': Hospital,
    'shopping_mall': ShoppingBag,
    'transit_station': Car,
    'restaurant': Coffee,
    'airport': Plane,
    'park': MapPin,
    'bank': Building,
    'pharmacy': Hospital,
    'gym': Building,
    'library': GraduationCap,
    'church': Building,
    'mosque': Building,
    'temple': Building,
    'police': Building,
    'fire_station': Building,
    'post_office': Building,
    'atm': Building,
    'convenience_store': ShoppingBag,
    'supermarket': ShoppingBag,
    'market': ShoppingBag,
    'default': MapPin
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/property-snap/list');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || property.propertyType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getNearbyPlaceIcon = (type) => {
    const IconComponent = nearbyPlaceIcons[type] || nearbyPlaceIcons.default;
    return IconComponent;
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🏠 Property Snap</h1>
                <p className="text-sm text-gray-600">ค้นหาอสังหาริมทรัพย์ที่ใช่สำหรับคุณ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/property-snap/create"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  สร้างรายงาน
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div 
          className="relative text-center mb-12 rounded-2xl overflow-hidden min-h-[400px]"
          style={{
            boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Background Image */}
          <Image
            src="/header/chicago-city-urban-skyline-panorama.jpg"
            alt="Chicago City Skyline"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          
          {/* Content */}
          <div className="relative z-10 py-12 sm:py-16 px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)' }}>
              สร้าง Link แชร์รายงานอสังหาริมทรัพย์ของคุณ
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
              ดูภาพรวมสถานที่ใกล้เคียง ราคา และข้อมูลสำคัญในที่เดียว
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อ, ที่อยู่, หรือคำอธิบาย..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg bg-white/90 backdrop-blur-sm shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">ประเภทอสังหาริมทรัพย์</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {propertyTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                {/* Property Image */}
                <div className="relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Property Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {propertyTypes.find(t => t.id === property.propertyType)?.name || 'อสังหาริมทรัพย์'}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                      property.status === 'SOLD' ? 'bg-red-500' : 
                      property.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {property.status === 'SOLD' ? <XCircle className="w-3 h-3" /> : 
                       property.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : 
                       <Eye className="w-3 h-3" />}
                      <span>{property.status === 'SOLD' ? 'ขายแล้ว' : 
                             property.status === 'ACTIVE' ? 'ขาย' : 'ไม่ระบุ'}</span>
                    </div>
                  </div>
                  
                  {/* View Count */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{property.viewCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {property.title || 'อสังหาริมทรัพย์'}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm line-clamp-1">
                      {property.location?.address || 'ไม่ระบุที่อยู่'}
                    </span>
                  </div>

                  {/* Province and Region */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📍 {property.province || '-'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🗺️ {property.region || '-'}
                    </span>
                  </div>

                  {/* Price and Listing Type */}
                  <div className="mb-3">
                    <div className="text-lg font-bold text-green-600">
                      {property.price ? `${Number(property.price).toLocaleString('en-US')} บาท` : '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.listingType === 'sale' && 'ขาย'}
                      {property.listingType === 'rent' && 'ให้เช่า'}
                      {property.listingType === 'both' && 'ขาย/เช่า'}
                      {!property.listingType && '-'}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">พื้นที่:</span>
                      <span>{property.area ? `${property.area} ตร.ม.` : '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">ห้องนอน:</span>
                      <span>{property.bedrooms || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">ห้องน้ำ:</span>
                      <span>{property.bathrooms || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">ชั้น:</span>
                      <span>{property.floors || '-'}</span>
                    </div>
                  </div>

                  {/* Nearby Places */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">สถานที่ใกล้เคียง:</div>
                    {property.nearbyPlaces && property.nearbyPlaces.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {property.nearbyPlaces.slice(0, 3).map((place, index) => {
                          const IconComponent = getNearbyPlaceIcon(place.type);
                          return (
                            <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              <IconComponent className="w-3 h-3" />
                              <span>{place.name}</span>
                              {place.distanceKm && (
                                <span className="text-blue-600 font-medium">
                                  {place.distanceKm}กม.
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {property.nearbyPlaces.length > 3 && (
                          <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            +{property.nearbyPlaces.length - 3} อื่นๆ
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(property.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{property.shareCount || 0} แชร์</span>
                    </div>
                  </div>

                  {/* Management Actions */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleStatusChange(property.id, property.status === 'ACTIVE' ? 'SOLD' : 'ACTIVE')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        property.status === 'ACTIVE' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {property.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {property.status === 'ACTIVE' ? 'ปิดการขาย' : 'เปิดการขาย'}
                    </button>
                    <Link
                      href={`/property-snap/edit/${property.id}`}
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/share/${property.shareToken}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      ดูรายงาน
                    </Link>
                    <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Home className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบอสังหาริมทรัพย์ที่คุณลง</h3>
            <p className="text-gray-600 mb-6">ลองเปลี่ยนคำค้นหาหรือประเภทอสังหาริมทรัพย์</p>
            {user && (
              <Link
                href="/property-snap/create"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                สร้างรายงานแรก
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}