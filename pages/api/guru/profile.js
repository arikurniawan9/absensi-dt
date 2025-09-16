// pages/api/guru/profile.js
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
  // Middleware autentikasi guru untuk API routes
  try {
    await authenticateGuruAPI(req, res, () => {});
  } catch (error) {
    // Error sudah ditangani di dalam authenticateGuruAPI
    return;
  }

  if (req.method === 'GET') {
    try {
      // Dapatkan data guru dan user berdasarkan guruId dari token
      const guru = await prisma.guru.findUnique({
        where: {
          id: req.user.guruId
        }
      });

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id
        }
      });

      if (!guru || !user) {
        return res.status(404).json({ message: 'Data guru tidak ditemukan' });
      }

      // Hapus password dari response user
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        guru,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { nama, email, alamat, noTelp } = req.body;

      // Update data user
      const updatedUser = await prisma.user.update({
        where: {
          id: req.user.id
        },
        data: {
          nama,
          email: email || null
        }
      });

      // Update data guru
      const updatedGuru = await prisma.guru.update({
        where: {
          id: req.user.guruId
        },
        data: {
          nama,
          alamat: alamat || null,
          noTelp: noTelp || null
        }
      });

      // Hapus password dari response user
      const { password, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        message: 'Profil berhasil diperbarui',
        guru: updatedGuru,
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