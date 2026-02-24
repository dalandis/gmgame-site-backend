-- Ensure updatedAt gets a DB-level default after table creation.
ALTER TABLE "shopItemPurchases"
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
