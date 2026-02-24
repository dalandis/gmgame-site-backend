-- CreateTable
CREATE TABLE "shopItems" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "enchantments" JSONB NOT NULL,
    "gameId" TEXT NOT NULL,
    "gameLegend" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shopItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shopItems_type_idx" ON "shopItems"("type");

-- CreateIndex
CREATE INDEX "shopItems_gameId_idx" ON "shopItems"("gameId");
