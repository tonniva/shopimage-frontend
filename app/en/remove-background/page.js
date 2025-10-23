"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, Scissors, Loader2, CheckCircle, XCircle, Eye, Trash2, FileArchive } from "lucide-react";
import JSZip from "jszip";

export default function RemoveBackgroundPage() {
  // State variables
  const [uploadedImages, setUploadedImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [outputFormat, setOutputFormat] = useState("png");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      status: "pending", // pending, processing, success, error
      processedUrl: null,
      error: null
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  // Remove image from list
  const removeImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    setProcessedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Clear all images
  const clearAllImages = () => {
    setUploadedImages([]);
    setProcessedImages([]);
    setProcessingProgress(0);
  };

  // Process single image with API
  const processImageWithAPI = async (imageData) => {
    const formData = new FormData();
    formData.append("file", imageData.file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/remove-bg`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          url: result.download_url,
          filename: result.filename,
          size: result.size_kb,
        };
      } else {
        throw new Error("Failed to process image");
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Process all images
  const processAllImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    const updatedImages = [...uploadedImages];
    const processed = [];

    for (let i = 0; i < updatedImages.length; i++) {
      const image = updatedImages[i];
      
      // Update status to processing
      image.status = "processing";
      setUploadedImages([...updatedImages]);

      // Process image
      const result = await processImageWithAPI(image);

      if (result.success) {
        image.status = "success";
        image.processedUrl = result.url;
        processed.push(image);
      } else {
        image.status = "error";
        image.error = result.error;
      }

      updatedImages[i] = image;
      setUploadedImages([...updatedImages]);
      setProcessedImages([...processed]);
      setProcessingProgress(Math.round(((i + 1) / updatedImages.length) * 100));
    }

    setIsProcessing(false);
  };

  // Download single image
  const downloadSingleImage = (image) => {
    if (!image.processedUrl) return;
    
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = image.processedUrl;
    link.download = `nobg_${image.name}`;
    link.target = "_blank"; // Fallback for browsers that don't support download
    
    // Append to body, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all as ZIP
  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const successImages = processedImages.filter((img) => img.status === "success");

    for (const image of successImages) {
      try {
        const response = await fetch(image.processedUrl);
        const blob = await response.blob();
        zip.file(`nobg_${image.name}`, blob);
      } catch (error) {
        console.error(`Failed to add ${image.name} to ZIP:`, error);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `removed-backgrounds-${Date.now()}.zip`;
    link.click();
  };

  // Show preview modal
  const showPreviewModal = (image) => {
    setPreviewImage(image);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Scissors className="text-cyan-600" size={32} />
              AI Background Remover
            </h1>
            <p className="text-gray-600">
              Remove backgrounds automatically with AI - Upload multiple images at once
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            
            {/* Image Upload */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload className="text-cyan-600" size={20} />
                Upload Images
              </h3>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-200 cursor-pointer"
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                  <p className="text-sm text-gray-600 text-center">
                    Click to select files or drag and drop here
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Supports JPG, PNG (max 10 images)
                  </p>
                </button>

                {uploadedImages.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={clearAllImages}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Output Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Settings</h3>
              
              <div className="space-y-4">
                {/* Output Format */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Output Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="png"
                        checked={outputFormat === "png"}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-4 h-4 text-cyan-600"
                      />
                      <span className="text-sm">PNG (transparent background)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="jpg"
                        checked={outputFormat === "jpg"}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-4 h-4 text-cyan-600"
                      />
                      <span className="text-sm">JPG (solid background)</span>
                    </label>
                  </div>
                </div>

                {/* Background Color (if JPG) */}
                {outputFormat === "jpg" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={processAllImages}
              disabled={uploadedImages.length === 0 || isProcessing}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing... ({processingProgress}%)
                </>
              ) : (
                <>
                  <Scissors size={20} />
                  Remove Backgrounds ({uploadedImages.length} images)
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="bg-white border-2 border-black rounded-xl p-4">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Processing...</span>
                  <span>{processingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 h-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Image List */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">
                Image List ({uploadedImages.length})
              </h3>

              {uploadedImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Upload size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No images yet</p>
                  <p className="text-sm">Upload images to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-cyan-300 transition-colors"
                    >
                      {/* Thumbnail */}
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded border-2 border-gray-300"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{image.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {image.status === "pending" && (
                            <span className="text-xs text-gray-500">Waiting...</span>
                          )}
                          {image.status === "processing" && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <Loader2 className="animate-spin" size={12} />
                              Processing...
                            </span>
                          )}
                          {image.status === "success" && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} />
                              Done
                            </span>
                          )}
                          {image.status === "error" && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <XCircle size={12} />
                              Error
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {image.status === "success" && (
                          <>
                            <button
                              onClick={() => showPreviewModal(image)}
                              className="p-2 hover:bg-cyan-100 rounded transition-colors"
                              title="Preview"
                            >
                              <Eye size={16} className="text-cyan-600" />
                            </button>
                            <button
                              onClick={() => downloadSingleImage(image)}
                              className="p-2 hover:bg-green-100 rounded transition-colors"
                              title="Download"
                            >
                              <Download size={16} className="text-green-600" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeImage(image.id)}
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Download */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Download</h3>

              {processedImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Download size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No processed images yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border-2 border-cyan-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">Successfully processed:</span>
                      <span className="text-sm font-bold text-cyan-600">
                        {processedImages.length} images
                      </span>
                    </div>
                  </div>

                  {/* Download All Button */}
                  {processedImages.length > 1 ? (
                    <button
                      onClick={downloadAllAsZip}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FileArchive size={20} />
                      Download All (ZIP)
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadSingleImage(processedImages[0])}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Image
                    </button>
                  )}

                  {/* Preview Grid */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Processed Images Preview:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {processedImages.slice(0, 4).map((image) => (
                        <div
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => showPreviewModal(image)}
                        >
                          <img
                            src={image.processedUrl}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-300 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                            <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {processedImages.length > 4 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        +{processedImages.length - 4} more images
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{previewImage.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <div>
                <p className="text-sm font-semibold mb-2 text-gray-700">Before:</p>
                <img
                  src={previewImage.preview}
                  alt="Before"
                  className="w-full rounded-lg border-2 border-gray-300"
                />
              </div>

              {/* After */}
              <div>
                <p className="text-sm font-semibold mb-2 text-gray-700">After:</p>
                <div className="relative">
                  <img
                    src={previewImage.processedUrl}
                    alt="After"
                    className="w-full rounded-lg border-2 border-gray-300 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => downloadSingleImage(previewImage)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download This Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

