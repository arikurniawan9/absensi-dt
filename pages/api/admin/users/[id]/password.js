// pages/api/admin/users/[id]/password.js
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

  const userId = parseInt(req.query.id);

  if (req.method === 'PUT') {
    try {
      const { password } = req.body;

      // Validasi input
      if (!password) {
        return res.status(400).json({ message: 'Password harus diisi' });
      }

      // Cek apakah user ada
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Hash password baru
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword
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

      res.status(200).json({
        message: 'Password berhasil diubah',
        user: updatedUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}