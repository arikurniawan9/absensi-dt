// pages/api/guru/schedule/today.js
import prisma from '@/lib/prisma';
import { authenticateGuruAPI } from '@/middleware/guruAuth';

// Helper to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  try {
    // Jalankan middleware autentikasi
    await runMiddleware(req, res, authenticateGuruAPI);
  } catch (error) {
    // Error autentikasi sudah ditangani di dalam middleware
    return;
  }

  if (req.method === 'GET') {
    try {
      if (!req.user || !req.user.guruId) {
        return res.status(401).json({ message: 'Data guru tidak ditemukan dalam token' });
      }

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

      res.status(200).json({ schedule });

    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}