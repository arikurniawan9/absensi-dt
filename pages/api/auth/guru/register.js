// pages/api/auth/guru/register.js
import { PrismaClient } from '@prisma/client';

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
  if (req.method === 'POST') {
    try {
      const { nip, nama, username, password } = req.body;

      // Validasi input
      if (!nip || !nama || !username || !password) {
        return res.status(400).json({ message: 'NIP, nama, username, dan password harus diisi' });
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
            status: true // Default aktif
          }
        });

        // Buat guru dengan userId yang baru dibuat
        const newGuru = await prisma.guru.create({
          data: {
            nip,
            nama,
            mataPelajaranId: 1, // Default mata pelajaran, akan diupdate oleh admin
            userId: newUser.id
          }
        });

        return { newUser, newGuru };
      });

      // Hapus password dari response
      const { password: _, ...userWithoutPassword } = result.newUser;

      res.status(201).json({
        message: 'Registrasi berhasil',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}