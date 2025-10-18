# Google OAuth Setup สำหรับ Supabase

## ✅ สิ่งที่ทำเสร็จแล้ว

1. สร้าง LoginModal component พร้อม Google OAuth
2. ปรับปรุง AppHeader แสดง email และ Dashboard button
3. Session จะคงอยู่หลัง refresh (F5)
4. ไม่ redirect ไป /dashboard หลัง login

## 🔧 ขั้นตอนการตั้งค่า Supabase (จำเป็น)

### 1. เปิด Supabase Dashboard
ไปที่: https://app.supabase.com/

### 2. เปิด Google Provider
1. เลือก project ของคุณ
2. ไปที่ **Authentication** > **Providers**
3. เลื่อนหา **Google** และกด **Enable**

### 3. ตั้งค่า Google OAuth Credentials

#### 3.1 สร้าง Google Cloud Project
1. ไปที่: https://console.cloud.google.com/
2. สร้าง project ใหม่หรือเลือก project ที่มีอยู่
3. ไปที่ **APIs & Services** > **Credentials**

#### 3.2 สร้าง OAuth 2.0 Client ID
1. คลิก **Create Credentials** > **OAuth client ID**
2. เลือก **Application type**: Web application
3. ตั้งชื่อ: "Shopimage Frontend"
4. เพิ่ม **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
5. เพิ่ม **Authorized redirect URIs**:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   หา Project Ref ได้จาก Supabase URL ของคุณ
6. คลิก **Create**
7. คัดลอก **Client ID** และ **Client Secret**

#### 3.3 กรอกข้อมูลใน Supabase
1. กลับไปที่ Supabase **Authentication** > **Providers** > **Google**
2. วาง **Client ID** และ **Client Secret**
3. คลิก **Save**

### 4. ตั้งค่า Redirect URL (สำคัญ!)
ใน Supabase Dashboard:
1. ไปที่ **Authentication** > **URL Configuration**
2. เพิ่ม **Redirect URLs**:
   ```
   http://localhost:3000
   http://localhost:3000/
   https://yourdomain.com
   https://yourdomain.com/
   ```

## 🎨 UI Features ที่เพิ่มเข้ามา

### เมื่อยังไม่ Login:
- ปุ่ม **Login** พร้อมไอคอน
- คลิกแล้วขึ้น popup เต็มหน้าจอ
- แสดง Google login button พร้อมโลโก้

### เมื่อ Login แล้ว:
- แสดง **avatar สีสวย** พร้อมตัวอักษรแรกของ email
- แสดง **email** (ซ่อนใน mobile)
- ปุ่ม **Dashboard** สำหรับไปหน้า dashboard
- ปุ่ม **Logout icon** สำหรับออกจากระบบ

### Session Management:
- ✅ Session คงอยู่หลัง F5
- ✅ Auto-refresh token
- ✅ แสดง user ทันที (ไม่ช้า)
- ✅ อยู่หน้าเดิมหลัง login (ไม่ redirect)

## 🧪 ทดสอบการทำงาน

1. เปิดเว็บ: http://localhost:3000
2. คลิกปุ่ม **Login**
3. คลิก **เข้าสู่ระบบด้วย Google**
4. เลือก Google account
5. ระบบจะกลับมาหน้าเดิม
6. จะเห็น email และปุ่ม Dashboard
7. กด F5 -> email ยังคงแสดงอยู่

## 📝 ไฟล์ที่สร้าง/แก้ไข

1. **components/LoginModal.js** - Popup login ด้วย Google
2. **components/AppHeader.js** - แสดง user info, Dashboard button, Logout
3. **utils/supabase/client.js** - มีการตั้งค่า persistSession แล้ว

## 🔒 ความปลอดภัย

- ใช้ OAuth 2.0 มาตรฐาน
- Session เก็บใน localStorage (encrypted)
- Auto refresh token
- PKCE flow สำหรับความปลอดภัย

## ⚠️ หมายเหตุ

1. **ต้องตั้งค่า Google OAuth Credentials ก่อนถึงจะใช้งานได้**
2. สำหรับ production ต้องเพิ่ม domain จริงใน:
   - Google Cloud Console (Authorized origins & redirects)
   - Supabase (Redirect URLs)
3. ตรวจสอบว่า `.env.local` มี:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## 🎉 ใช้งานพร้อมแล้ว!

หลังจากตั้งค่า Google OAuth ตามขั้นตอนข้างต้น ระบบ login จะพร้อมใช้งานทันที

