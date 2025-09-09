// pages/api/guru/subjects.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuru } from '../../middleware/guruAuth';

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
      // Dapatkan semua mata pelajaran
      const subjects = await prisma.mataPelajaran.findMany({
        orderBy: {
          namaMapel: 'asc'
        }
      });

      res.status(200).json({
        subjects
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}