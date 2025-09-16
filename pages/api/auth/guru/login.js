// pages/api/auth/guru/login.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logActivity } from '../../../../lib/activityLogger';

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
        await logActivity(null, 'Login Guru Gagal', `Percobaan login guru dengan username: ${username} (User tidak ditemukan)`, req);
        return res.status(401).json({ message: 'Username atau password salah' });
      }

      // Cek status user
      if (!user.status) {
        await logActivity(user.id, 'Login Guru Gagal', `Percobaan login guru dengan username: ${username} (Akun tidak aktif)`, req);
        return res.status(401).json({ message: 'Akun tidak aktif' });
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        await logActivity(user.id, 'Login Guru Gagal', `Percobaan login guru dengan username: ${username} (Password salah)`, req);
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
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '5d' }
      );

      // Hapus password dari response
      const { password: _, ...userWithoutPassword } = user;

      // Set token di http-only cookie
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 5}`); // 5 hari

      // Log aktivitas login berhasil
      await logActivity(user.id, 'Login Guru Berhasil', `Guru ${user.username} berhasil login`, req);

      res.status(200).json({
        message: 'Login berhasil',
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