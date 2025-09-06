// pages/api/admin/users/[id].js
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

  const userId = parseInt(req.query.id);

  if (req.method === 'GET') {
    try {
      // Dapatkan detail user
      const user = await prisma.user.findUnique({
        where: { id: userId },
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

      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { username, role, nama, email, status } = req.body;

      // Validasi input
      if (!username || !role || !nama) {
        return res.status(400).json({ message: 'Username, role, dan nama harus diisi' });
      }

      // Cek apakah user ada
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Cek apakah username sudah digunakan oleh user lain
      const userWithSameUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (userWithSameUsername && userWithSameUsername.id !== userId) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          username,
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

      res.status(200).json({
        message: 'User berhasil diupdate',
        user: updatedUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah user ada
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Jangan izinkan menghapus diri sendiri
      if (req.user.id === userId) {
        return res.status(400).json({ message: 'Anda tidak bisa menghapus akun Anda sendiri' });
      }

      // Hapus user
      await prisma.user.delete({
        where: { id: userId }
      });

      res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}