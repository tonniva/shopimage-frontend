// components/ImageProcessingProgress.js
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ImageProcessingProgress({ 
  processing, 
  progress, 
  error, 
  results = null,
  onClose 
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!processing && !error && !results) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {processing ? 'กำลังประมวลผลรูปภาพ' : 
               error ? 'เกิดข้อผิดพลาด' : 
               'ประมวลผลเสร็จสิ้น'}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {processing && (
            <div className="text-center">
              <div className="mb-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">กำลังแปลงรูปภาพเป็น WebP และสร้าง thumbnail...</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{progress}% เสร็จสิ้น</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="mb-4">
                <XCircle className="w-12 h-12 text-red-600 mx-auto" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                ปิด
              </button>
            </div>
          )}

          {results && (
            <div>
              <div className="text-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              </div>
              
              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">ประมวลผลสำเร็จ</span>
                  <span className="text-green-600 text-sm">
                    {results.processedCount}/{results.totalImages} รูปภาพ
                  </span>
                </div>
                {results.errorCount > 0 && (
                  <div className="mt-2 text-orange-600 text-sm">
                    ⚠️ {results.errorCount} รูปภาพมีปัญหา
                  </div>
                )}
              </div>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-left text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
              >
                {showDetails ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
              </button>

              {/* Detailed Results */}
              {showDetails && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {/* Successful Images */}
                  {results.processedImages?.map((image, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {image.filename}
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>ขนาดเดิม: {(image.metadata.original.size / 1024 / 1024).toFixed(2)} MB</div>
                        <div>ขนาดใหม่: {(image.processed.size / 1024 / 1024).toFixed(2)} MB</div>
                        <div>ประหยัดพื้นที่: {image.metadata.compressionRatio}%</div>
                        <div>ขนาด: {image.processed.width} × {image.processed.height} px</div>
                      </div>
                    </div>
                  ))}

                  {/* Failed Images */}
                  {results.errors?.map((error, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-800 truncate">
                          {error.filename}
                        </span>
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-red-600">
                        {error.error}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ตกลง
                </button>
                {results.errorCount > 0 && (
                  <button
                    onClick={() => {
                      // Could implement retry functionality here
                      console.log('Retry failed images');
                    }}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    ลองใหม่
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
