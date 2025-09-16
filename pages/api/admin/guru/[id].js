// pages/api/admin/guru/[id].js
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
  try {
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    // Error sudah ditangani di dalam authenticate
    return;
  }

  // Hanya admin yang bisa mengakses
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  // Hanya admin yang bisa mengakses
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { kodeGuru, nama, mataPelajaranId, alamat, noTelp, email } = req.body;

      // Validasi input
      if (!kodeGuru || !nama || !mataPelajaranId) {
        return res.status(400).json({ message: 'Kode guru, nama, dan mata pelajaran harus diisi' });
      }

      // Cek apakah guru ada
      const existingGuru = await prisma.guru.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingGuru) {
        return res.status(404).json({ message: 'Guru tidak ditemukan' });
      }

      // Cek apakah kodeGuru sudah digunakan oleh guru lain
      const duplicateGuru = await prisma.guru.findUnique({
        where: { 
          kodeGuru,
          NOT: { id: parseInt(id) }
        }
      });

      if (duplicateGuru) {
        return res.status(400).json({ message: 'Kode guru sudah digunakan oleh guru lain' });
      }

      // Cek apakah mata pelajaran ada
      const mataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: parseInt(mataPelajaranId) }
      });

      if (!mataPelajaran) {
        return res.status(400).json({ message: 'Mata pelajaran tidak ditemukan' });
      }

      // Update guru
      const updatedGuru = await prisma.guru.update({
        where: { id: parseInt(id) },
        data: {
          kodeGuru,
          nama,
          mataPelajaranId: parseInt(mataPelajaranId),
          alamat: alamat || null,
          noTelp: noTelp || null
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
              email: true,
              status: true
            }
          }
        }
      });

      // Update nama dan email di user jika berubah
      if (nama !== existingGuru.nama || email !== existingGuru.user?.email) {
        await prisma.user.update({
          where: { id: updatedGuru.userId },
          data: { 
            nama,
            email: email || null
          }
        });
      }

      res.status(200).json({
        message: 'Guru berhasil diupdate',
        guru: updatedGuru
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah guru ada
      const existingGuru = await prisma.guru.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingGuru) {
        return res.status(404).json({ message: 'Guru tidak ditemukan' });
      }

      // Cek apakah guru memiliki jadwal mengajar
      const jadwalCount = await prisma.jadwal.count({
        where: { guruId: parseInt(id) }
      });

      if (jadwalCount > 0) {
        return res.status(400).json({ 
          message: 'Guru tidak dapat dihapus karena masih memiliki jadwal mengajar' 
        });
      }

      // Hapus guru dan user dalam transaction
      await prisma.$transaction(async (prisma) => {
        // Hapus user terlebih dahulu
        await prisma.user.delete({
          where: { id: existingGuru.userId }
        });

        // Hapus guru
        await prisma.guru.delete({
          where: { id: parseInt(id) }
        });
      });

      res.status(200).json({
        message: 'Guru berhasil dihapus'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}