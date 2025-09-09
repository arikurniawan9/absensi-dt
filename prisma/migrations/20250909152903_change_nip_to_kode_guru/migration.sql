/*
  Warnings:

  - You are about to drop the column `nip` on the `Guru` table. All the data in the column will be lost.
  - Added the required column `kodeGuru` to the `Guru` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guru" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kodeGuru" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "mataPelajaranId" INTEGER NOT NULL,
    "alamat" TEXT,
    "noTelp" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Guru_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "MataPelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Guru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guru" ("alamat", "createdAt", "id", "mataPelajaranId", "nama", "noTelp", "updatedAt", "userId") SELECT "alamat", "createdAt", "id", "mataPelajaranId", "nama", "noTelp", "updatedAt", "userId" FROM "Guru";
DROP TABLE "Guru";
ALTER TABLE "new_Guru" RENAME TO "Guru";
CREATE UNIQUE INDEX "Guru_kodeGuru_key" ON "Guru"("kodeGuru");
CREATE UNIQUE INDEX "Guru_userId_key" ON "Guru"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
