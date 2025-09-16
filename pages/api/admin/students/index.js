// pages/api/admin/students/index.js
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeAdmin } from '@/middleware/auth';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

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
  // Middleware autentikasi dan otorisasi
  try {
    await runMiddleware(req, res, authenticate);
    await runMiddleware(req, res, authorizeAdmin);
  } catch (error) {
    // Error sudah ditangani di dalam middleware
    return;
  }

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search, kelasId } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build filter conditions
      let where = {};
      
      // Filter berdasarkan kelas
      if (kelasId) {
        where.kelasId = parseInt(kelasId);
      }
      
      // Filter berdasarkan pencarian
      if (search) {
        where.OR = [
          { nis: { contains: search } },
          { nama: { contains: search } }
        ];
      }

      // Dapatkan daftar siswa dengan pagination
      const [students, total] = await Promise.all([
        prisma.siswa.findMany({
          where,
          skip: offset,
          take: parseInt(limit),
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            kelas: {
              select: {
                id: true,
                namaKelas: true,
                tingkat: true
              }
            }
          }
        }),
        prisma.siswa.count({ where })
      ]);

      res.status(200).json({
        students,
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
      const { nis, nama, jenisKelamin, kelasId } = req.body;

      // Validasi input
      if (!nis || !nama || !jenisKelamin || !kelasId) {
        return res.status(400).json({ message: 'NIS, nama, jenis kelamin, dan kelas harus diisi' });
      }

      // Validasi jenis kelamin
      if (jenisKelamin !== 'Laki-laki' && jenisKelamin !== 'Perempuan') {
        return res.status(400).json({ message: 'Jenis kelamin harus Laki-laki atau Perempuan' });
      }

      // Cek apakah NIS sudah digunakan
      const existingStudent = await prisma.siswa.findUnique({
        where: { nis }
      });

      if (existingStudent) {
        return res.status(400).json({ message: 'NIS sudah digunakan' });
      }

      // Cek apakah kelas ada
      const kelas = await prisma.kelas.findUnique({
        where: { id: parseInt(kelasId) }
      });

      if (!kelas) {
        return res.status(400).json({ message: 'Kelas tidak ditemukan' });
      }

      // Buat siswa baru
      const newStudent = await prisma.siswa.create({
        data: {
          nis,
          nama,
          jenisKelamin,
          kelasId: parseInt(kelasId)
        },
        include: {
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tingkat: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Siswa berhasil dibuat',
        student: newStudent
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}