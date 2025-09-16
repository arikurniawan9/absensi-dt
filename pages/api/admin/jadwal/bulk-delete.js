// pages/api/admin/jadwal/bulk-delete.js
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

  if (req.method === 'POST') {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Daftar ID jadwal tidak valid.' });
      }

      // Konversi IDs ke integer
      const intIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

      if (intIds.length === 0) {
        return res.status(400).json({ message: 'Tidak ada ID jadwal yang valid.' });
      }

      // Hapus jadwal
      const deletedJadwal = await prisma.jadwal.deleteMany({
        where: {
          id: {
            in: intIds
          }
        }
      });

      res.status(200).json({
        message: 'Jadwal berhasil dihapus secara massal',
        deletedCount: deletedJadwal.count
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
