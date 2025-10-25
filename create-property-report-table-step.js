// create-property-report-table-step.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPropertyReportTable() {
  console.log('🔧 Creating PropertyReport table...\n');

  try {
    // Step 1: Create the table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PropertyReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "locationLat" DOUBLE PRECISION NOT NULL,
        "locationLng" DOUBLE PRECISION NOT NULL,
        "address" TEXT,
        "formattedAddress" TEXT,
        "userImages" JSONB NOT NULL DEFAULT '[]',
        "googlePhotos" JSONB,
        "nearbyPlaces" JSONB,
        "streetViewData" JSONB,
        "mapsData" JSONB,
        "aiInsights" JSONB,
        "transportation" JSONB,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "shareCount" INTEGER NOT NULL DEFAULT 0,
        "shareToken" TEXT NOT NULL UNIQUE,
        "isPublic" BOOLEAN NOT NULL DEFAULT true,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    console.log('✅ PropertyReport table created');

    // Step 2: Add foreign key constraint
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "PropertyReport" ADD CONSTRAINT "PropertyReport_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ Foreign key constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        throw error;
      }
    }

    // Step 3: Create indexes
    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PropertyReport_userId_idx" ON "PropertyReport"("userId")
      `);
      console.log('✅ userId index created');
    } catch (error) {
      console.log('⚠️ userId index error:', error.message);
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PropertyReport_shareToken_idx" ON "PropertyReport"("shareToken")
      `);
      console.log('✅ shareToken index created');
    } catch (error) {
      console.log('⚠️ shareToken index error:', error.message);
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PropertyReport_locationLat_locationLng_idx" ON "PropertyReport"("locationLat", "locationLng")
      `);
      console.log('✅ location index created');
    } catch (error) {
      console.log('⚠️ location index error:', error.message);
    }

    // Step 4: Verify table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PropertyReport'
      );
    `;
    console.log('✅ Table verification:', tableExists[0].exists);

    console.log('\n🎉 PropertyReport table created successfully!');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPropertyReportTable();
