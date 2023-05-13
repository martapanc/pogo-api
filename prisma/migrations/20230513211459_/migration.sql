/*
  Warnings:

  - You are about to drop the `_PlayerHighPrioRegions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PlayerLowPrioRegions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlayerHighPrioRegions" DROP CONSTRAINT "_PlayerHighPrioRegions_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerHighPrioRegions" DROP CONSTRAINT "_PlayerHighPrioRegions_B_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerLowPrioRegions" DROP CONSTRAINT "_PlayerLowPrioRegions_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerLowPrioRegions" DROP CONSTRAINT "_PlayerLowPrioRegions_B_fkey";

-- DropTable
DROP TABLE "_PlayerHighPrioRegions";

-- DropTable
DROP TABLE "_PlayerLowPrioRegions";

-- CreateTable
CREATE TABLE "PlayerHighPrioRegions" (
    "playerId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "PlayerHighPrioRegions_pkey" PRIMARY KEY ("playerId","regionId")
);

-- CreateTable
CREATE TABLE "PlayerLowPrioRegions" (
    "playerId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "PlayerLowPrioRegions_pkey" PRIMARY KEY ("playerId","regionId")
);

-- AddForeignKey
ALTER TABLE "PlayerHighPrioRegions" ADD CONSTRAINT "PlayerHighPrioRegions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerHighPrioRegions" ADD CONSTRAINT "PlayerHighPrioRegions_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLowPrioRegions" ADD CONSTRAINT "PlayerLowPrioRegions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLowPrioRegions" ADD CONSTRAINT "PlayerLowPrioRegions_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
