/*
  Warnings:

  - Added the required column `displayName` to the `Region` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "displayName" TEXT NOT NULL;
