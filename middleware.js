import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/utils/supabase/middleware";

export async function middleware(req) {
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
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // ส่ง redirect ทันที
    return NextResponse.redirect(url);
  }

  // อนุญาตให้ผ่าน พร้อมส่ง cookies ที่อัปเดตกลับไปด้วย
  return res;
}

// ให้ middleware ทำงานเฉพาะ path ที่ต้องการ
export const config = {
  matcher: ["/dashboard/:path*", "/billing/:path*"],
};