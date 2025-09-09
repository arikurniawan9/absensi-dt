// pages/api/guru/students.js
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
      const { kelasId } = req.query;
      
      if (!kelasId) {
        return res.status(400).json({ message: 'Kelas ID harus diisi' });
      }

      // Cari siswa berdasarkan kelasId
      const students = await prisma.siswa.findMany({
        where: {
          kelasId: parseInt(kelasId)
        },
        orderBy: {
          nama: 'asc'
        }
      });

      res.status(200).json({
        students
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}