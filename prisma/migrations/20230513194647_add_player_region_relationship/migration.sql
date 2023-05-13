/*
  Warnings:

  - You are about to drop the column `region` on the `Player` table. All the data in the column will be lost.
  - Added the required column `regionId` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "region",
ADD COLUMN     "regionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_PlayerWantedHighPrioRegion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PlayerWantedLowPrioRegion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerWantedHighPrioRegion_AB_unique" ON "_PlayerWantedHighPrioRegion"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerWantedHighPrioRegion_B_index" ON "_PlayerWantedHighPrioRegion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerWantedLowPrioRegion_AB_unique" ON "_PlayerWantedLowPrioRegion"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerWantedLowPrioRegion_B_index" ON "_PlayerWantedLowPrioRegion"("B");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_PlayerWantedHighPrioRegion" ADD CONSTRAINT "_PlayerWantedHighPrioRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerWantedHighPrioRegion" ADD CONSTRAINT "_PlayerWantedHighPrioRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerWantedLowPrioRegion" ADD CONSTRAINT "_PlayerWantedLowPrioRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerWantedLowPrioRegion" ADD CONSTRAINT "_PlayerWantedLowPrioRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
