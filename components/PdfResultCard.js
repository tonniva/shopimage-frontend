"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";

function QuotaBadge({ quota }) {
  if (!quota) return null;
  const { plan, remaining_day, remaining_month } = quota;
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
        Plan: <b className="ml-1 uppercase">{plan}</b>
      </span>
      {typeof remaining_day !== "undefined" && remaining_day !== null ? (
        <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
          Today: <b className="ml-1">{remaining_day}</b>
        </span>
      ) : (
        <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
          Today: <b className="ml-1">∞</b>
        </span>
      )}
      <span className="inline-flex items-center rounded border border-black px-1.5 py-0.5 bg-white">
        Month: <b className="ml-1">{remaining_month ?? "-"}</b>
      </span>
    </div>
  );
}

// Function to download all images as ZIP
async function downloadImagesAsZip(downloadUrlArray, filename = "pdf_images.zip") {
  try {
    const zip = new JSZip();
    
    // Fetch all images and add to zip
    const promises = downloadUrlArray.map(async (url, index) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image ${index + 1}`);
        
        const blob = await response.blob();
        const extension = url.split('.').pop() || 'jpg';
        const fileName = `page_${String(index + 1).padStart(3, '0')}.${extension}`;
        
        zip.file(fileName, blob);
        return { success: true, fileName };
      } catch (error) {
        console.error(`Error fetching image ${index + 1}:`, error);
        return { success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length === 0) {
      throw new Error("Failed to fetch any images");
    }
    
    if (failed.length > 0) {
      console.warn(`Failed to fetch ${failed.length} images:`, failed);
    }
    
    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadUrl = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(downloadUrl);
    
    return { success: true, downloaded: successful.length, failed: failed.length };
  } catch (error) {
    console.error("Error creating ZIP:", error);
    throw error;
  }
}

function ImagePreview({ downloadUrlArray }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!downloadUrlArray || downloadUrlArray.length === 0) return;
    
    // Set loading briefly to show loading state
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    
    return () => clearTimeout(timer);
  }, [downloadUrlArray]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600">Loading preview...</div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 rounded-lg border border-gray-300 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">
        <AlertTriangle size={16} className="inline mr-1" />
        Failed to load preview: {error}
      </div>
    );
  }

  if (!downloadUrlArray || downloadUrlArray.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 p-2 rounded-md">
        <ImageIcon size={16} className="inline mr-1" />
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Preview ({downloadUrlArray.length} image{downloadUrlArray.length !== 1 ? "s" : ""}):
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {downloadUrlArray.map((url, idx) => (
          <div
            key={idx}
            className="aspect-square overflow-hidden rounded-lg border border-black bg-gray-50 group cursor-pointer relative rainbow-border"
            onClick={() => window.open(url, '_blank')}
          >
            <img
              src={url}
              alt={`Page ${idx + 1}`}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => setError(`Failed to load image ${idx + 1}`)}
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PdfResultCard({ result }) {
  const [zipDownloading, setZipDownloading] = useState(false);
  
  if (!result) return null;

  const handleDownloadZip = async () => {
    if (!result.download_url_array || result.download_url_array.length === 0) return;
    
    setZipDownloading(true);
    try {
      const filename = result.filename || "pdf_images.zip";
      await downloadImagesAsZip(result.download_url_array, filename);
      // You can add a toast notification here if needed
    } catch (error) {
      console.error("ZIP download failed:", error);
      // You can add error toast here if needed
    } finally {
      setZipDownloading(false);
    }
  };

  return (
    <Card className="border border-black bg-white">
      <CardContent className="p-4 space-y-3">
        {result.ok ? (
          <>
            {/* Success State */}
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-2 rounded-md">
              ✅ Conversion successful!
            </div>

            {/* File Info */}
            <div className="text-sm text-gray-700 space-y-1">
              <div className="truncate font-medium" title={result.filename}>
                {result.filename}
              </div>
              <div className="text-green-600 text-xs font-semibold">
                📦 {result.size_kb} KB
              </div>
              <QuotaBadge quota={result.quota} />
            </div>

            {/* Image Preview */}
            <ImagePreview downloadUrlArray={result.download_url_array} />

            {/* Download Buttons */}
            <div className="space-y-2">
              {/* Download All as ZIP */}
              {result.download_url_array && result.download_url_array.length > 0 && (
                <Button
                  onClick={handleDownloadZip}
                  disabled={zipDownloading}
                  className="w-full border border-black bg-white text-black
                             transition-all duration-150 
                             hover:bg-black hover:text-black
                             hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                             active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} className="mr-2" />
                  {zipDownloading ? "Creating ZIP..." : "Download All as ZIP"}
                </Button>
              )}
              
              {/* Fallback: Original ZIP download if available */}
              {result.download_url && !result.download_url_array && (
                <a
                  href={result.download_url}
                  download={result.filename || true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="w-full border border-black bg-white text-black
                               transition-all duration-150 
                               hover:bg-black hover:text-white
                               hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                               active:translate-y-0 active:shadow-[2px_2px_0_#000] active:scale-[0.98]"
                  >
                    <Download size={16} className="mr-2" />
                    Download ZIP
                  </Button>
                </a>
              )}
              
              {/* Download Individual Images */}
              {result.download_url_array && result.download_url_array.length > 0 && (
                <div className="text-xs text-gray-500 text-center">
                  หรือคลิกที่รูปเพื่อดูขนาดเต็ม
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Error State */}
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">
              <AlertTriangle size={16} className="inline mr-1" />
              Conversion failed:{" "}
              {(() => {
                try {
                  const parsed =
                    typeof result.error === "string" ? JSON.parse(result.error) : result.error;
                  return parsed?.error || parsed?.message || "Unknown error";
                } catch {
                  return typeof result.error === "string" ? result.error : "Unknown error";
                }
              })()}
            </div>
            <QuotaBadge quota={result.quota} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
