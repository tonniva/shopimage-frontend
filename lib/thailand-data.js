// lib/thailand-data.js
// ข้อมูลจังหวัดและภาคของประเทศไทย

export const THAILAND_REGIONS = {
  NORTH: {
    name: 'ภาคเหนือ',
    nameEn: 'Northern Region',
    provinces: [
      'เชียงใหม่', 'เชียงราย', 'ลำปาง', 'ลำพูน', 'แม่ฮ่องสอน', 
      'น่าน', 'พิษณุโลก', 'พิจิตร'
    ]
  },
  CENTRAL: {
    name: 'ภาคกลาง',
    nameEn: 'Central Region', 
    provinces: [
      'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร',
      'สมุทรสงคราม', 'นครปฐม', 'สุพรรณบุรี', 'อ่างทอง', 'ลพบุรี',
      'สระบุรี', 'ชัยนาท', 'อุทัยธานี'
    ]
  },
  EAST: {
    name: 'ภาคตะวันออก',
    nameEn: 'Eastern Region',
    provinces: [
      'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'ปราจีนบุรี', 'สระแก้ว'
    ]
  },
  NORTHEAST: {
    name: 'ภาคตะวันออกเฉียงเหนือ',
    nameEn: 'Northeastern Region',
    provinces: [
      'ขอนแก่น', 'อุดรธานี', 'เลย', 'หนองคาย', 'หนองบัวลำภู', 'บึงกาฬ',
      'สกลนคร', 'นครพนม', 'มุกดาหาร', 'กาฬสินธุ์', 'ร้อยเอ็ด', 'ยโสธร',
      'อำนาจเจริญ', 'ศรีสะเกษ', 'สุรินทร์', 'บุรีรัมย์', 'นครราชสีมา',
      'ชัยภูมิ', 'มหาสารคาม', 'อุบลราชธานี'
    ]
  },
  SOUTH: {
    name: 'ภาคใต้',
    nameEn: 'Southern Region',
    provinces: [
      'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'กระบี่', 'พังงา', 'ภูเก็ต', 'ตรัง',
      'สตูล', 'สงขลา', 'ปัตตานี', 'ยะลา', 'นราธิวาส', 'พัทลุง', 'ชุมพร'
    ]
  },
  WEST: {
    name: 'ภาคตะวันตก',
    nameEn: 'Western Region',
    provinces: [
      'กาญจนบุรี', 'ราชบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์', 'ตาก'
    ]
  }
};

// รายการจังหวัดทั้งหมดเรียงตามตัวอักษร (ลบ duplicates)
export const ALL_PROVINCES = [...new Set(Object.values(THAILAND_REGIONS)
  .flatMap(region => region.provinces))].sort();

// ฟังก์ชันหาภาคจากจังหวัด
export const getRegionByProvince = (province) => {
  for (const [regionKey, regionData] of Object.entries(THAILAND_REGIONS)) {
    if (regionData.provinces.includes(province)) {
      return {
        key: regionKey,
        name: regionData.name,
        nameEn: regionData.nameEn
      };
    }
  }
  return null;
};

// ฟังก์ชันดึงรายการจังหวัดตามภาค
export const getProvincesByRegion = (regionKey) => {
  return THAILAND_REGIONS[regionKey]?.provinces || [];
};

// ฟังก์ชันดึงข้อมูลภาคทั้งหมด
export const getAllRegions = () => {
  return Object.entries(THAILAND_REGIONS).map(([key, data]) => ({
    key,
    name: data.name,
    nameEn: data.nameEn,
    provinceCount: data.provinces.length
  }));
};
