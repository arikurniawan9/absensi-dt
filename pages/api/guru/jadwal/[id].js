// pages/api/guru/jadwal/[id].js
import { PrismaClient } from '@prisma/client';
import { authenticateGuruAPI } from '@/middleware/guruAuth';

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
  // Middleware autentikasi guru untuk API routes
  try {
    await authenticateGuruAPI(req, res, () => {});
  } catch (error) {
    // Error sudah ditangani di dalam authenticateGuruAPI
    return;
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { hari, jamMulai, jamSelesai, kelasId, mataPelajaranId } = req.body;

      // Validasi input
      if (!hari || !jamMulai || !jamSelesai || !kelasId || !mataPelajaranId) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      // Cek apakah jadwal ada dan milik guru yang sedang login
      const existingJadwal = await prisma.jadwal.findUnique({
        where: { 
          id: parseInt(id),
          guruId: req.user.guruId
        }
      });

      if (!existingJadwal) {
        return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
      }

      // Cek apakah kelas ada
      const kelas = await prisma.kelas.findUnique({
        where: { id: parseInt(kelasId) }
      });

      if (!kelas) {
        return res.status(400).json({ message: 'Kelas tidak ditemukan' });
      }

      // Cek apakah mata pelajaran ada
      const mataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: parseInt(mataPelajaranId) }
      });

      if (!mataPelajaran) {
        return res.status(400).json({ message: 'Mata pelajaran tidak ditemukan' });
      }

      // Cek apakah sudah ada jadwal yang bentrok (selain jadwal yang sedang diupdate)
      const conflictingJadwal = await prisma.jadwal.findFirst({
        where: {
          guruId: req.user.guruId,
          hari,
          id: {
            not: parseInt(id)
          },
          OR: [
            {
              jamMulai: {
                lte: jamSelesai
              },
              jamSelesai: {
                gte: jamMulai
              }
            }
          ]
        }
      });

      if (conflictingJadwal) {
        return res.status(400).json({ 
          message: 'Jadwal bentrok dengan jadwal yang sudah ada' 
        });
      }

      // Update jadwal
      const updatedJadwal = await prisma.jadwal.update({
        where: { 
          id: parseInt(id),
          guruId: req.user.guruId
        },
        data: {
          hari,
          jamMulai,
          jamSelesai,
          kelasId: parseInt(kelasId),
          mataPelajaranId: parseInt(mataPelajaranId)
        },
        include: {
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tingkat: true
            }
          },
          mataPelajaran: {
            select: {
              id: true,
              kodeMapel: true,
              namaMapel: true
            }
          }
        }
      });

      res.status(200).json({
        message: 'Jadwal berhasil diperbarui',
        jadwal: updatedJadwal
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah jadwal ada dan milik guru yang sedang login
      const existingJadwal = await prisma.jadwal.findUnique({
        where: { 
          id: parseInt(id),
          guruId: req.user.guruId
        }
      });

      if (!existingJadwal) {
        return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
      }

      // Hapus jadwal
      await prisma.jadwal.delete({
        where: { 
          id: parseInt(id),
          guruId: req.user.guruId
        }
      });

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