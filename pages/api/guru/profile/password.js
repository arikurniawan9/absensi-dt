// pages/api/guru/profile/password.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuruAPI } from '@/middleware/guruAuth';

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
  // Middleware autentikasi guru
  await new Promise((resolve, reject) => {
    authenticateGuru(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method === 'PUT') {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validasi input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Password saat ini dan password baru harus diisi' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
      }

      // Dapatkan user saat ini
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Verifikasi password saat ini
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Password saat ini salah' });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: {
          id: req.user.id
        },
        data: {
          password: hashedPassword
        }
      });

      res.status(200).json({
        message: 'Password berhasil diperbarui'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}