'use client';
import { useState, useEffect, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Settings, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import propertySnapAPI from '@/lib/property-snap-api';

export default function PropertySnapHeaderManager() {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);
  const [slideDelay, setSlideDelay] = useState(5);
  const fileInputRef = useRef(null);

  // Fetch headers on mount
  useEffect(() => {
    fetchHeaders();
  }, []);

  const fetchHeaders = async () => {
    try {
      setLoading(true);
      const data = await propertySnapAPI.headers.list();
      setHeaders(data.headers || []);
      
      // Load settings from first header if available
      if (data.headers && data.headers.length > 0) {
        setAutoSlide(data.headers[0].autoSlide);
        setSlideDelay(data.headers[0].slideDelay / 1000); // Convert to seconds
      }
    } catch (error) {
      console.error('Error fetching headers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('autoSlide', autoSlide);
    formData.append('slideDelay', slideDelay * 1000); // Convert to milliseconds

    try {
      const data = await propertySnapAPI.headers.upload(formData);
      
      console.log('📥 Upload response:', data);
      console.log('📊 Results breakdown:', {
        total: data.total,
        successful: data.successful,
        failed: data.failed,
        results: data.results
      });
      
      // Check if any files were successfully uploaded
      if (data.success && data.successful > 0) {
        await fetchHeaders(); // Refresh list
        
        // Calculate total compression stats
        const compressionInfo = data.results
          .filter(r => r.success)
          .map((r, idx) => {
            const sizeKB = (r.compressedSize / 1024).toFixed(1);
            const savings = r.savings || 0;
            return `รูป ${idx + 1}: ${sizeKB}KB (ลดลง ${savings}%)`;
          })
          .join('\n');
        
        if (data.failed > 0) {
          alert(`อัพโหลดสำเร็จ ${data.successful}/${data.total} รูป\n\nขนาดไฟล์หลังบีบอัด:\n${compressionInfo}\n\n(ล้มเหลว ${data.failed} รูป)`);
        } else {
          alert(`อัพโหลดสำเร็จ ${data.successful}/${data.total} รูป\n\nขนาดไฟล์หลังบีบอัด:\n${compressionInfo}`);
        }
      } else if (data.success && data.successful === 0) {
        // All uploads failed
        console.error('❌ All uploads failed:', data.results);
        
        // Extract error details
        const errorMessages = data.results?.map((r, idx) => {
          const fileName = r.filename || `รูปที่ ${idx + 1}`;
          const errorMsg = r.error || 'ไม่ทราบสาเหตุ';
          
          // Log full error object for debugging
          console.error(`  File: ${fileName}`, r);
          
          return `${fileName}: ${errorMsg}`;
        }).join('\n') || 'ไม่ทราบสาเหตุ';
        
        alert(`อัพโหลดล้มเหลว:\n\n${errorMessages}\n\nโปรดตรวจสอบ Console (F12) สำหรับรายละเอียดเพิ่มเติม`);
      } else {
        console.error('❌ Upload failed:', data);
        alert(`เกิดข้อผิดพลาด: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
      e.target.value = ''; // Clear input
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรูปนี้?')) return;

    try {
      await propertySnapAPI.headers.delete(id);
      await fetchHeaders();
      alert('ลบสำเร็จ');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentHeader = headers.find(h => h.id === id);
    if (!currentHeader) return;

    const newOrder = direction === 'up' ? currentHeader.order - 1 : currentHeader.order + 1;
    const otherHeader = headers.find(h => h.order === newOrder);
    
    if (!otherHeader && newOrder < 0) return; // Already at the top
    if (!otherHeader && newOrder > headers.length) return; // Already at the bottom

    try {
      // Swap orders
      await Promise.all([
        propertySnapAPI.headers.update(id, { order: newOrder }),
        otherHeader && propertySnapAPI.headers.update(otherHeader.id, { order: currentHeader.order })
      ]);

      await fetchHeaders();
    } catch (error) {
      console.error('Error reordering:', error);
      alert('เกิดข้อผิดพลาดในการจัดลำดับ');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updatePromises = headers.map(header => 
        propertySnapAPI.headers.update(header.id, {
          autoSlide,
          slideDelay: slideDelay * 1000
        })
      );

      await Promise.all(updatePromises);
      alert('บันทึกการตั้งค่าสำเร็จ');
      await fetchHeaders();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">จัดการ Header Banner</h3>
            <p className="text-sm text-gray-500">อัพโหลดและตั้งค่า Header Banner สำหรับหน้า Share</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          {uploading ? 'กำลังอัพโหลด...' : '+ อัพโหลด Header Banner'}
        </button>
        <p className="text-sm text-gray-500 text-center mt-2">
          รองรับไฟล์ PNG, JPEG, WebP ขนาดไม่เกิน 5MB ต่อไฟล์
        </p>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoSlide"
            checked={autoSlide}
            onChange={(e) => setAutoSlide(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="autoSlide" className="font-medium text-gray-700">
            เปิดใช้งาน Auto Slide
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เวลาเลื่อน (วินาที): {slideDelay}s
          </label>
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={slideDelay}
            onChange={(e) => setSlideDelay(parseInt(e.target.value))}
            disabled={!autoSlide}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3s</span>
            <span>10s</span>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="md:col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          บันทึกการตั้งค่า
        </button>
      </div>

      {/* Preview Images */}
      {headers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {headers.map((header, index) => (
            <div key={header.id} className="relative group bg-gray-50 rounded-lg p-2">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={header.url}
                  alt={`Header ${header.order}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => handleReorder(header.id, 'up')}
                      className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                      title="ย้ายขึ้น"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {index < headers.length - 1 && (
                    <button
                      onClick={() => handleReorder(header.id, 'down')}
                      className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                      title="ย้ายลง"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(header.id)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                <span>ลำดับ: {header.order}</span>
                <span className="text-gray-400">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>ยังไม่มี Header Banner</p>
          <p className="text-sm">อัพโหลดรูปเพื่อเริ่มต้น</p>
        </div>
      )}
    </div>
  );
}

