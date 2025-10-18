# Supabase to Prisma Database Sync

## ปัญหาที่แก้ไข

เดิมคุณใช้ **Supabase Auth** สำหรับการ login แต่ข้อมูล user ไม่ได้ถูกบันทึกลงใน **Prisma database** (PostgreSQL ของคุณ) เพราะ:

1. **Supabase Auth** จัดการ users ใน database ของ Supabase เอง
2. **Prisma database** เป็น database แยกต่างหาก
3. ไม่มี sync mechanism ระหว่างทั้งสอง

## วิธีแก้ไข

สร้าง **Callback API Route** ที่:
1. รับ OAuth redirect จาก Google/Supabase
2. แลก code เป็น session
3. **บันทึกหรืออัปเดต user ใน Prisma database**
4. สร้าง Account record เพื่อเชื่อม Supabase auth กับ Prisma user

## Flow การทำงาน

```
User clicks "Login with Google"
        ↓
    Google OAuth
        ↓
Supabase Auth (creates user in Supabase)
        ↓
Redirect to: /api/auth/callback?code=xxx&returnTo=/
        ↓
Callback Route:
  1. exchangeCodeForSession(code)
  2. Get Supabase user data
  3. Check if user exists in Prisma DB
  4. Create/Update user in Prisma DB
  5. Create/Update Account record
        ↓
Redirect back to original page
        ↓
User is logged in (both Supabase + Prisma)
```

## ไฟล์ที่เกี่ยวข้อง

### 1. `/app/api/auth/callback/route.js` (ใหม่)
Sync Supabase authenticated users ไปยัง Prisma database

**ทำอะไร:**
- รับ OAuth code จาก Supabase
- แลก code เป็น session
- สร้างหรืออัปเดต User record ใน Prisma
- สร้างหรืออัปเดต Account record (OAuth connection)
- Redirect กลับไปหน้าเดิม

### 2. `/components/LoginModal.js` (แก้ไข)
เปลี่ยน `redirectTo` ให้ไปที่ callback route

**Before:**
```javascript
redirectTo: `${window.location.origin}${window.location.pathname}`
```

**After:**
```javascript
redirectTo: `${window.location.origin}/api/auth/callback?returnTo=${currentPath}`
```

### 3. `/components/AuthHeader.js` (แก้ไข)
ลบ auto-reload หลัง login เพราะ callback route จัดการให้แล้ว

## ข้อมูลที่บันทึกใน Prisma

### User Table
```javascript
{
  email: "user@example.com",
  name: "John Doe",
  image: "https://avatar.url",
  emailVerified: new Date(),
  plan: "FREE"
}
```

### Account Table (OAuth connection)
```javascript
{
  userId: "cuid_xxx",
  type: "oauth",
  provider: "google",
  providerAccountId: "supabase_user_id",
  access_token: "...",
  refresh_token: "...",
  expires_at: 1234567890
}
```

## การทดสอบ

1. ลบ user เดิมออกจาก Prisma database (ถ้ามี):
```sql
DELETE FROM "Account" WHERE provider = 'google';
DELETE FROM "User" WHERE email = 'your@email.com';
```

2. Login ด้วย Google อีกครั้ง

3. ตรวจสอบใน database:
```sql
SELECT * FROM "User" WHERE email = 'your@email.com';
SELECT * FROM "Account" WHERE provider = 'google';
```

## ข้อดีของวิธีนี้

✅ **Dual Authentication**: Supabase (fast) + Prisma (relational data)
✅ **Auto Sync**: ทุกครั้งที่ login จะ sync ข้อมูลอัตโนมัติ
✅ **Upsert Logic**: สร้างใหม่หรืออัปเดตตามสถานะ
✅ **Relational Data**: สามารถใช้ Prisma relations (UsageLog, Subscription)
✅ **No Breaking Changes**: ไม่กระทบ code เดิม

## Troubleshooting

### ถ้า user ยังไม่เข้า database:

1. **ตรวจสอบ Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...
```

2. **ตรวจสอบ Console Logs:**
- ใน callback route จะมี log: `✅ Created new user in database`
- ถ้ามี error จะแสดง: `❌ Database error`

3. **ตรวจสอบ Supabase Redirect URL:**
ใน Supabase Dashboard → Authentication → URL Configuration
เพิ่ม: `http://localhost:3000/api/auth/callback`

4. **ตรวจสอบ Prisma Schema:**
```bash
npx prisma generate
npx prisma db push
```

## Next Steps

1. ✅ Login ด้วย Google → user เข้า Prisma DB
2. ✅ ใช้ Prisma relations สำหรับ UsageLog, Subscription
3. ✅ Dashboard สามารถ query ข้อมูลจาก Prisma ได้

## สรุป

ตอนนี้เมื่อ user login ด้วย Google:
1. Supabase Auth จัดการ authentication (fast, secure)
2. Callback route sync ข้อมูลไปยัง Prisma database
3. คุณสามารถใช้ Prisma ORM query ข้อมูล user, usage, subscription ได้แล้ว! 🎉

