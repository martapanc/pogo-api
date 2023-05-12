-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" TEXT NOT NULL,
    "trainerCode" TEXT NOT NULL,
    "location" TEXT,
    "region" TEXT NOT NULL
);
