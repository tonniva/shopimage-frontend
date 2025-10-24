// Google Analytics utility functions
// Usage: gtag('event', 'action', { event_category: 'category', event_label: 'label', value: 1 });

/**
 * Track button clicks and important events
 */
export const trackEvent = (action, category = 'User Interaction', label = '', value = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_map: {
        'page_source': getPageSource()
      }
    });
  }
};

/**
 * Get current page source for tracking
 */
const getPageSource = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  const path = window.location.pathname;
  
  // Map paths to readable names
  const pageMap = {
    '/': 'IMG_TO_WEBP',
    '/en': 'IMG_TO_WEBP_EN',
    '/pdf-converter': 'PDF_CONVERTER',
    '/en/pdf-converter': 'PDF_CONVERTER_EN',
    '/remove-background': 'REMOVE_BACKGROUND',
    '/en/remove-background': 'REMOVE_BACKGROUND_EN',
    '/pet-tag-maker': 'PET_TAG_MAKER',
    '/en/pet-tag-maker': 'PET_TAG_MAKER_EN',
    '/add-qr-to-image': 'ADD_QR_TO_IMAGE',
    '/en/add-qr-to-image': 'ADD_QR_TO_IMAGE_EN',
    '/add-logo-to-image': 'ADD_LOGO_TO_IMAGE',
    '/en/add-logo-to-image': 'ADD_LOGO_TO_IMAGE_EN',
    '/gif-maker': 'GIF_MAKER',
    '/en/gif-maker': 'GIF_MAKER_EN',
    '/pdf-merger': 'PDF_MERGER',
    '/en/pdf-merger': 'PDF_MERGER_EN',
    '/mica-magnetic-photos': 'MICA_MAGNETIC_PHOTOS',
    '/en/mica-magnetic-photos': 'MICA_MAGNETIC_PHOTOS_EN',
    '/pet-to-pillow': 'PET_TO_PILLOW',
    '/en/pet-to-pillow': 'PET_TO_PILLOW_EN',
    '/checkout': 'CHECKOUT',
    '/en/checkout': 'CHECKOUT_EN',
    '/order-success': 'ORDER_SUCCESS',
    '/en/order-success': 'ORDER_SUCCESS_EN'
  };
  
  return pageMap[path] || 'UNKNOWN_PAGE';
};

/**
 * Track conversion events
 */
export const trackConversion = (action, details = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'Conversion',
      ...details
    });
  }
};

/**
 * Track file upload events
 */
export const trackFileUpload = (fileCount, fileTypes = []) => {
  trackEvent('file_upload', 'File Management', `count_${fileCount}`, fileCount);
  
  if (fileTypes.length > 0) {
    trackEvent('file_types', 'File Management', fileTypes.join(','), fileTypes.length);
  }
};

/**
 * Track preset selection
 */
export const trackPresetSelection = (presetName, presetConfig) => {
  trackEvent('preset_selected', 'Settings', presetName, 1);
  
  // Track preset details
  trackEvent('preset_config', 'Settings', `${presetConfig.w}x${presetConfig.h}_${presetConfig.max_kb}kb`, 1);
};

/**
 * Track conversion start
 */
export const trackConversionStart = (fileCount, settings) => {
  trackEvent('conversion_start', 'Conversion', `files_${fileCount}`, fileCount);
  
  // Track settings used
  trackEvent('conversion_settings', 'Conversion', 
    `${settings.format}_${settings.target_w || 'auto'}x${settings.target_h || 'auto'}_${settings.max_kb}kb`, 
    1
  );
};

/**
 * Track conversion success
 */
export const trackConversionSuccess = (fileCount, successCount, settings) => {
  trackEvent('conversion_success', 'Conversion', `success_${successCount}_total_${fileCount}`, successCount);
  
  // Track success rate
  const successRate = (successCount / fileCount) * 100;
  trackEvent('conversion_rate', 'Conversion', `${Math.round(successRate)}%`, successRate);
};

/**
 * Track conversion failure
 */
export const trackConversionFailure = (fileCount, errorMessage) => {
  trackEvent('conversion_failure', 'Conversion', errorMessage, fileCount);
};

/**
 * Track download events
 */
export const trackDownload = (type, fileCount = 1) => {
  trackEvent('download', 'File Management', type, fileCount);
};

/**
 * Track user engagement
 */
export const trackEngagement = (action, details = {}) => {
  trackEvent(action, 'Engagement', details.label || '', details.value || 1);
};

/**
 * Track page views with feature identification
 */
export const trackPageView = (pageName, feature = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      custom_map: {
        'page_source': getPageSource(),
        'feature': feature || getPageSource()
      }
    });
  }
};

/**
 * Track feature-specific events
 */
export const trackFeatureEvent = (feature, action, details = {}) => {
  trackEvent(action, `Feature: ${feature}`, details.label || '', details.value || 1);
};

// Feature-specific tracking functions
export const trackImageConverter = {
  upload: (fileCount, fileTypes) => trackFeatureEvent('IMG_TO_WEBP', 'file_upload', { label: `count_${fileCount}`, value: fileCount }),
  convert: (fileCount, settings) => trackFeatureEvent('IMG_TO_WEBP', 'conversion_start', { label: `files_${fileCount}`, value: fileCount }),
  success: (successCount, totalCount) => trackFeatureEvent('IMG_TO_WEBP', 'conversion_success', { label: `success_${successCount}_total_${totalCount}`, value: successCount }),
  download: (type, fileCount) => trackFeatureEvent('IMG_TO_WEBP', 'download', { label: type, value: fileCount })
};

export const trackPdfConverter = {
  upload: (fileCount) => trackFeatureEvent('PDF_CONVERTER', 'file_upload', { label: `pdf_count_${fileCount}`, value: fileCount }),
  convert: (mode, fileCount) => trackFeatureEvent('PDF_CONVERTER', 'conversion_start', { label: `${mode}_${fileCount}`, value: fileCount }),
  success: (successCount, totalCount) => trackFeatureEvent('PDF_CONVERTER', 'conversion_success', { label: `success_${successCount}_total_${totalCount}`, value: successCount }),
  download: (type, fileCount) => trackFeatureEvent('PDF_CONVERTER', 'download', { label: type, value: fileCount })
};

export const trackRemoveBackground = {
  upload: (fileCount) => trackFeatureEvent('REMOVE_BACKGROUND', 'file_upload', { label: `bg_remove_${fileCount}`, value: fileCount }),
  process: (fileCount, useAI) => trackFeatureEvent('REMOVE_BACKGROUND', 'bg_removal_start', { label: `${useAI ? 'ai' : 'manual'}_${fileCount}`, value: fileCount }),
  success: (successCount, totalCount) => trackFeatureEvent('REMOVE_BACKGROUND', 'bg_removal_success', { label: `success_${successCount}_total_${totalCount}`, value: successCount }),
  download: (type, fileCount) => trackFeatureEvent('REMOVE_BACKGROUND', 'download', { label: type, value: fileCount })
};

export const trackPetTagMaker = {
  upload: (fileCount) => trackFeatureEvent('PET_TAG_MAKER', 'file_upload', { label: `pet_tag_${fileCount}`, value: fileCount }),
  customize: (tagType, customization) => trackFeatureEvent('PET_TAG_MAKER', 'tag_customize', { label: `${tagType}_${customization}`, value: 1 }),
  generate: (tagCount) => trackFeatureEvent('PET_TAG_MAKER', 'tag_generate', { label: `count_${tagCount}`, value: tagCount }),
  download: (type, fileCount) => trackFeatureEvent('PET_TAG_MAKER', 'download', { label: type, value: fileCount })
};

export const trackQrLogoAdder = {
  upload: (fileCount) => trackFeatureEvent('QR_LOGO_ADDER', 'file_upload', { label: `qr_logo_${fileCount}`, value: fileCount }),
  addQr: (qrType, position) => trackFeatureEvent('QR_LOGO_ADDER', 'qr_add', { label: `${qrType}_${position}`, value: 1 }),
  addLogo: (logoType, position) => trackFeatureEvent('QR_LOGO_ADDER', 'logo_add', { label: `${logoType}_${position}`, value: 1 }),
  process: (fileCount) => trackFeatureEvent('QR_LOGO_ADDER', 'processing_start', { label: `files_${fileCount}`, value: fileCount }),
  download: (type, fileCount) => trackFeatureEvent('QR_LOGO_ADDER', 'download', { label: type, value: fileCount })
};

export const trackGifMaker = {
  upload: (fileCount) => trackFeatureEvent('GIF_MAKER', 'file_upload', { label: `gif_${fileCount}`, value: fileCount }),
  create: (settings) => trackFeatureEvent('GIF_MAKER', 'gif_create', { label: `${settings.duration}_${settings.loop}`, value: 1 }),
  success: (gifCount) => trackFeatureEvent('GIF_MAKER', 'gif_success', { label: `count_${gifCount}`, value: gifCount }),
  download: (type, fileCount) => trackFeatureEvent('GIF_MAKER', 'download', { label: type, value: fileCount })
};

export const trackPdfMerger = {
  upload: (fileCount) => trackFeatureEvent('PDF_MERGER', 'file_upload', { label: `pdf_merge_${fileCount}`, value: fileCount }),
  merge: (fileCount, order) => trackFeatureEvent('PDF_MERGER', 'pdf_merge', { label: `${fileCount}_${order}`, value: fileCount }),
  success: (mergedCount) => trackFeatureEvent('PDF_MERGER', 'merge_success', { label: `count_${mergedCount}`, value: mergedCount }),
  download: (type, fileCount) => trackFeatureEvent('PDF_MERGER', 'download', { label: type, value: fileCount })
};

export const trackMicaPhotos = {
  upload: (fileCount) => trackFeatureEvent('MICA_MAGNETIC_PHOTOS', 'file_upload', { label: `mica_${fileCount}`, value: fileCount }),
  process: (fileCount, useAI) => trackFeatureEvent('MICA_MAGNETIC_PHOTOS', 'mica_process', { label: `${useAI ? 'ai' : 'manual'}_${fileCount}`, value: fileCount }),
  checkout: (fileCount, totalPrice) => trackFeatureEvent('MICA_MAGNETIC_PHOTOS', 'checkout_start', { label: `files_${fileCount}_price_${totalPrice}`, value: totalPrice }),
  success: (orderId) => trackFeatureEvent('MICA_MAGNETIC_PHOTOS', 'order_success', { label: orderId, value: 1 })
};

export const trackPetPillow = {
  upload: (fileCount) => trackFeatureEvent('PET_TO_PILLOW', 'file_upload', { label: `pillow_${fileCount}`, value: fileCount }),
  customize: (pillowType, size) => trackFeatureEvent('PET_TO_PILLOW', 'pillow_customize', { label: `${pillowType}_${size}`, value: 1 }),
  checkout: (fileCount, totalPrice) => trackFeatureEvent('PET_TO_PILLOW', 'checkout_start', { label: `files_${fileCount}_price_${totalPrice}`, value: totalPrice }),
  success: (orderId) => trackFeatureEvent('PET_TO_PILLOW', 'order_success', { label: orderId, value: 1 })
};

// Common event constants
export const EVENTS = {
  BUTTON_CLICK: 'button_click',
  FILE_UPLOAD: 'file_upload',
  PRESET_SELECT: 'preset_selected',
  CONVERSION_START: 'conversion_start',
  CONVERSION_SUCCESS: 'conversion_success',
  CONVERSION_FAILURE: 'conversion_failure',
  DOWNLOAD: 'download',
  PAGE_VIEW: 'page_view',
  ENGAGEMENT: 'engagement',
  FEATURE_USE: 'feature_use',
  CHECKOUT_START: 'checkout_start',
  ORDER_SUCCESS: 'order_success'
};

export const CATEGORIES = {
  USER_INTERACTION: 'User Interaction',
  FILE_MANAGEMENT: 'File Management',
  CONVERSION: 'Conversion',
  SETTINGS: 'Settings',
  ENGAGEMENT: 'Engagement',
  FEATURE: 'Feature',
  ECOMMERCE: 'E-commerce'
};
