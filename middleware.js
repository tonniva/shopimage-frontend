import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/utils/supabase/middleware";

export async function middleware(req) {
  // 1) Canonical host redirect (บังคับ www สำหรับโดเมนไทย)
  const url = req.nextUrl.clone();
  const hostname = url.hostname;
  // พิจารณา punycode ของ ย่อรูป.com = xn--s3cnd3b9cte.com
  if (hostname === "xn--s3cnd3b9cte.com") {
    url.hostname = "www.xn--s3cnd3b9cte.com";
    return NextResponse.redirect(url, 308);
  }

  // ต้องสร้าง Response ก่อน เพื่อให้เราส่ง cookies กลับไปได้
  const res = NextResponse.next();

  // ใช้ client ที่ผูกกับ cookies ของ req/res
  const supabase = createMiddlewareSupabaseClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const protectedRoutes = [ "/billing"];
  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));

  // ถ้าจะเข้าเพจที่ป้องกัน แต่ไม่มี user -> ส่งไป login
  if (isProtected && !user) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    // ส่ง redirect ทันที
    return NextResponse.redirect(to);
  }

  // อนุญาตให้ผ่าน พร้อมส่ง cookies ที่อัปเดตกลับไปด้วย
  return res;
}

// ให้ middleware ทำงานเฉพาะ path ที่ต้องการ
export const config = {
  // ใช้กับทุกเส้นทางเพื่อบังคับ canonical host
  matcher: "/:path*",
};