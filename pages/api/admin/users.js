// pages/api/admin/users.js
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../middleware/auth';

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
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build filter conditions
      let where = {};
      
      // Filter berdasarkan role
      if (role) {
        where.role = role;
      }
      
      // Filter berdasarkan pencarian
      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { nama: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Dapatkan daftar user dengan pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: offset,
          take: parseInt(limit),
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            username: true,
            role: true,
            nama: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      res.status(200).json({
        users,
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
      const { username, password, role, nama, email, status } = req.body;

      // Validasi input
      if (!username || !password || !role || !nama) {
        return res.status(400).json({ message: 'Username, password, role, dan nama harus diisi' });
      }

      // Cek apakah username sudah digunakan
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat user baru
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
          nama,
          email: email || null,
          status: status !== undefined ? status : true
        },
        select: {
          id: true,
          username: true,
          role: true,
          nama: true,
          email: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.status(201).json({
        message: 'User berhasil dibuat',
        user: newUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}