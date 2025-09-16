// pages/api/admin/mata-pelajaran/index.js
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

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let mataPelajaran = [];
      let total = 0;

      if (search) {
        // Gunakan raw query untuk pencarian case insensitive di SQLite
        const searchPattern = `%${search}%`;
        mataPelajaran = await prisma.$queryRaw`
          SELECT * FROM MataPelajaran 
          WHERE kodeMapel LIKE ${searchPattern} 
          OR namaMapel LIKE ${searchPattern}
          ORDER BY namaMapel ASC
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;
        
        const totalCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM MataPelajaran 
          WHERE kodeMapel LIKE ${searchPattern} 
          OR namaMapel LIKE ${searchPattern}
        `;
        
        total = parseInt(totalCount[0].count);
      } else {
        // Query normal tanpa pencarian
        [mataPelajaran, total] = await Promise.all([
          prisma.mataPelajaran.findMany({
            skip: offset,
            take: parseInt(limit),
            orderBy: {
              namaMapel: 'asc'
            }
          }),
          prisma.mataPelajaran.count()
        ]);
      }

      res.status(200).json({
        mataPelajaran,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'POST') {
    try {
      const { kodeMapel, namaMapel } = req.body;

      // Validasi input
      if (!kodeMapel || !namaMapel) {
        return res.status(400).json({ message: 'Kode mata pelajaran dan nama mata pelajaran harus diisi' });
      }

      // Cek apakah kode mata pelajaran sudah ada
      const existingMataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { kodeMapel }
      });

      if (existingMataPelajaran) {
        return res.status(400).json({ message: 'Kode mata pelajaran sudah digunakan' });
      }

      // Buat mata pelajaran baru
      const newMataPelajaran = await prisma.mataPelajaran.create({
        data: {
          kodeMapel,
          namaMapel
        }
      });

      res.status(201).json({
        message: 'Mata pelajaran berhasil dibuat',
        mataPelajaran: newMataPelajaran
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}