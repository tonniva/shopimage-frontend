/**
 * Property Snap API Client
 * Centralized client for all property-snap API calls
 * Uses external API at http://localhost:3000/api/property-snap/*
 */

const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'http://localhost:3000';

// Log API base URL on first load (client-side only)
if (typeof window !== 'undefined' && !window.__API_BASE_LOGGED) {
  console.log('🌐 External API Base URL:', EXTERNAL_API_BASE);
  window.__API_BASE_LOGGED = true;
}

/**
 * Build full API URL
 */
function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${EXTERNAL_API_BASE}${cleanEndpoint}`;
  
  // Validate URL format
  try {
    new URL(fullUrl);
  } catch (urlError) {
    console.error('❌ Invalid API URL:', fullUrl, urlError);
    throw new Error(`Invalid API URL: ${fullUrl}`);
  }
  
  return fullUrl;
}

/**
 * Get auth token from environment variable or Supabase session
 */
async function getAuthToken() {
  // Priority 1: Use SUPABASE_TOKEN from environment variable (server-side or public env)
  if (typeof window === 'undefined') {
    // Server-side: use server env vars
    const serverToken = process.env.SUPABASE_TOKEN || process.env.NEXT_PUBLIC_SUPABASE_TOKEN;
    if (serverToken) {
      console.log('🔑 Using server-side SUPABASE_TOKEN');
      return serverToken;
    }
    return null;
  }
  
  // Client-side: check public env var first
  const envToken = process.env.NEXT_PUBLIC_SUPABASE_TOKEN;
  if (envToken) {
    console.log('🔑 Using NEXT_PUBLIC_SUPABASE_TOKEN from env');
    return envToken;
  }
  
  // Fallback: Try to get token from Supabase session
  try {
    // Dynamic import to avoid SSR issues
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('⚠️ Supabase getSession error:', error);
    } else if (session?.access_token) {
      console.log('🔑 Using Supabase session access_token');
      return session.access_token;
    } else {
      console.warn('⚠️ No Supabase session found');
    }
  } catch (error) {
    console.warn('⚠️ Failed to get auth token from Supabase session:', error);
  }
  
  // Last resort: try session endpoint
  try {
    const response = await fetch('/api/auth/session');
    if (response.ok) {
      const data = await response.json();
      const token = data.accessToken || data.token;
      if (token) {
        console.log('🔑 Using token from /api/auth/session');
        return token;
      }
    }
  } catch (fetchError) {
    console.warn('⚠️ Failed to get auth token from session endpoint:', fetchError);
  }
  
  console.warn('⚠️ No auth token available');
  return null;
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  const token = await getAuthToken();
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Using token for request:', url.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ No token available for request:', url);
  }
  
  // Copy cookies for session auth (fallback)
  console.log('📡 API Request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    headers: Object.keys(headers)
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session-based auth
    });
    
    console.log('📥 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return response;
  } catch (error) {
    // Handle different types of errors
    const errorInfo = {
      url,
      errorType: error?.constructor?.name || typeof error,
      errorMessage: error?.message || String(error) || 'Unknown error',
      errorName: error?.name || 'Error',
      stack: error?.stack || 'No stack trace',
      // Network-specific errors
      isNetworkError: error?.message?.includes('fetch') || 
                     error?.message?.includes('network') ||
                     error?.message?.includes('CORS') ||
                     !error?.message,
      // Additional error properties
      ...(error?.cause && { cause: error.cause }),
      ...(error?.code && { code: error.code }),
    };
    
    console.error('❌ API Request Error:', errorInfo);
    
    // Create a more informative error
    let errorMessage = errorInfo.errorMessage;
    
    // Network errors - connection refused, CORS, etc.
    if (errorInfo.isNetworkError || !errorInfo.errorMessage || errorInfo.errorMessage === 'Unknown error') {
      if (url.includes('localhost:3000')) {
        errorMessage = `ไม่สามารถเชื่อมต่อกับ API server ที่ ${url} กรุณาตรวจสอบว่า API server ทำงานอยู่และเปิด CORS`;
      } else {
        errorMessage = `ไม่สามารถเชื่อมต่อกับ API server กรุณาตรวจสอบการตั้งค่าและ network connection`;
      }
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.name = errorInfo.errorName;
    enhancedError.url = url;
    enhancedError.originalError = error;
    enhancedError.isNetworkError = errorInfo.isNetworkError;
    
    throw enhancedError;
  }
}

/**
 * Property Snap API Methods
 */
export const propertySnapAPI = {
  /**
   * Create a new property report
   */
  async create(formData) {
    const response = await apiRequest('/api/property-snap/create', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create report' }));
      throw new Error(error.error || error.details || 'Failed to create report');
    }
    
    return response.json();
  },

  /**
   * Get property reports list for current user
   */
  async list(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      
      const queryString = searchParams.toString();
      const endpoint = `/api/property-snap/list${queryString ? `?${queryString}` : ''}`;
      
      console.log('📋 Fetching property list:', { params, endpoint });
      
      const response = await apiRequest(endpoint, {
        method: 'GET',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { 
            error: `HTTP ${response.status}: ${response.statusText}`,
            details: 'Failed to parse error response'
          };
        }
        
        console.error('❌ Property list API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        const errorMessage = errorData.details || errorData.error || `Failed to fetch properties (${response.status})`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      console.log('✅ Property list fetched successfully:', {
        count: data.properties?.length || 0,
        total: data.pagination?.total || 0
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error in propertySnapAPI.list:', error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(error.message || 'Failed to fetch properties');
    }
  },

  /**
   * Search public properties
   */
  async search(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    const endpoint = `/api/property-snap/search${queryString ? `?${queryString}` : ''}`;
    
    // Search is public, no auth required
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to search properties' }));
      throw new Error(error.error || error.details || 'Failed to search properties');
    }
    
    return response.json();
  },

  /**
   * Get property report by ID
   */
  async getById(id) {
    const response = await apiRequest(`/api/property-snap/${id}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch report' }));
      throw new Error(error.error || error.details || 'Failed to fetch report');
    }
    
    return response.json();
  },

  /**
   * Update property report
   */
  async update(id, formData) {
    const response = await apiRequest(`/api/property-snap/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update report' }));
      throw new Error(error.error || error.details || 'Failed to update report');
    }
    
    return response.json();
  },

  /**
   * Delete property report
   */
  async delete(id) {
    const response = await apiRequest(`/api/property-snap/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete report' }));
      throw new Error(error.error || error.details || 'Failed to delete report');
    }
    
    return response.json();
  },

  /**
   * Get property report by share token (public)
   */
  async getByShareToken(shareToken) {
    const response = await fetch(buildApiUrl(`/api/property-snap/share/${shareToken}`), {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch report' }));
      throw new Error(error.error || error.details || 'Failed to fetch report');
    }
    
    return response.json();
  },

  /**
   * Get property report by token (alternative endpoint)
   */
  async getByToken(shareToken) {
    const response = await fetch(buildApiUrl(`/api/property-snap/by-token/${shareToken}`), {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch report' }));
      throw new Error(error.error || error.details || 'Failed to fetch report');
    }
    
    return response.json();
  },

  /**
   * Update property status
   */
  async updateStatus(id, status) {
    const response = await apiRequest(`/api/property-snap/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update status' }));
      throw new Error(error.error || error.details || 'Failed to update status');
    }
    
    return response.json();
  },

  /**
   * Upload images
   */
  async uploadImages(formData) {
    const response = await apiRequest('/api/property-snap/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload images' }));
      throw new Error(error.error || error.details || 'Failed to upload images');
    }
    
    return response.json();
  },

  /**
   * Delete images
   */
  async deleteImages(urls) {
    const response = await apiRequest('/api/property-snap/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete images' }));
      throw new Error(error.error || error.details || 'Failed to delete images');
    }
    
    return response.json();
  },

  /**
   * Process images
   */
  async processImages(formData) {
    const response = await apiRequest('/api/property-snap/process-images', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to process images' }));
      throw new Error(error.error || error.details || 'Failed to process images');
    }
    
    return response.json();
  },

  /**
   * Get image metadata
   */
  async getImageMetadata(imageUrl) {
    const params = new URLSearchParams({ url: imageUrl });
    const response = await fetch(buildApiUrl(`/api/property-snap/process-images?${params}`), {
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get image metadata' }));
      throw new Error(error.error || error.details || 'Failed to get image metadata');
    }
    
    return response.json();
  },

  /**
   * Get storage info
   */
  async getStorage() {
    const response = await apiRequest('/api/property-snap/storage', {
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch storage info' }));
      throw new Error(error.error || error.details || 'Failed to fetch storage info');
    }
    
    return response.json();
  },

  /**
   * Get user reports
   */
  async getUserReports() {
    const response = await apiRequest('/api/property-snap/user-reports', {
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch user reports' }));
      throw new Error(error.error || error.details || 'Failed to fetch user reports');
    }
    
    return response.json();
  },

  /**
   * Header Management APIs
   */
  headers: {
    /**
     * Get all headers
     */
    async list() {
      const response = await apiRequest('/api/property-snap/header', {
        method: 'GET',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch headers' }));
        throw new Error(error.error || error.details || 'Failed to fetch headers');
      }
      
      return response.json();
    },

    /**
     * Upload header image
     */
    async upload(formData) {
      const response = await apiRequest('/api/property-snap/header/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to upload header' }));
        throw new Error(error.error || error.details || 'Failed to upload header');
      }
      
      return response.json();
    },

    /**
     * Update header
     */
    async update(id, data) {
      const response = await apiRequest(`/api/property-snap/header/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update header' }));
        throw new Error(error.error || error.details || 'Failed to update header');
      }
      
      return response.json();
    },

    /**
     * Delete header
     */
    async delete(id) {
      const response = await apiRequest(`/api/property-snap/header/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete header' }));
        throw new Error(error.error || error.details || 'Failed to delete header');
      }
      
      return response.json();
    },

    /**
     * Get shared header
     */
    async getShared() {
      const response = await fetch(buildApiUrl('/api/property-snap/header/share'), {
        method: 'GET',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch shared header' }));
        throw new Error(error.error || error.details || 'Failed to fetch shared header');
      }
      
      return response.json();
    },
  },

  /**
   * Cache Config APIs
   */
  cacheConfig: {
    /**
     * Get cache config
     */
    async get() {
      const response = await apiRequest('/api/property-snap/cache-config', {
        method: 'GET',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch cache config' }));
        throw new Error(error.error || error.details || 'Failed to fetch cache config');
      }
      
      return response.json();
    },

    /**
     * Update cache config
     */
    async update(ttlSeconds) {
      const response = await apiRequest('/api/property-snap/cache-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttlSeconds }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update cache config' }));
        throw new Error(error.error || error.details || 'Failed to update cache config');
      }
      
      return response.json();
    },
  },
};

// Export for convenience
export default propertySnapAPI;

