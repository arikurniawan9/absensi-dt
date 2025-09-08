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
  await new Promise((resolve, reject) => {
    authenticate(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Hanya admin yang bisa mengakses
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  if (req.method === 'POST') {
    try {
      const { ids, newKelasId } = req.body;

      if (!Array.isArray(ids) || ids.length === 0 || !newKelasId) {
        return res.status(400).json({ message: 'Daftar ID siswa atau ID kelas baru tidak valid.' });
      }

      const updatedStudents = await prisma.siswa.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          kelasId: parseInt(newKelasId),
        },
      });

      res.status(200).json({
        message: 'Siswa berhasil dipindahkan kelasnya secara massal',
        movedCount: updatedStudents.count,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}