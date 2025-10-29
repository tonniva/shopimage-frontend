import { getCategoryThai, getProvinceThai, getCategoryInfo } from '@/lib/property-mappings';
import PropertySearchClient from './PropertySearchClient';

export async function generateMetadata({ params }) {
  const { category: categorySlug, province: provinceSlug } = params;
  
  // Decode URL-encoded parameters
  const decodedCategorySlug = categorySlug ? decodeURIComponent(categorySlug) : '';
  const decodedProvinceSlug = provinceSlug ? decodeURIComponent(provinceSlug) : '';
  
  // Convert slugs to Thai
  const categoryThai = getCategoryThai(decodedCategorySlug);
  const provinceThai = getProvinceThai(decodedProvinceSlug);
  const categoryInfo = getCategoryInfo(decodedCategorySlug);
  
  const title = `${categoryThai} ใน${provinceThai} | ค้นหาอสังหาริมทรัพย์`;
  const description = `ค้นหา${categoryThai}ในจังหวัด${provinceThai} รายการล่าสุด ราคาโปร่งใส อัปเดตทุกวัน`;
  
  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.xn--s3cnd3b9cte.com';
  
  return {
    title,
    description,
    keywords: [
      categoryThai,
      `${categoryThai}ใน${provinceThai}`,
      `อสังหาริมทรัพย์${provinceThai}`,
      `บ้าน${provinceThai}`,
      `คอนโด${provinceThai}`,
      `ที่ดิน${provinceThai}`,
      `ขายอสังหาฯ${provinceThai}`,
      `ให้เช่าอสังหาฯ${provinceThai}`
    ],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${encodeURIComponent(categoryThai)}/${provinceSlug}`,
      siteName: 'ขายบ้าน.com',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'th_TH',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`]
    },
    alternates: {
      canonical: `${baseUrl}/${encodeURIComponent(categoryThai)}/${provinceSlug}`
    }
  };
}

export default async function PropertySearchPage({ params }) {
  const { category: categorySlug, province: provinceSlug } = params;
  
  // Decode URL-encoded parameters
  const decodedCategorySlug = categorySlug ? decodeURIComponent(categorySlug) : '';
  const decodedProvinceSlug = provinceSlug ? decodeURIComponent(provinceSlug) : '';
  
  // Convert slugs to Thai
  const categoryThai = getCategoryThai(decodedCategorySlug);
  const provinceThai = getProvinceThai(decodedProvinceSlug);
  const categoryInfo = getCategoryInfo(decodedCategorySlug);
  
  return (
    <PropertySearchClient
      categorySlug={categorySlug}
      provinceSlug={provinceSlug}
      decodedCategorySlug={decodedCategorySlug}
      decodedProvinceSlug={decodedProvinceSlug}
      categoryThai={categoryThai}
      provinceThai={provinceThai}
      categoryInfo={categoryInfo}
    />
  );
}
