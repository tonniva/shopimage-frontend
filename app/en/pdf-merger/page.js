"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, FileText, GripVertical, X, Eye, RotateCw, Plus, Trash2, Layers } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ pdf, index, onRemove, onRotate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pdf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical size={20} className="text-gray-400" />
        </div>

        {/* PDF Icon & Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText size={24} className="text-red-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{index + 1}. {pdf.name}</p>
              <p className="text-xs text-gray-500">
                {(pdf.size / 1024 / 1024).toFixed(2)} MB
                {pdf.pageCount && ` • ${pdf.pageCount} pages`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onRotate(pdf.id)}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            title="Rotate 90°"
          >
            <RotateCw size={16} className="text-purple-600" />
          </button>
          <button
            onClick={() => onRemove(pdf.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
          >
            <X size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PDFMergerEN() {
  const [pdfs, setPdfs] = useState([]);
  const [outputFilename, setOutputFilename] = useState("merged");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPdfs = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      rotation: 0,
    }));
    setPdfs([...pdfs, ...newPdfs]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPdfs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removePdf = (id) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== id));
  };

  const rotatePdf = (id) => {
    setPdfs(pdfs.map(pdf => 
      pdf.id === id 
        ? { ...pdf, rotation: (pdf.rotation + 90) % 360 }
        : pdf
    ));
  };

  const mergePDFs = async () => {
    console.log('=== Starting PDF Merge ===');
    
    if (pdfs.length < 2) {
      console.log('❌ Not enough files:', pdfs.length);
      alert('Please upload at least 2 PDF files');
      return;
    }

    console.log('✅ File count:', pdfs.length);
    console.log('📄 File list:', pdfs.map(p => ({ name: p.name, size: p.size })));

    setIsProcessing(true);
    setProgress(0);
    setMergedPdfUrl(null);

    try {
      console.log('📦 Creating FormData...');
      const formData = new FormData();
      
      // Add files in the current order
      pdfs.forEach((pdf, index) => {
        console.log(`  ${index + 1}. Adding file: ${pdf.name} (${(pdf.size / 1024 / 1024).toFixed(2)} MB)`);
        formData.append('files', pdf.file);
      });

      // Simulate progress during upload
      setProgress(20);
      console.log('📤 Uploading to API... (20%)');

      // Call Rust API 
      const response = await fetch(`${BACKEND_URL}/api/merge-pdf`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Got Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      setProgress(60);

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status);
        throw new Error(`Failed to merge PDFs: ${response.statusText}`);
      }

      console.log('✅ Response OK, converting to JSON... (80%)');
      setProgress(80);

      const data = await response.json();
      console.log('📦 Response Data:', data);
      console.log('📦 File Size:', data.size_kb, 'KB');
      console.log('📦 Filename:', data.filename);
      console.log('🔗 Download URL:', data.download_url);
      console.log('📊 Quota:', data.quota);
      
      setMergedPdfUrl(data.download_url);
      setProgress(100);
      setIsProcessing(false);
      
      console.log('✅ PDF merge complete! (100%)');
      console.log('=== Finished ===');
      
    } catch (error) {
      console.error('❌ ERROR during PDF merge:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      alert('Error merging PDFs. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadMergedPdf = () => {
    if (!mergedPdfUrl) return;
    
    console.log('📥 Starting download...');
    console.log('🔗 URL:', mergedPdfUrl);
    
    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = `${outputFilename}.pdf`;
    link.click();
    
    console.log('✅ Download started!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-black   top-0 z-0 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-pink-200 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-xl font-bold text-center text-white">Merge PDF Files</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload & File List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload Zone */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload size={20} />
                Upload PDF Files
              </h2>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="block w-full p-8 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
              >
                <FileText size={48} className="mx-auto text-purple-600 mb-3" />
                <p className="text-center text-sm font-semibold text-purple-700">Click to upload PDFs</p>
                <p className="text-center text-xs text-gray-500 mt-1">Support multiple files at once</p>
              </label>
            </div>

            {/* File List */}
            {pdfs.length > 0 && (
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileText size={20} />
                    PDF Files ({pdfs.length})
                  </h2>
                  <button
                    onClick={() => setPdfs([])}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pdfs.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {pdfs.map((pdf, index) => (
                        <SortableItem
                          key={pdf.id}
                          pdf={pdf}
                          index={index}
                          onRemove={removePdf}
                          onRotate={rotatePdf}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-700">
                    💡 <strong>Tips:</strong> Drag and drop to reorder PDFs as needed
                  </p>
                </div>
              </div>
            )}

            {/* Merge Button */}
            {pdfs.length >= 2 && !mergedPdfUrl && (
              <button
                onClick={mergePDFs}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Layers size={24} />
                    Merge All PDFs
                  </>
                )}
              </button>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="bg-white border-2 border-black rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Processing...</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="text-xs text-white font-bold">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Download Button - Show after merge complete */}
            {mergedPdfUrl && (
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <FileText size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">PDF Merged Successfully!</h3>
                  <p className="text-sm text-gray-600 mt-1">Your file is ready to download</p>
                </div>
                
                <button
                  onClick={downloadMergedPdf}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Download size={24} />
                  Download {outputFilename}.pdf
                </button>

                <button
                  onClick={() => {
                    setMergedPdfUrl(null);
                    setPdfs([]);
                    setProgress(0);
                  }}
                  className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Start New
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Settings & Info */}
          <div className="space-y-6">
            
            {/* Output Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Output Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="merged"
                  />
                  <p className="text-xs text-gray-500 mt-1">Desired filename (without .pdf extension)</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {pdfs.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 text-purple-800">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Files:</span>
                    <span className="font-bold text-purple-700">{pdfs.length} files</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Size:</span>
                    <span className="font-bold text-purple-700">
                      {(pdfs.reduce((sum, pdf) => sum + pdf.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Output File:</span>
                    <span className="font-bold text-purple-700">{outputFilename}.pdf</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-800">How to Use</h2>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. Upload at least 2 PDF files</li>
                <li>2. Drag and drop to reorder</li>
                <li>3. Rotate files as needed using 🔄</li>
                <li>4. Set output filename</li>
                <li>5. Click &ldquo;Merge All PDFs&rdquo;</li>
                <li>6. Download the merged file</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  🔒 <strong>Privacy:</strong> Files are processed on the server and deleted immediately after delivery
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Features</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Merge unlimited PDFs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Reorder files easily
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Rotate PDF pages
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Fast processing with Rust
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Secure - files not stored
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

