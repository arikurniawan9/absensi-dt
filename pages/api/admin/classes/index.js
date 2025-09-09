// pages/api/admin/classes/index.js
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

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build filter conditions
      let where = {};
      
      // Filter berdasarkan pencarian
      if (search) {
        // Untuk SQLite, kita tidak bisa menggunakan mode: 'insensitive'
        // Jadi kita gunakan pendekatan manual dengan beberapa kondisi
        where.OR = [
          { namaKelas: { contains: search } },
          { tingkat: { contains: search } },
          { tahunAjaran: { contains: search } }
        ];
      }

      // Dapatkan daftar kelas dengan pagination
      const [classes, total] = await Promise.all([
        prisma.kelas.findMany({
          where,
          skip: offset,
          take: parseInt(limit),
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.kelas.count({ where })
      ]);

      res.status(200).json({
        classes,
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
      const { namaKelas, tingkat, tahunAjaran } = req.body;

      // Validasi input
      if (!namaKelas || !tingkat || !tahunAjaran) {
        return res.status(400).json({ message: 'Nama kelas, tingkat, dan tahun ajaran harus diisi' });
      }

      // Cek apakah kelas sudah ada
      const existingClass = await prisma.kelas.findFirst({
        where: { 
          namaKelas,
          tingkat,
          tahunAjaran
        }
      });

      if (existingClass) {
        return res.status(400).json({ message: 'Kelas dengan kombinasi nama, tingkat, dan tahun ajaran ini sudah ada' });
      }

      // Buat kelas baru
      const newClass = await prisma.kelas.create({
        data: {
          namaKelas,
          tingkat,
          tahunAjaran
        }
      });

      res.status(201).json({
        message: 'Kelas berhasil dibuat',
        class: newClass
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}