// scripts/update-existing-data.js
// Script to update existing property reports with category and slug data

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Category mapping from propertyType + listingType to category
const categoryMapping = {
  'house-sale': 'ขายบ้าน',
  'condo-sale': 'ขายคอนโด',
  'land-sale': 'ขายที่ดิน',
  'commercial-sale': 'ขายอาคารพาณิชย์',
  'house-rent': 'ให้เช่าบ้าน',
  'condo-rent': 'ให้เช่าคอนโด',
  'land-rent': 'ให้เช่าที่ดิน',
  'commercial-rent': 'ให้เช่าอาคารพาณิชย์'
};

// Province slug mapping
const provinceSlugMapping = {
  'อ่างทอง': 'ang-thong',
  'กรุงเทพ': 'bangkok',
  'เชียงใหม่': 'chiang-mai',
  'เชียงราย': 'chiang-rai',
  'นนทบุรี': 'nonthaburi',
  'ปทุมธานี': 'pathum-thani',
  'สมุทรปราการ': 'samut-prakan',
  'ชลบุรี': 'chonburi',
  'ระยอง': 'rayong',
  'ขอนแก่น': 'khon-kaen',
  'อุดรธานี': 'udon-thani',
  'นครราชสีมา': 'nakhon-ratchasima',
  'อุบลราชธานี': 'ubon-ratchathani',
  'ภูเก็ต': 'phuket',
  'สุราษฎร์ธานี': 'surat-thani',
  'นครศรีธรรมราช': 'nakhon-si-thammarat'
};

async function updateExistingData() {
  try {
    console.log('🔄 Starting to update existing property reports...');
    
    // Get all existing reports
    const reports = await prisma.propertyReport.findMany({
      where: {
        OR: [
          { category: null },
          { categorySlug: null },
          { provinceSlug: null }
        ]
      }
    });
    
    console.log(`📊 Found ${reports.length} reports to update`);
    
    let updatedCount = 0;
    
    for (const report of reports) {
      const updates = {};
      
      // Generate category from propertyType + listingType
      if (!report.category && report.propertyType && report.listingType) {
        const key = `${report.propertyType}-${report.listingType}`;
        const category = categoryMapping[key];
        if (category) {
          updates.category = category;
          updates.categorySlug = getCategorySlug(category);
        }
      }
      
      // Generate province slug
      if (!report.provinceSlug && report.province) {
        updates.provinceSlug = provinceSlugMapping[report.province] || 
          report.province.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        await prisma.propertyReport.update({
          where: { id: report.id },
          data: updates
        });
        
        updatedCount++;
        console.log(`✅ Updated report ${report.id}:`, updates);
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} reports`);
    
    // Show some sample data
    const sampleReports = await prisma.propertyReport.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        categorySlug: true,
        province: true,
        provinceSlug: true,
        propertyType: true,
        listingType: true
      }
    });
    
    console.log('\n📋 Sample updated data:');
    sampleReports.forEach(report => {
      console.log(`- ${report.title}: ${report.category} (${report.categorySlug}) in ${report.province} (${report.provinceSlug})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCategorySlug(category) {
  const slugMapping = {
    'ขายบ้าน': 'sell-house',
    'ขายคอนโด': 'sell-condo',
    'ขายที่ดิน': 'sell-land',
    'ขายอาคารพาณิชย์': 'sell-commercial',
    'ให้เช่าบ้าน': 'rent-house',
    'ให้เช่าคอนโด': 'rent-condo',
    'ให้เช่าที่ดิน': 'rent-land',
    'ให้เช่าอาคารพาณิชย์': 'rent-commercial'
  };
  return slugMapping[category] || '';
}

// Run the update
updateExistingData();
