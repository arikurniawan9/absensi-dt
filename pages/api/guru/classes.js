// pages/api/guru/classes.js
import prisma from '@/lib/prisma';
import { authenticateGuruAPI } from '@/middleware/guruAuth';

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
      // Dapatkan semua kelas yang memiliki jadwal dengan guruId ini
      const classes = await prisma.kelas.findMany({
        where: {
          jadwals: {
            some: {
              guruId: req.user.guruId
            }
          }
        },
        orderBy: [
          { tingkat: 'asc' },
          { namaKelas: 'asc' }
        ]
      });

      res.status(200).json({
        classes
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}