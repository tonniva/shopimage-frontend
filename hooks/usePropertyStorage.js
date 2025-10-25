// hooks/usePropertyStorage.js
import { useState, useCallback } from 'react';
import { uploadPropertyImages, getUserStorageUsage } from '@/lib/storage';

export function usePropertyStorage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImages = useCallback(async (files, userId, reportId) => {
    if (!files || files.length === 0) {
      setError('No files provided');
      return { success: false, error: 'No files provided' };
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const results = await uploadPropertyImages(files, userId, reportId);
      
      // Check for failures
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        const errorMessage = `Failed to upload ${failedUploads.length} images`;
        setError(errorMessage);
        return { success: false, error: errorMessage, failedUploads };
      }

      setUploadProgress(100);
      return { success: true, results };

    } catch (err) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, []);

  const getStorageUsage = useCallback(async (userId) => {
    try {
      const usage = await getUserStorageUsage(userId);
      return { success: true, usage };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const resetState = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadImages,
    getStorageUsage,
    resetState
  };
}
