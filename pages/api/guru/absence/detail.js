// pages/api/guru/absence/detail.js
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

  if (req.method === 'GET') {
    try {
      const { kelasId, tanggal } = req.query;
      
      if (!kelasId || !tanggal) {
        return res.status(400).json({ message: 'Kelas ID dan tanggal harus diisi' });
      }

      // Dapatkan detail absensi berdasarkan kelasId, tanggal, dan guruId
      const absensi = await prisma.absensi.findMany({
        where: {
          kelasId: parseInt(kelasId),
          tanggal: new Date(tanggal),
          jadwal: {
            guruId: req.user.guruId
          }
        },
        include: {
          siswa: {
            select: {
              id: true,
              nis: true,
              nama: true
            }
          }
        },
        orderBy: {
          siswa: {
            nama: 'asc'
          }
        }
      });

      res.status(200).json({
        absensi
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}