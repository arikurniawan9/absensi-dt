// pages/api/guru/schedule/today.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuru } from '../../../middleware/guruAuth';

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
  // Middleware autentikasi guru
  await new Promise((resolve, reject) => {
    authenticateGuru(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method === 'GET') {
    try {
      // Dapatkan hari saat ini dalam bahasa Indonesia
      const daysInIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const today = new Date();
      const dayName = daysInIndonesian[today.getDay()];

      // Cari jadwal untuk hari ini berdasarkan guruId dari token
      const schedule = await prisma.jadwal.findMany({
        where: {
          guruId: req.user.guruId,
          hari: dayName
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
              namaMapel: true
            }
          }
        },
        orderBy: {
          jamMulai: 'asc'
        }
      });

      res.status(200).json({
        schedule
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}