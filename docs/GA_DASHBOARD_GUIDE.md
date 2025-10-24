# Google Analytics Dashboard Guide

## 📊 Overview
This guide shows how to set up and interpret Google Analytics data for all features in the project.

## 🎯 Event Categories

### 1. **Feature Tracking**
All events are categorized by feature for easy identification:

| Feature | Event Category | Description |
|---------|----------------|-------------|
| IMG_TO_WEBP | Feature: IMG_TO_WEBP | Image to WebP converter |
| PDF_CONVERTER | Feature: PDF_CONVERTER | PDF to Image converter |
| REMOVE_BACKGROUND | Feature: REMOVE_BACKGROUND | Background removal tool |
| PET_TAG_MAKER | Feature: PET_TAG_MAKER | Pet tag creation tool |
| ADD_QR_TO_IMAGE | Feature: QR_LOGO_ADDER | QR code adder |
| ADD_LOGO_TO_IMAGE | Feature: QR_LOGO_ADDER | Logo adder |
| GIF_MAKER | Feature: GIF_MAKER | GIF creation tool |
| PDF_MERGER | Feature: PDF_MERGER | PDF merger tool |
| MICA_MAGNETIC_PHOTOS | Feature: MICA_MAGNETIC_PHOTOS | Mica photos service |
| PET_TO_PILLOW | Feature: PET_TO_PILLOW | Pet pillow service |

## 📈 Key Events to Track

### **Conversion Funnel**
1. **File Upload** → `file_upload`
2. **Processing Start** → `conversion_start` / `bg_removal_start` / `gif_create`
3. **Success** → `conversion_success` / `bg_removal_success` / `gif_success`
4. **Download** → `download`

### **E-commerce Events**
1. **Checkout Start** → `checkout_start`
2. **Order Success** → `order_success`

### **User Engagement**
1. **Button Clicks** → `button_click`
2. **Preset Selection** → `preset_selected`
3. **Page Views** → `page_view`

## 🔍 Google Analytics Setup

### **Custom Dimensions**
Set up these custom dimensions in GA4:

1. **Page Source** (`page_source`)
   - Maps to readable feature names
   - Values: IMG_TO_WEBP, PDF_CONVERTER, etc.

2. **Feature** (`feature`)
   - Same as page_source for consistency

### **Custom Events**
All events include these parameters:
- `event_category`: Feature category
- `event_label`: Detailed action description
- `value`: Numeric value (file count, success rate, etc.)
- `page_source`: Which feature generated the event

## 📊 Dashboard Views

### **1. Feature Performance Dashboard**
```
Primary Dimension: Event Category
Secondary Dimension: Event Label
Metric: Event Count
Filter: Event Category contains "Feature:"
```

### **2. Conversion Funnel Dashboard**
```
Step 1: file_upload events
Step 2: conversion_start events  
Step 3: conversion_success events
Step 4: download events
```

### **3. User Journey Dashboard**
```
Primary Dimension: Page Source
Secondary Dimension: Event Label
Metric: Users, Sessions, Events
```

## 📋 Event Labels Reference

### **IMG_TO_WEBP**
- `count_X` - File upload count
- `files_X` - Conversion start
- `success_X_total_Y` - Conversion success
- `zip_all`, `single` - Download types

### **PDF_CONVERTER**
- `pdf_count_X` - PDF upload count
- `single_X`, `all_X` - Conversion mode
- `success_X_total_Y` - Conversion success
- `zip_all`, `single` - Download types

### **REMOVE_BACKGROUND**
- `bg_remove_X` - File upload count
- `ai_X`, `manual_X` - Processing type
- `success_X_total_Y` - Processing success
- `zip_all`, `single` - Download types

### **PET_TAG_MAKER**
- `pet_tag_X` - File upload count
- `tag_customize` - Customization events
- `tag_generate` - Generation events
- `zip_all`, `single` - Download types

### **QR_LOGO_ADDER**
- `qr_logo_X` - File upload count
- `qr_add`, `logo_add` - Addition events
- `processing_start` - Processing start
- `zip_all`, `single` - Download types

### **GIF_MAKER**
- `gif_X` - File upload count
- `gif_create` - Creation events
- `gif_success` - Success events
- `zip_all`, `single` - Download types

### **PDF_MERGER**
- `pdf_merge_X` - File upload count
- `pdf_merge` - Merge events
- `merge_success` - Success events
- `zip_all`, `single` - Download types

### **MICA_MAGNETIC_PHOTOS**
- `mica_X` - File upload count
- `ai_X`, `manual_X` - Processing type
- `checkout_start` - Checkout events
- `order_success` - Order completion

### **PET_TO_PILLOW**
- `pillow_X` - File upload count
- `pillow_customize` - Customization events
- `checkout_start` - Checkout events
- `order_success` - Order completion

## 🎯 Conversion Goals

### **Primary Goals**
1. **File Processing Success Rate**
   - Event: `conversion_success`
   - Target: >90% success rate

2. **Download Completion**
   - Event: `download`
   - Target: >80% of successful conversions

3. **E-commerce Conversion**
   - Event: `order_success`
   - Target: >5% of checkout starts

### **Secondary Goals**
1. **Feature Adoption**
   - Track which features are most used
   - Identify underutilized features

2. **User Engagement**
   - Track button clicks and interactions
   - Measure user session depth

## 📊 Sample Queries

### **Most Popular Features**
```
Event Category: Feature:*
Group by: Event Category
Metric: Event Count
Sort: Descending
```

### **Conversion Rates by Feature**
```
Event: conversion_start, conversion_success
Group by: Event Category
Calculate: Success Rate = success/start * 100
```

### **User Journey Analysis**
```
Primary: Page Source
Secondary: Event Label
Metric: Users, Sessions, Events
Filter: Last 30 days
```

## 🔧 Implementation Notes

### **Event Naming Convention**
- **Feature**: `FEATURE_NAME`
- **Action**: `action_type`
- **Label**: `detail_info`
- **Value**: `numeric_value`

### **Error Tracking**
- All error events include error message in label
- Failed conversions tracked separately
- User feedback events for debugging

### **Performance Tracking**
- File count in value parameter
- Processing time in custom parameters
- Success rates calculated from event ratios

## 📱 Mobile vs Desktop
Events automatically include device information from GA4's built-in dimensions.

## 🌍 Language Tracking
Events include language information:
- Thai pages: No suffix
- English pages: `_EN` suffix

## 🎉 Success Metrics
Track these KPIs:
1. **Feature Usage**: Events per feature
2. **Conversion Rate**: Success/Start ratio
3. **User Retention**: Return visits
4. **Revenue**: E-commerce events
5. **Performance**: Processing success rates
