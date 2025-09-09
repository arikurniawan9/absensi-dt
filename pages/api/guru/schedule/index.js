// pages/api/guru/schedule/index.js
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
      const { kelasId, tanggal } = req.query;
      
      if (!kelasId || !tanggal) {
        return res.status(400).json({ message: 'Kelas ID dan tanggal harus diisi' });
      }
      
      // Dapatkan hari dalam bahasa Indonesia
      const daysInIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dateObj = new Date(tanggal);
      const dayName = daysInIndonesian[dateObj.getDay()];

      // Cari jadwal berdasarkan guruId, kelasId, dan hari
      const jadwal = await prisma.jadwal.findMany({
        where: {
          guruId: req.user.guruId,
          kelasId: parseInt(kelasId),
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
        }
      });

      res.status(200).json({
        jadwal
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}