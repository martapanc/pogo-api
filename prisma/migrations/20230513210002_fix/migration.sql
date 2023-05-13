/*
  Warnings:

  - You are about to drop the `_PlayerWantedHighPrioRegion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PlayerWantedLowPrioRegion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlayerWantedHighPrioRegion" DROP CONSTRAINT "_PlayerWantedHighPrioRegion_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerWantedHighPrioRegion" DROP CONSTRAINT "_PlayerWantedHighPrioRegion_B_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerWantedLowPrioRegion" DROP CONSTRAINT "_PlayerWantedLowPrioRegion_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerWantedLowPrioRegion" DROP CONSTRAINT "_PlayerWantedLowPrioRegion_B_fkey";

-- DropTable
DROP TABLE "_PlayerWantedHighPrioRegion";

-- DropTable
DROP TABLE "_PlayerWantedLowPrioRegion";

-- CreateTable
CREATE TABLE "_PlayerHighPrioRegions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PlayerLowPrioRegions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerHighPrioRegions_AB_unique" ON "_PlayerHighPrioRegions"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerHighPrioRegions_B_index" ON "_PlayerHighPrioRegions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerLowPrioRegions_AB_unique" ON "_PlayerLowPrioRegions"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerLowPrioRegions_B_index" ON "_PlayerLowPrioRegions"("B");

-- AddForeignKey
ALTER TABLE "_PlayerHighPrioRegions" ADD CONSTRAINT "_PlayerHighPrioRegions_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerHighPrioRegions" ADD CONSTRAINT "_PlayerHighPrioRegions_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerLowPrioRegions" ADD CONSTRAINT "_PlayerLowPrioRegions_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerLowPrioRegions" ADD CONSTRAINT "_PlayerLowPrioRegions_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
