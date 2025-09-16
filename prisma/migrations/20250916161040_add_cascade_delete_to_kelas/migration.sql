-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Absensi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tanggal" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,
    "siswaId" INTEGER NOT NULL,
    "jadwalId" INTEGER NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Absensi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Absensi_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "Jadwal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Absensi_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Absensi" ("createdAt", "id", "jadwalId", "kelasId", "keterangan", "siswaId", "status", "tanggal", "updatedAt") SELECT "createdAt", "id", "jadwalId", "kelasId", "keterangan", "siswaId", "status", "tanggal", "updatedAt" FROM "Absensi";
DROP TABLE "Absensi";
ALTER TABLE "new_Absensi" RENAME TO "Absensi";
CREATE TABLE "new_Jadwal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hari" TEXT NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "guruId" INTEGER NOT NULL,
    "mataPelajaranId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Jadwal_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Jadwal_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Jadwal_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "MataPelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Jadwal" ("createdAt", "guruId", "hari", "id", "jamMulai", "jamSelesai", "kelasId", "mataPelajaranId", "updatedAt") SELECT "createdAt", "guruId", "hari", "id", "jamMulai", "jamSelesai", "kelasId", "mataPelajaranId", "updatedAt" FROM "Jadwal";
DROP TABLE "Jadwal";
ALTER TABLE "new_Jadwal" RENAME TO "Jadwal";
CREATE TABLE "new_PengajuanSiswa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siswaId" INTEGER NOT NULL,
    "kelasAsalId" INTEGER NOT NULL,
    "kelasTujuanId" INTEGER,
    "tipePengajuan" TEXT NOT NULL,
    "alasan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "diajukanOlehGuruId" INTEGER NOT NULL,
    "diprosesOlehAdminId" INTEGER,
    "tanggalPengajuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalProses" DATETIME,
    CONSTRAINT "PengajuanSiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_kelasAsalId_fkey" FOREIGN KEY ("kelasAsalId") REFERENCES "Kelas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_kelasTujuanId_fkey" FOREIGN KEY ("kelasTujuanId") REFERENCES "Kelas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_diajukanOlehGuruId_fkey" FOREIGN KEY ("diajukanOlehGuruId") REFERENCES "Guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_diprosesOlehAdminId_fkey" FOREIGN KEY ("diprosesOlehAdminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PengajuanSiswa" ("alasan", "diajukanOlehGuruId", "diprosesOlehAdminId", "id", "kelasAsalId", "kelasTujuanId", "siswaId", "status", "tanggalPengajuan", "tanggalProses", "tipePengajuan") SELECT "alasan", "diajukanOlehGuruId", "diprosesOlehAdminId", "id", "kelasAsalId", "kelasTujuanId", "siswaId", "status", "tanggalPengajuan", "tanggalProses", "tipePengajuan" FROM "PengajuanSiswa";
DROP TABLE "PengajuanSiswa";
ALTER TABLE "new_PengajuanSiswa" RENAME TO "PengajuanSiswa";
CREATE TABLE "new_Siswa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nis" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" TEXT,
    "kelasId" INTEGER NOT NULL,
    "tanggalLahir" DATETIME,
    "alamat" TEXT,
    "noTelp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Siswa" ("alamat", "createdAt", "id", "jenisKelamin", "kelasId", "nama", "nis", "noTelp", "tanggalLahir", "updatedAt") SELECT "alamat", "createdAt", "id", "jenisKelamin", "kelasId", "nama", "nis", "noTelp", "tanggalLahir", "updatedAt" FROM "Siswa";
DROP TABLE "Siswa";
ALTER TABLE "new_Siswa" RENAME TO "Siswa";
CREATE UNIQUE INDEX "Siswa_nis_key" ON "Siswa"("nis");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
