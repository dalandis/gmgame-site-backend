-- This migration was created before "shopItemPurchases" existed.
-- Keep it non-failing for clean deployments on empty databases.
ALTER TABLE IF EXISTS "shopItemPurchases"
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
