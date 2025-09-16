// pages/api/admin/users.js
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
        // Untuk SQLite, kita tidak bisa menggunakan mode: 'insensitive'
        // Jadi kita gunakan pendekatan manual dengan beberapa kondisi
        where.OR = [
          { username: { contains: search } },
          { nama: { contains: search } },
          { email: { contains: search } }
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