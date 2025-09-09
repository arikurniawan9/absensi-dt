// pages/api/auth/guru/login.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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
      const { username, password } = req.body;

      // Validasi input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password harus diisi' });
      }

      // Cari user dengan role guru
      const user = await prisma.user.findUnique({
        where: { 
          username,
          role: 'guru'
        },
        include: {
          guru: {
            include: {
              mataPelajaran: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Username atau password salah' });
      }

      // Cek status user
      if (!user.status) {
        return res.status(401).json({ message: 'Akun tidak aktif' });
      }

      // Verifikasi password
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Username atau password salah' });
      }

      // Buat token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          nama: user.nama,
          guruId: user.guru?.id
        },
        process.env.JWT_SECRET || 'absensi_siswa_secret_key',
        { expiresIn: '5d' }
      );

      // Hapus password dari response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: 'Login berhasil',
        token,
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