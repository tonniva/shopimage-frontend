# Usage Logging Fix - Dashboard แสดง 0

## ปัญหาที่พบ

Dashboard แสดง **Today: 0** แม้จะ convert รูปแล้ว เพราะ:

1. ❌ `lib/usage.js` บันทึกไปที่ **Supabase table** (`usage_log`)
2. ❌ Dashboard query จาก **Supabase table** 
3. ❌ แต่ Prisma schema ใช้ table `UsageLog` (database แยกต่างหาก)
4. ❌ ข้อมูลไม่ sync กัน

## วิธีแก้ไข

เปลี่ยนให้ทุกอย่างใช้ **Prisma database** เดียวกัน:

### 1. แก้ไข `lib/usage.js`
**Before:** บันทึกไปที่ Supabase table
```javascript
await supabase.from("usage_log").insert({...});
```

**After:** เรียก API route ที่บันทึกไปยัง Prisma
```javascript
await fetch("/api/usage/log", {
  method: "POST",
  body: JSON.stringify({ email, count: 1, bytes })
});
```

### 2. แก้ไข `/app/api/usage/log/route.js`
**Before:** ใช้ NextAuth session
```javascript
const session = await getServerSession(authOptions);
```

**After:** ใช้ Supabase auth + หา user จาก email
```javascript
const supabase = createServerSupabase();
const { data: { user } } = await supabase.auth.getUser();
const prismaUser = await prisma.user.findUnique({ where: { email } });
await prisma.usageLog.create({ data: { userId: prismaUser.id, ... }});
```

### 3. สร้าง `/app/api/usage/stats/route.js` (ใหม่)
Query stats จาก Prisma database:
- Today count
- Month count  
- User plan
- Quotas

### 4. แก้ไข `/app/dashboard/page.js`
**Before:** Query Supabase table โดยตรง
```javascript
const { count } = await supabase.from("usage_log").select(...)
```

**After:** เรียก API route
```javascript
const response = await fetch("/api/usage/stats");
const { stats } = await response.json();
```

## Flow การทำงานใหม่

```
User converts image
       ↓
await logUsageOnce()
       ↓
POST /api/usage/log
       ↓
1. Verify Supabase auth
2. Find user by email in Prisma
3. Create UsageLog in Prisma ✅
       ↓
Dashboard loads
       ↓
GET /api/usage/stats
       ↓
1. Verify Supabase auth
2. Find user by email in Prisma
3. Query UsageLog from Prisma ✅
4. Return today/month counts
       ↓
Display in Dashboard ✅
```

## การทดสอบ

### 1. ตรวจสอบว่า user มีในฐานข้อมูลหรือยัง:
```sql
SELECT * FROM "User" WHERE email = 'your@email.com';
```

ถ้ายังไม่มี → ต้อง login ด้วย Google ก่อน (จะสร้าง user ผ่าน callback route)

### 2. ทดสอบ convert image:
```javascript
// เปิด Console (F12) ดู logs:
"✅ Usage logged successfully"  // จาก lib/usage.js
"✅ Usage logged: user@email.com - 1 conversions" // จาก API route
```

### 3. ตรวจสอบใน database:
```sql
SELECT * FROM "UsageLog" WHERE "userId" = 'your-user-id';
```

### 4. ตรวจสอบ Dashboard:
```javascript
// เปิด Console (F12) ดู logs:
"✅ Loaded usage stats from Prisma database"
```

## Troubleshooting

### ❌ Error: USER_NOT_FOUND

**สาเหตุ:** User ยังไม่มีใน Prisma database

**แก้ไข:**
1. Logout
2. Login ด้วย Google อีกครั้ง
3. Callback route จะสร้าง user ใน Prisma

### ❌ Dashboard ยังแสดง 0

**ตรวจสอบ:**

1. **Console logs มี error หรือไม่:**
```javascript
// F12 → Console → ดู logs
```

2. **ตรวจสอบ API response:**
```javascript
// F12 → Network → ดู /api/usage/log และ /api/usage/stats
```

3. **ตรวจสอบ database โดยตรง:**
```sql
-- Check if user exists
SELECT * FROM "User" WHERE email = 'your@email.com';

-- Check usage logs
SELECT ul.*, u.email 
FROM "UsageLog" ul
JOIN "User" u ON ul."userId" = u.id
WHERE u.email = 'your@email.com';
```

### ❌ Error: UNAUTHORIZED

**สาเหตุ:** ไม่ได้ login หรือ session หมดอายุ

**แก้ไข:**
1. Logout
2. Login ใหม่

## สรุป

ตอนนี้ระบบทำงานแบบนี้:

✅ **Login** → User บันทึกลง Prisma (via `/api/auth/callback`)

✅ **Convert** → Usage บันทึกลง Prisma (via `/api/usage/log`)

✅ **Dashboard** → Query จาก Prisma (via `/api/usage/stats`)

✅ **ทุกอย่างใช้ Prisma database เดียวกัน**

## Next Steps

1. ✅ Login ด้วย Google ใหม่ (ถ้ายังไม่มี user ใน Prisma)
2. ✅ Convert image 1-2 รูป
3. ✅ เช็ค Console logs ว่า usage logged สำเร็จ
4. ✅ Refresh Dashboard → ควรแสดงจำนวนที่ถูกต้อง

**ตอนนี้ Dashboard จะแสดงข้อมูลที่ถูกต้องแล้ว!** 🎉

