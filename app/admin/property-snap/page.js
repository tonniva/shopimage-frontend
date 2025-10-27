'use client';
import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Home,
  CheckSquare,
  Square,
  Settings,
  Save,
  Megaphone
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function AdminPropertySnapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    hidden: 0
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectModal, setRejectModal] = useState({ open: false, reportId: null, reason: '' });
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [configModal, setConfigModal] = useState({ open: false });
  const [cacheConfig, setCacheConfig] = useState({
    enabled: true,
    maxAge: 300, // 5 minutes in seconds
    staleWhileRevalidate: true
  });

  // Load cache config from database
  const loadCacheConfig = async () => {
    try {
      const response = await fetch('/api/property-snap/cache-config?type=share_page');
      if (response.ok) {
        const data = await response.json();
        setCacheConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading cache config:', error);
    }
  };

  // Save cache config to database
  const saveCacheConfig = async () => {
    try {
      const response = await fetch('/api/property-snap/cache-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'share_page',
          enabled: cacheConfig.enabled,
          maxAge: cacheConfig.maxAge,
          staleWhileRevalidate: cacheConfig.staleWhileRevalidate
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกการตั้งค่าเรียบร้อย',
          confirmButtonColor: '#10B981',
          confirmButtonText: 'ตกลง'
        });
        setConfigModal({ open: false });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการบันทึก',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      console.error('Error saving cache config:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการบันทึก',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // Load cache config on mount
  useEffect(() => {
    loadCacheConfig();
  }, []);

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: selectedStatus,
        page: currentPage.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/property-snap/admin?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setStats(data.stats || stats);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch reports:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedStatus, currentPage]);

  // Toggle select individual report
  const toggleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedReports.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกรายการ',
        text: 'กรุณาเลือกรายการที่ต้องการดำเนินการ',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    if (action === 'delete') {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการลบ',
        text: `คุณแน่ใจหรือไม่ที่จะลบ ${selectedReports.length} รายการ?`,
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      const promises = selectedReports.map(reportId => 
        fetch(`/api/property-snap/admin/${reportId}`, {
          method: action === 'delete' ? 'DELETE' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.ok).length;

      if (successful > 0) {
        Swal.fire({
          icon: 'success',
          title: 'ดำเนินการสำเร็จ',
          text: `ดำเนินการสำเร็จ: ${successful}/${selectedReports.length} รายการ`,
          confirmButtonColor: '#10B981',
          confirmButtonText: 'ตกลง'
        });
        setSelectedReports([]);
        setSelectAll(false);
        await fetchReports();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการดำเนินการ',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // Handle actions
  const handleAction = async (action, reportId, reason = '') => {
    try {
      let response;
      let body = { action };

      if (action === 'reject') {
        body.reason = reason;
        response = await fetch(`/api/property-snap/admin/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        response = await fetch(`/api/property-snap/admin/${reportId}`, {
          method: action === 'delete' ? 'DELETE' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      if (response.ok) {
        await fetchReports(); // Refresh list
        if (action === 'delete') {
          Swal.fire({
            icon: 'success',
            title: 'ลบโพสต์สำเร็จ',
            confirmButtonColor: '#10B981',
            confirmButtonText: 'ตกลง'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'ดำเนินการสำเร็จ',
            text: `การดำเนินการสำเร็จ: ${action}`,
            confirmButtonColor: '#10B981',
            confirmButtonText: 'ตกลง'
          });
        }
        setRejectModal({ open: false, reportId: null, reason: '' });
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.error || 'Unknown error',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      console.error('Error performing action:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการดำเนินการ',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // Filter reports by search term
  const filteredReports = reports.filter(report => 
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            รออนุมัติ
          </div>
        );
      case 'APPROVED':
        return (
          <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
            <CheckCircle className="w-3 h-3" />
            อนุมัติแล้ว
          </div>
        );
      case 'REJECTED':
        return (
          <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            ถูกปฏิเสธ
          </div>
        );
      case 'HIDDEN':
        return (
          <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            <EyeOff className="w-3 h-3" />
            ซ่อน
          </div>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🔧 Admin - Property Snap</h1>
                <p className="text-xs sm:text-sm text-gray-600">จัดการและอนุมัติรายงาน</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/admin/ads"
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                title="จัดการโฆษณา"
              >
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline">จัดการโฆษณา</span>
              </Link>
              <button
                onClick={() => setConfigModal({ open: true })}
                className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
                title="ตั้งค่า Cache"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cache Config</span>
              </button>
              <button
                onClick={fetchReports}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4 min-w-[140px] flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200 min-w-[140px] flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">รออนุมัติ</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200 min-w-[140px] flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">อนุมัติแล้ว</p>
                <p className="text-xl sm:text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200 min-w-[140px] flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ถูกปฏิเสธ</p>
                <p className="text-xl sm:text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200 min-w-[140px] flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ซ่อน</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.hidden}</p>
              </div>
              <EyeOff className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedReports.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                เลือก {selectedReports.length} รายการ
              </span>
              <div className="flex gap-2">
                {selectedStatus === 'PENDING' && (
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    อนุมัติทั้งหมด
                  </button>
                )}
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบทั้งหมด
                </button>
                <button
                  onClick={() => {
                    setSelectedReports([]);
                    setSelectAll(false);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาจากชื่อ, ผู้สร้าง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'ทั้งหมด' : 
                   status === 'PENDING' ? 'รออนุมัติ' :
                   status === 'APPROVED' ? 'อนุมัติแล้ว' :
                   status === 'REJECTED' ? 'ถูกปฏิเสธ' : 'ซ่อน'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-4">กำลังโหลด...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">ไม่พบรายงาน</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full hidden md:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                      >
                        {selectAll || (selectedReports.length === filteredReports.length && filteredReports.length > 0) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายงาน</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้สร้าง</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถิติ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 w-12">
                        <button
                          onClick={() => toggleSelectReport(report.id)}
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          {selectedReports.includes(report.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{report.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.user?.name || 'ไม่ระบุ'}</div>
                          <div className="text-sm text-gray-500">{report.user?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(report.status)}
                        {report.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1">{report.rejectionReason}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Eye className="w-3 h-3" />
                            {report.viewCount || 0}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <TrendingUp className="w-3 h-3" />
                            {report.shareCount || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                          {report.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleAction('approve', report.id)}
                                className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">อนุมัติ</span>
                              </button>
                              <button
                                onClick={() => setRejectModal({ open: true, reportId: report.id, reason: '' })}
                                className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">ปฏิเสธ</span>
                              </button>
                            </>
                          )}
                          {report.status === 'APPROVED' && (
                            <button
                              onClick={() => handleAction('hide', report.id)}
                              className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                              <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">ซ่อน</span>
                            </button>
                          )}
                          {report.status === 'HIDDEN' && (
                            <button
                              onClick={() => handleAction('unhide', report.id)}
                              className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">แสดง</span>
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                icon: 'warning',
                                title: 'ยืนยันการลบ',
                                text: `คุณแน่ใจหรือไม่ที่จะลบรายงาน "${report.title}"?`,
                                showCancelButton: true,
                                confirmButtonColor: '#EF4444',
                                cancelButtonColor: '#6B7280',
                                confirmButtonText: 'ลบ',
                                cancelButtonText: 'ยกเลิก'
                              });
                              
                              if (result.isConfirmed) {
                                handleAction('delete', report.id);
                              }
                            }}
                            className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">ลบ</span>
                          </button>
                          <Link
                            href={`/share/${report.shareToken}`}
                            target="_blank"
                            className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors inline-flex items-center justify-center"
                          >
                            <span className="hidden sm:inline">ดู</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  {/* Checkbox and Title */}
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => toggleSelectReport(report.id)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors mt-1"
                    >
                      {selectedReports.includes(report.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{report.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                    </div>
                  </div>

                  {/* Status and User */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {getStatusBadge(report.status)}
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900">{report.user?.name || 'ไม่ระบุ'}</div>
                      <div className="text-xs text-gray-500">{report.user?.email || ''}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {report.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {report.shareCount || 0}
                    </div>
                    <div className="text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap pt-2 border-t">
                    {report.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAction('approve', report.id)}
                          className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, reportId: report.id, reason: '' })}
                          className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    {report.status === 'APPROVED' && (
                      <button
                        onClick={() => handleAction('hide', report.id)}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <EyeOff className="w-3 h-3" />
                      </button>
                    )}
                    {report.status === 'HIDDEN' && (
                      <button
                        onClick={() => handleAction('unhide', report.id)}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const result = await Swal.fire({
                          icon: 'warning',
                          title: 'ยืนยันการลบ',
                          text: `คุณแน่ใจหรือไม่ที่จะลบรายงาน "${report.title}"?`,
                          showCancelButton: true,
                          confirmButtonColor: '#EF4444',
                          cancelButtonColor: '#6B7280',
                          confirmButtonText: 'ลบ',
                          cancelButtonText: 'ยกเลิก'
                        });
                        
                        if (result.isConfirmed) {
                          handleAction('delete', report.id);
                        }
                      }}
                      className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <Link
                      href={`/share/${report.shareToken}`}
                      target="_blank"
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors inline-flex items-center justify-center"
                    >
                      ดู
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  หน้า {currentPage} จาก {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ย้อนหลัง
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">ปฏิเสธรายงาน</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เหตุผลในการปฏิเสธ
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  placeholder="ระบุเหตุผลในการปฏิเสธ..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setRejectModal({ open: false, reportId: null, reason: '' })}
                  className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleAction('reject', rejectModal.reportId, rejectModal.reason)}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cache Config Modal */}
        {configModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                Cache Configuration
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
                    <option value={14400}>4 ชั่วโมง</option>
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

                {/* Current Settings Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-sm sm:text-base text-green-900 mb-2">⚙️ การตั้งค่าปัจจุบัน</h4>
                  <div className="text-xs sm:text-sm text-green-800 space-y-1">
                    <div className="flex justify-between">
                      <span>สถานะ:</span>
                      <span className="font-medium">{cacheConfig.enabled ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Duration:</span>
                      <span className="font-medium">{Math.round(cacheConfig.maxAge / 60)} นาที</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stale While Revalidate:</span>
                      <span className="font-medium">{cacheConfig.staleWhileRevalidate ? 'เปิด' : 'ปิด'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-sm sm:text-base text-blue-900 mb-2">💡 คำแนะนำ</h4>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                    <li>• Cache ช่วยลดภาระฐานข้อมูลและเพิ่มความเร็ว</li>
                    <li>• ค่า 5-15 นาที เหมาะสำหรับข้อมูลที่เปลี่ยนแปลงไม่บ่อย</li>
                    <li>• Stale While Revalidate ช่วยให้ผู้ใช้เห็นข้อมูลทันที</li>
                    <li>• การเปลี่ยนแปลงจะส่งผลกับทุกคนทั่วโลก</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      icon: 'question',
                      title: 'ยืนยันการล้าง Cache',
                      text: 'คุณแน่ใจหรือไม่ที่จะล้าง Cache สำหรับ Property Snap?',
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
                          body: JSON.stringify({ type: 'report' })
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
    </div>
  );
}

