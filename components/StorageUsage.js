// components/StorageUsage.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { prisma } from '@/lib/prisma';

export default function StorageUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStorageUsage();
    }
  }, [user]);

  const fetchStorageUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/property-snap/storage');
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      } else {
        throw new Error('Failed to fetch storage usage');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Error loading storage usage: {error}</p>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const { storage, reports, plan, warnings } = usage;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          plan.name === 'FREE' ? 'bg-gray-100 text-gray-600' :
          plan.name === 'PRO' ? 'bg-blue-100 text-blue-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          {plan.name} Plan
        </span>
      </div>

      {/* Storage Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Storage</span>
          <span className="text-sm text-gray-600">
            {storage.used}MB / {storage.limit}MB
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              warnings.storageExceeded ? 'bg-red-500' :
              warnings.storageNearLimit ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(storage.usagePercent, 100)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {storage.fileCount} files
          </span>
          <span className={`text-xs font-medium ${
            warnings.storageExceeded ? 'text-red-600' :
            warnings.storageNearLimit ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {storage.remaining}MB remaining
          </span>
        </div>
      </div>

      {/* Reports Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Reports</span>
          <span className="text-sm text-gray-600">
            {reports.used} / {reports.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              warnings.reportsExceeded ? 'bg-red-500' :
              warnings.reportsNearLimit ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(reports.usagePercent, 100)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            Property reports
          </span>
          <span className={`text-xs font-medium ${
            warnings.reportsExceeded ? 'text-red-600' :
            warnings.reportsNearLimit ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {reports.remaining} remaining
          </span>
        </div>
      </div>

      {/* Warnings */}
      {(warnings.storageExceeded || warnings.reportsExceeded || 
        warnings.storageNearLimit || warnings.reportsNearLimit) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Usage Alert
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                {warnings.storageExceeded && (
                  <p>• Storage limit exceeded. Please delete some files.</p>
                )}
                {warnings.reportsExceeded && (
                  <p>• Report limit exceeded. Please delete some reports.</p>
                )}
                {warnings.storageNearLimit && !warnings.storageExceeded && (
                  <p>• Storage usage is near the limit.</p>
                )}
                {warnings.reportsNearLimit && !warnings.reportsExceeded && (
                  <p>• Report count is near the limit.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {plan.name === 'FREE' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800">Upgrade for More Storage</h4>
              <p className="text-xs text-blue-600 mt-1">
                Get more storage and reports with PRO or BUSINESS plans
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
