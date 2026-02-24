CREATE TABLE "shopItemPurchases" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "shopItemId" INTEGER NOT NULL,
    "priceAtPurchase" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAvailableAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shopItemPurchases_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "shopItemPurchases" ADD CONSTRAINT "shopItemPurchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shopItemPurchases" ADD CONSTRAINT "shopItemPurchases_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "shopItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "shopItemPurchases_userId_shopItemId_purchasedAt_idx" ON "shopItemPurchases"("userId", "shopItemId", "purchasedAt" DESC);
CREATE INDEX "shopItemPurchases_userId_idx" ON "shopItemPurchases"("userId");
CREATE INDEX "shopItemPurchases_shopItemId_idx" ON "shopItemPurchases"("shopItemId");
