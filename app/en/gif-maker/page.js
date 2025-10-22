"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Play, Pause, Settings, Film, Archive } from "lucide-react";
import GIF from "gif.js";

export default function GifMakerEN() {
  const [images, setImages] = useState([]);
  const [delay, setDelay] = useState(500);
  const [quality, setQuality] = useState(10);
  const [width, setWidth] = useState(500);
  const [repeat, setRepeat] = useState(0); // 0 = forever
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGif, setGeneratedGif] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const moveImage = (index, direction) => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const generateGif = async () => {
    if (images.length < 2) {
      alert('Please upload at least 2 images');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const gif = new GIF({
      workers: 2,
      quality: quality,
      width: width,
      height: width, // square aspect ratio
      repeat: repeat,
      workerScript: '/gif.worker.js'
    });

    // Load and add each image
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const image = new Image();
      image.src = img.preview;

      await new Promise((resolve) => {
        image.onload = () => {
          // Create canvas to resize
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = width;

          // Calculate aspect ratio fit
          const aspectRatio = image.width / image.height;
          let drawWidth = width;
          let drawHeight = width;
          let offsetX = 0;
          let offsetY = 0;

          if (aspectRatio > 1) {
            drawHeight = width / aspectRatio;
            offsetY = (width - drawHeight) / 2;
          } else {
            drawWidth = width * aspectRatio;
            offsetX = (width - drawWidth) / 2;
          }

          // Fill background white
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, width);

          // Draw image
          ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

          gif.addFrame(canvas, { delay: delay });
          setProgress(((i + 1) / images.length) * 50);
          resolve();
        };
      });
    }

    gif.on('progress', (p) => {
      setProgress(50 + (p * 50));
    });

    gif.on('finished', (blob) => {
      setGeneratedGif(URL.createObjectURL(blob));
      setIsGenerating(false);
      setProgress(100);
    });

    gif.render();
  };

  const downloadGif = () => {
    if (!generatedGif) return;
    const link = document.createElement('a');
    link.href = generatedGif;
    link.download = `animated-${Date.now()}.gif`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-black sticky top-0 z-0 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-pink-200 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-xl font-bold text-center text-white">GIF Animation Maker</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Upload & Preview */}
          <div className="space-y-6">
            
            {/* Upload Images */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload size={20} />
                Upload Images
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <Film size={40} className="mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-purple-700">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP (2-30 images)</p>
              </button>
              
              {/* Image List */}
              {images.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Uploaded Images ({images.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {images.map((img, index) => (
                      <div key={img.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
                        <img src={img.preview} alt={`Frame ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold">Frame {index + 1}</p>
                          <p className="text-xs text-gray-500">{img.file.name}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-purple-600 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === images.length - 1}
                            className="p-1 text-gray-600 hover:text-purple-600 disabled:opacity-30"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => removeImage(img.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateGif}
              disabled={images.length < 2 || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating GIF... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Play size={20} />
                  Create GIF Animation
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="bg-white border-2 border-black rounded-xl p-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Result */}
            {generatedGif && (
              <div className="bg-white border-2 border-black rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Result</h2>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img src={generatedGif} alt="Generated GIF" className="w-full rounded-lg" />
                </div>
                <button
                  onClick={downloadGif}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download GIF
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            
            {/* Delay Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings size={20} />
                Animation Speed
              </h2>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Delay per Frame (ms)</span>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={delay}
                    onChange={(e) => setDelay(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Fast (100ms)</span>
                    <span className="font-bold text-purple-600">{delay}ms</span>
                    <span>Slow (2000ms)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Size Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">GIF Size</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 300, label: "Small (300px)" },
                  { value: 500, label: "Medium (500px)" },
                  { value: 800, label: "Large (800px)" },
                  { value: 1000, label: "Extra Large (1000px)" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setWidth(option.value)}
                    className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                      width === option.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Quality</h2>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>High Quality (Larger)</span>
                  <span className="font-bold text-purple-600">{quality}</span>
                  <span>Small File (Lower)</span>
                </div>
                <p className="text-xs text-gray-500">
                  Lower value (1-5) = Better quality, Higher value (15-20) = Smaller file
                </p>
              </div>
            </div>

            {/* Loop Settings */}
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Loop Options</h2>
              <div className="space-y-3">
                {[
                  { value: 0, label: "Loop Forever", icon: "∞" },
                  { value: 1, label: "Play Once", icon: "1" },
                  { value: 3, label: "Loop 3 Times", icon: "3" },
                  { value: 5, label: "Loop 5 Times", icon: "5" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRepeat(option.value)}
                    className={`w-full p-3 border-2 rounded-lg font-semibold transition-all flex items-center justify-between ${
                      repeat === option.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-2xl">{option.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-800">How to Use</h2>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. Upload at least 2 images</li>
                <li>2. Reorder frames using ▲ ▼ buttons</li>
                <li>3. Adjust speed, size, and quality</li>
                <li>4. Choose loop option</li>
                <li>5. Click &ldquo;Create GIF Animation&rdquo;</li>
                <li>6. Wait for processing, then download</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tips:</strong> Smaller size and lower quality = faster generation and smaller file
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

