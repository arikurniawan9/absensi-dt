-- CreateTable
CREATE TABLE "PengajuanSiswa" (
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
    CONSTRAINT "PengajuanSiswa_kelasAsalId_fkey" FOREIGN KEY ("kelasAsalId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_kelasTujuanId_fkey" FOREIGN KEY ("kelasTujuanId") REFERENCES "Kelas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_diajukanOlehGuruId_fkey" FOREIGN KEY ("diajukanOlehGuruId") REFERENCES "Guru" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PengajuanSiswa_diprosesOlehAdminId_fkey" FOREIGN KEY ("diprosesOlehAdminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
