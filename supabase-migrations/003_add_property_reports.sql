-- Migration: Add Property Snap tables
-- Created: 2024-01-15

-- Create PropertyReport table
CREATE TABLE IF NOT EXISTS "PropertyReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLng" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "formattedAddress" TEXT,
    "userImages" JSONB NOT NULL,
    "googlePhotos" JSONB,
    "nearbyPlaces" JSONB,
    "streetViewData" JSONB,
    "mapsData" JSONB,
    "aiInsights" JSONB,
    "transportation" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "shareToken" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyReport_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "PropertyReport_userId_idx" ON "PropertyReport"("userId");
CREATE INDEX IF NOT EXISTS "PropertyReport_shareToken_idx" ON "PropertyReport"("shareToken");
CREATE INDEX IF NOT EXISTS "PropertyReport_locationLat_locationLng_idx" ON "PropertyReport"("locationLat", "locationLng");

-- Create unique constraint for shareToken
CREATE UNIQUE INDEX IF NOT EXISTS "PropertyReport_shareToken_key" ON "PropertyReport"("shareToken");

-- Add foreign key constraint
ALTER TABLE "PropertyReport" ADD CONSTRAINT "PropertyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
