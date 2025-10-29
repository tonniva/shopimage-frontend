// lib/property-mappings.js
// Mapping between Thai categories and English slugs for SEO URLs

export const CATEGORIES = {
  // ขาย
  'ขายบ้าน': {
    slug: 'sell-house',
    listingType: 'sale',
    propertyType: 'house',
    icon: '🏠'
  },
  'ขายคอนโด': {
    slug: 'sell-condo',
    listingType: 'sale',
    propertyType: 'condo',
    icon: '🏢'
  },
  'ขายทาวน์เฮาส์': {
    slug: 'sell-townhouse',
    listingType: 'sale',
    propertyType: 'townhouse',
    icon: '🏡'
  },
  'ขายที่ดิน': {
    slug: 'sell-land',
    listingType: 'sale',
    propertyType: 'land',
    icon: '🏞️'
  },
  'ขายอาคารพาณิชย์': {
    slug: 'sell-commercial',
    listingType: 'sale',
    propertyType: 'commercial',
    icon: '🏪'
  },
  'ขายโรงงาน': {
    slug: 'sell-factory',
    listingType: 'sale',
    propertyType: 'factory',
    icon: '🏭'
  },
  
  // เช่า
  'ให้เช่าบ้าน': {
    slug: 'rent-house',
    listingType: 'rent',
    propertyType: 'house',
    icon: '🏠'
  },
  'ให้เช่าคอนโด': {
    slug: 'rent-condo',
    listingType: 'rent',
    propertyType: 'condo',
    icon: '🏢'
  },
  'ให้เช่าทาวน์เฮาส์': {
    slug: 'rent-townhouse',
    listingType: 'rent',
    propertyType: 'townhouse',
    icon: '🏡'
  },
  'ให้เช่าที่ดิน': {
    slug: 'rent-land',
    listingType: 'rent',
    propertyType: 'land',
    icon: '🏞️'
  },
  'ให้เช่าอาคารพาณิชย์': {
    slug: 'rent-commercial',
    listingType: 'rent',
    propertyType: 'commercial',
    icon: '🏪'
  },
  'ให้เช่าห้องพัก': {
    slug: 'rent-room',
    listingType: 'rent',
    propertyType: 'room',
    icon: '🛏️'
  }
};

// Reverse mapping: slug → Thai
export const CATEGORY_SLUGS_TO_THAI = Object.fromEntries(
  Object.entries(CATEGORIES).map(([thai, data]) => [data.slug, thai])
);

// Province slug mapping
export const PROVINCE_SLUGS = {
  'กรุงเทพ': 'bangkok',
  'กระบี่': 'krabi',
  'กาญจนบุรี': 'kanchanaburi',
  'กาฬสินธุ์': 'kalasin',
  'กำแพงเพชร': 'kamphaeng-phet',
  'ขอนแก่น': 'khon-kaen',
  'จันทบุรี': 'chanthaburi',
  'ฉะเชิงเทรา': 'chachoengsao',
  'ชลบุรี': 'chonburi',
  'ชัยนาท': 'chainat',
  'ชัยภูมิ': 'chaiyaphum',
  'ชุมพร': 'chumphon',
  'เชียงราย': 'chiang-rai',
  'เชียงใหม่': 'chiang-mai',
  'ตรัง': 'trang',
  'ตราด': 'trat',
  'ตาก': 'tak',
  'นครนายก': 'nakhon-nayok',
  'นครปฐม': 'nakhon-pathom',
  'นครพนม': 'nakhon-phanom',
  'นครราชสีมา': 'nakhon-ratchasima',
  'นครศรีธรรมราช': 'nakhon-si-thammarat',
  'นครสวรรค์': 'nakhon-sawan',
  'นนทบุรี': 'nonthaburi',
  'นราธิวาส': 'narathiwat',
  'น่าน': 'nan',
  'บึงกาฬ': 'bueng-kan',
  'บุรีรัมย์': 'buriram',
  'ปทุมธานี': 'pathum-thani',
  'ประจวบคีรีขันธ์': 'prachuap-khiri-khan',
  'ปราจีนบุรี': 'prachinburi',
  'ปัตตานี': 'pattani',
  'พระนครศรีอยุธยา': 'phra-nakhon-si-ayutthaya',
  'พังงา': 'phang-nga',
  'พัทลุง': 'phatthalung',
  'พิจิตร': 'phichit',
  'พิษณุโลก': 'phitsanulok',
  'เพชรบุรี': 'phetchaburi',
  'เพชรบูรณ์': 'phetchabun',
  'แพร่': 'phrae',
  'ภูเก็ต': 'phuket',
  'มหาสารคาม': 'maha-sarakham',
  'มุกดาหาร': 'mukdahan',
  'แม่ฮ่องสอน': 'mae-hong-son',
  'ยะลา': 'yala',
  'ยโสธร': 'yasothon',
  'ระนอง': 'ranong',
  'ระยอง': 'rayong',
  'ราชบุรี': 'ratchaburi',
  'ลพบุรี': 'lopburi',
  'ลำปาง': 'lampang',
  'ลำพูน': 'lamphun',
  'เลย': 'loei',
  'ศรีสะเกษ': 'sisaket',
  'สกลนคร': 'sakon-nakhon',
  'สงขลา': 'songkhla',
  'สตูล': 'satun',
  'สมุทรปราการ': 'samut-prakan',
  'สมุทรสงคราม': 'samut-songkhram',
  'สมุทรสาคร': 'samut-sakhon',
  'สระแก้ว': 'sa-kaeo',
  'สระบุรี': 'saraburi',
  'สิงห์บุรี': 'singburi',
  'สุโขทัย': 'sukhothai',
  'สุพรรณบุรี': 'suphan-buri',
  'สุราษฎร์ธานี': 'surat-thani',
  'สุรินทร์': 'surin',
  'หนองคาย': 'nong-khai',
  'หนองบัวลำภู': 'nong-bua-lamphu',
  'อ่างทอง': 'ang-thong',
  'อำนาจเจริญ': 'amnat-charoen',
  'อุดรธานี': 'udon-thani',
  'อุตรดิตถ์': 'uttaradit',
  'อุทัยธานี': 'uthai-thani',
  'อุบลราชธานี': 'ubon-ratchathani'
};

// Reverse: slug → Thai province
export const PROVINCE_SLUGS_TO_THAI = Object.fromEntries(
  Object.entries(PROVINCE_SLUGS).map(([thai, slug]) => [slug, thai])
);

// Helper functions
export function getCategorySlug(categoryThai) {
  return CATEGORIES[categoryThai]?.slug || '';
}

export function getCategoryThai(categorySlug) {
  return CATEGORY_SLUGS_TO_THAI[categorySlug] || categorySlug;
}

export function getProvinceSlug(provinceThai) {
  return PROVINCE_SLUGS[provinceThai] || provinceThai.toLowerCase().replace(/\s+/g, '-');
}

export function getProvinceThai(provinceSlug) {
  return PROVINCE_SLUGS_TO_THAI[provinceSlug] || provinceSlug;
}

// Get category info by slug
export function getCategoryInfo(categorySlug) {
  const categoryThai = CATEGORY_SLUGS_TO_THAI[categorySlug];
  return CATEGORIES[categoryThai];
}

// Auto-generate category from listingType + propertyType
export function generateCategory(listingType, propertyType) {
  const typeMap = {
    'house': 'บ้าน',
    'condo': 'คอนโด',
    'townhouse': 'ทาวน์เฮาส์',
    'land': 'ที่ดิน',
    'commercial': 'อาคารพาณิชย์',
    'factory': 'โรงงาน',
    'room': 'ห้องพัก'
  };
  
  const listingMap = {
    'sale': 'ขาย',
    'rent': 'ให้เช่า'
  };
  
  const typeThai = typeMap[propertyType] || propertyType;
  const listingThai = listingMap[listingType] || '';
  
  return `${listingThai}${typeThai}`;
}

