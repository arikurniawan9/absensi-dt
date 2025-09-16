// pages/api/admin/guru/bulk-delete.js
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
        return res.status(400).json({ message: 'Daftar ID guru tidak valid.' });
      }

      // Cek apakah guru memiliki jadwal mengajar
      const guruWithJadwal = await prisma.guru.findMany({
        where: {
          id: {
            in: ids
          }
        },
        include: {
          jadwals: true
        }
      });

      const guruWithJadwalIds = guruWithJadwal
        .filter(guru => guru.jadwals.length > 0)
        .map(guru => guru.id);

      if (guruWithJadwalIds.length > 0) {
        return res.status(400).json({ 
          message: `Guru dengan ID ${guruWithJadwalIds.join(', ')} tidak dapat dihapus karena masih memiliki jadwal mengajar` 
        });
      }

      // Dapatkan userId dari guru yang akan dihapus
      const guruList = await prisma.guru.findMany({
        where: {
          id: {
            in: ids
          }
        },
        select: {
          userId: true
        }
      });

      const userIds = guruList.map(guru => guru.userId);

      // Hapus guru dan user dalam transaction
      await prisma.$transaction(async (prisma) => {
        // Hapus user
        await prisma.user.deleteMany({
          where: {
            id: {
              in: userIds
            }
          }
        });

        // Hapus guru
        await prisma.guru.deleteMany({
          where: {
            id: {
              in: ids
            }
          }
        });
      });

      res.status(200).json({
        message: 'Guru berhasil dihapus secara massal',
        deletedCount: ids.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}