// create-property-report-table-simple.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPropertyReportTable() {
  console.log('🔧 Creating PropertyReport table...\n');

  try {
    // Create the PropertyReport table with all constraints in one query
    const createTableSQL = `
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
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PropertyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS "PropertyReport_userId_idx" ON "PropertyReport"("userId");
      CREATE INDEX IF NOT EXISTS "PropertyReport_shareToken_idx" ON "PropertyReport"("shareToken");
      CREATE INDEX IF NOT EXISTS "PropertyReport_locationLat_locationLng_idx" ON "PropertyReport"("locationLat", "locationLng");
    `;

    await prisma.$executeRawUnsafe(createTableSQL);
    console.log('✅ PropertyReport table and indexes created');

    // Verify table exists
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
