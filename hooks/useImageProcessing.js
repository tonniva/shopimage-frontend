// hooks/useImageProcessing.js
import { useState, useCallback } from 'react';

export function useImageProcessing() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const processImages = useCallback(async (files, options = {}) => {
    if (!files || files.length === 0) {
      setError('No files provided');
      return { success: false, error: 'No files provided' };
    }

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add files to form data
      files.forEach(file => {
        formData.append('images', file);
      });
      
      // Add processing options
      formData.append('options', JSON.stringify(options));

      const response = await fetch('/api/property-snap/process-images', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process images');
      }

      const data = await response.json();
      setProgress(100);
      
      return { success: true, data };

    } catch (err) {
      const errorMessage = err.message || 'Image processing failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  }, []);

  const getImageMetadata = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(`/api/property-snap/process-images?url=${encodeURIComponent(imageUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get image metadata');
      }

      const data = await response.json();
      return { success: true, metadata: data.metadata };

    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const validateImage = useCallback((file) => {
    const errors = [];

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Unsupported file type: ${file.type}`);
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Check if file is too small
    if (file.size < 1024) { // Less than 1KB
      errors.push('File is too small');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, []);

  const validateImages = useCallback((files) => {
    const results = files.map(file => ({
      file,
      filename: file.name,
      validation: validateImage(file)
    }));

    const validFiles = results.filter(result => result.validation.valid);
    const invalidFiles = results.filter(result => !result.validation.valid);

    return {
      validFiles: validFiles.map(result => result.file),
      invalidFiles,
      totalFiles: files.length,
      validCount: validFiles.length,
      invalidCount: invalidFiles.length
    };
  }, [validateImage]);

  const resetState = useCallback(() => {
    setProcessing(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    processing,
    progress,
    error,
    processImages,
    getImageMetadata,
    validateImage,
    validateImages,
    resetState
  };
}
