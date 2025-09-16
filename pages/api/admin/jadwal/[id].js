// pages/api/admin/jadwal/[id].js
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middleware/auth';
import { logActivity } from '../../../../lib/activityLogger';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default async function handler(req, res) {
  // Middleware autentikasi
  try {
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    // Error sudah ditangani di dalam authenticate
    return;
  }

  // Hanya admin yang bisa mengakses
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { hari, jamMulai, jamSelesai, guruId, kelasId, mataPelajaranId } = req.body;

      // Validasi input
      if (!hari || !jamMulai || !jamSelesai || !guruId || !kelasId || !mataPelajaranId) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      // Cek apakah jadwal ada
      const existingJadwal = await prisma.jadwal.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingJadwal) {
        return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
      }

      // Cek apakah guru, kelas, dan mata pelajaran ada
      const [guru, kelas, mataPelajaran] = await Promise.all([
        prisma.guru.findUnique({
          where: { id: parseInt(guruId) }
        }),
        prisma.kelas.findUnique({
          where: { id: parseInt(kelasId) }
        }),
        prisma.mataPelajaran.findUnique({
          where: { id: parseInt(mataPelajaranId) }
        })
      ]);

      if (!guru || !kelas || !mataPelajaran) {
        return res.status(400).json({ message: 'Guru, kelas, atau mata pelajaran tidak ditemukan' });
      }

      // Cek apakah sudah ada jadwal yang bentrok (selain jadwal yang sedang diupdate)
      const conflictingJadwal = await prisma.jadwal.findFirst({
        where: {
          hari,
          id: { not: parseInt(id) }, // Exclude the current schedule from the check
          jamMulai: { lt: jamSelesai },
          jamSelesai: { gt: jamMulai },
          OR: [
            { guruId: parseInt(guruId) },
            { kelasId: parseInt(kelasId) },
          ],
        },
      });

      if (conflictingJadwal) {
        let conflictMessage = 'Jadwal bentrok dengan yang sudah ada.';
        if (conflictingJadwal.guruId === parseInt(guruId)) {
          conflictMessage = `Guru tersebut sudah memiliki jadwal lain pada jam yang sama di hari ${hari}.`;
        } else if (conflictingJadwal.kelasId === parseInt(kelasId)) {
          conflictMessage = `Kelas tersebut sudah memiliki jadwal lain pada jam yang sama di hari ${hari}.`;
        }
        return res.status(400).json({ message: conflictMessage });
      }

      // Update jadwal
      const updatedJadwal = await prisma.jadwal.update({
        where: { id: parseInt(id) },
        data: {
          hari,
          jamMulai,
          jamSelesai,
          guruId: parseInt(guruId),
          kelasId: parseInt(kelasId),
          mataPelajaranId: parseInt(mataPelajaranId)
        },
        include: {
          guru: true,
          kelas: true,
          mataPelajaran: true,
        }
      });

      res.status(200).json({
        message: 'Jadwal berhasil diupdate',
        jadwal: updatedJadwal
      });

      // Log aktivitas
      const adminNama = req.user.nama; // Asumsi nama admin tersedia di req.user
      const guruNama = updatedJadwal.guru.nama;
      const kelasNama = `${updatedJadwal.kelas.tingkat} - ${updatedJadwal.kelas.namaKelas}`;
      const mapelNama = updatedJadwal.mataPelajaran.namaMapel;
      await logActivity(req.user.id, 'Update Jadwal', `Admin ${adminNama} memperbarui jadwal ${mapelNama} untuk guru ${guruNama} di kelas ${kelasNama} pada hari ${updatedJadwal.hari}, pukul ${updatedJadwal.jamMulai}-${updatedJadwal.jamSelesai}.`, req);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah jadwal ada
      const existingJadwal = await prisma.jadwal.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingJadwal) {
        return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
      }

      // Hapus jadwal
      await prisma.jadwal.delete({
        where: { id: parseInt(id) }
      });

      // Log aktivitas
      const adminNama = req.user.nama; // Asumsi nama admin tersedia di req.user
      await logActivity(req.user.id, 'Hapus Jadwal', `Admin ${adminNama} menghapus jadwal ID ${id}.`, req);

      res.status(200).json({
        message: 'Jadwal berhasil dihapus'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
