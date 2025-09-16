// pages/api/admin/mata-pelajaran/bulk-delete.js
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middleware/auth';

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

  // Hanya admin yang bisa mengakses
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  if (req.method === 'POST') {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Daftar ID mata pelajaran tidak valid.' });
      }

      // Cek apakah mata pelajaran digunakan oleh guru atau jadwal
      const usedMataPelajaran = await prisma.mataPelajaran.findMany({
        where: {
          id: {
            in: ids
          }
        },
        include: {
          gurus: true,
          jadwals: true
        }
      });

      const usedIds = usedMataPelajaran
        .filter(mp => mp.gurus.length > 0 || mp.jadwals.length > 0)
        .map(mp => mp.id);

      if (usedIds.length > 0) {
        return res.status(400).json({ 
          message: `Mata pelajaran dengan ID ${usedIds.join(', ')} tidak dapat dihapus karena masih digunakan` 
        });
      }

      // Hapus mata pelajaran yang tidak digunakan
      const deletedMataPelajaran = await prisma.mataPelajaran.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });

      res.status(200).json({
        message: 'Mata pelajaran berhasil dihapus secara massal',
        deletedCount: deletedMataPelajaran.count
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}