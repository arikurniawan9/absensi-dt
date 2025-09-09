// pages/api/admin/guru/index.js
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
          { nip: { contains: search } },
          { nama: { contains: search } }
        ];
      }

      // Dapatkan daftar guru dengan pagination
      const [guru, total] = await Promise.all([
        prisma.guru.findMany({
          where,
          skip: offset,
          take: parseInt(limit),
          orderBy: {
            nama: 'asc'
          },
          include: {
            mataPelajaran: {
              select: {
                id: true,
                kodeMapel: true,
                namaMapel: true
              }
            },
            user: {
              select: {
                id: true,
                username: true,
                status: true
              }
            }
          }
        }),
        prisma.guru.count({ where })
      ]);

      res.status(200).json({
        guru,
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
      const { nip, nama, mataPelajaranId, alamat, noTelp, username, password } = req.body;

      // Validasi input
      if (!nip || !nama || !mataPelajaranId || !username || !password) {
        return res.status(400).json({ message: 'NIP, nama, mata pelajaran, username, dan password harus diisi' });
      }

      // Cek apakah NIP sudah digunakan
      const existingGuru = await prisma.guru.findUnique({
        where: { nip }
      });

      if (existingGuru) {
        return res.status(400).json({ message: 'NIP sudah digunakan' });
      }

      // Cek apakah username sudah digunakan
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }

      // Cek apakah mata pelajaran ada
      const mataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: parseInt(mataPelajaranId) }
      });

      if (!mataPelajaran) {
        return res.status(400).json({ message: 'Mata pelajaran tidak ditemukan' });
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat user dan guru dalam transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Buat user terlebih dahulu
        const newUser = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
            role: 'guru',
            nama,
            email: null,
            status: true
          }
        });

        // Buat guru
        const newGuru = await prisma.guru.create({
          data: {
            nip,
            nama,
            mataPelajaranId: parseInt(mataPelajaranId),
            alamat: alamat || null,
            noTelp: noTelp || null,
            userId: newUser.id
          },
          include: {
            mataPelajaran: {
              select: {
                id: true,
                kodeMapel: true,
                namaMapel: true
              }
            },
            user: {
              select: {
                id: true,
                username: true,
                status: true
              }
            }
          }
        });

        return { newUser, newGuru };
      });

      res.status(201).json({
        message: 'Guru berhasil dibuat',
        guru: result.newGuru
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}