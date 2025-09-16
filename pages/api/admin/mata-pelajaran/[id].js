// pages/api/admin/mata-pelajaran/[id].js
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
      const { kodeMapel, namaMapel } = req.body;

      // Validasi input
      if (!kodeMapel || !namaMapel) {
        return res.status(400).json({ message: 'Kode mata pelajaran dan nama mata pelajaran harus diisi' });
      }

      // Cek apakah mata pelajaran ada
      const existingMataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingMataPelajaran) {
        return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
      }

      // Cek apakah kode mata pelajaran sudah digunakan oleh mata pelajaran lain
      const duplicateMataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { 
          kodeMapel,
          NOT: { id: parseInt(id) }
        }
      });

      if (duplicateMataPelajaran) {
        return res.status(400).json({ message: 'Kode mata pelajaran sudah digunakan oleh mata pelajaran lain' });
      }

      // Update mata pelajaran
      const updatedMataPelajaran = await prisma.mataPelajaran.update({
        where: { id: parseInt(id) },
        data: {
          kodeMapel,
          namaMapel
        }
      });

      res.status(200).json({
        message: 'Mata pelajaran berhasil diupdate',
        mataPelajaran: updatedMataPelajaran
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah mata pelajaran ada
      const existingMataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingMataPelajaran) {
        return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
      }

      // Cek apakah mata pelajaran digunakan oleh guru atau jadwal
      const guruCount = await prisma.guru.count({
        where: { mataPelajaranId: parseInt(id) }
      });

      const jadwalCount = await prisma.jadwal.count({
        where: { mataPelajaranId: parseInt(id) }
      });

      if (guruCount > 0 || jadwalCount > 0) {
        return res.status(400).json({ 
          message: 'Mata pelajaran tidak dapat dihapus karena masih digunakan oleh guru atau jadwal' 
        });
      }

      // Hapus mata pelajaran
      await prisma.mataPelajaran.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({
        message: 'Mata pelajaran berhasil dihapus'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}