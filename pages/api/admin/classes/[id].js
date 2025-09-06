// pages/api/admin/classes/[id].js
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

  const classId = parseInt(req.query.id);

  if (req.method === 'GET') {
    try {
      // Dapatkan detail kelas
      const kelas = await prisma.kelas.findUnique({
        where: { id: classId }
      });

      if (!kelas) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan' });
      }

      res.status(200).json({ class: kelas });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { namaKelas, tingkat, tahunAjaran } = req.body;

      // Validasi input
      if (!namaKelas || !tingkat || !tahunAjaran) {
        return res.status(400).json({ message: 'Nama kelas, tingkat, dan tahun ajaran harus diisi' });
      }

      // Cek apakah kelas ada
      const existingClass = await prisma.kelas.findUnique({
        where: { id: classId }
      });

      if (!existingClass) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan' });
      }

      // Cek apakah kombinasi kelas sudah ada (untuk kelas lain)
      const classWithSameCombination = await prisma.kelas.findFirst({
        where: { 
          namaKelas,
          tingkat,
          tahunAjaran,
          NOT: { id: classId }
        }
      });

      if (classWithSameCombination) {
        return res.status(400).json({ message: 'Kelas dengan kombinasi nama, tingkat, dan tahun ajaran ini sudah ada' });
      }

      // Update kelas
      const updatedClass = await prisma.kelas.update({
        where: { id: classId },
        data: {
          namaKelas,
          tingkat,
          tahunAjaran
        }
      });

      res.status(200).json({
        message: 'Kelas berhasil diupdate',
        class: updatedClass
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah kelas ada
      const existingClass = await prisma.kelas.findUnique({
        where: { id: classId }
      });

      if (!existingClass) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan' });
      }

      // Cek apakah kelas memiliki relasi dengan data lain (siswa, jadwal, absensi)
      const studentCount = await prisma.siswa.count({
        where: { kelasId: classId }
      });

      if (studentCount > 0) {
        return res.status(400).json({ message: 'Tidak bisa menghapus kelas yang masih memiliki siswa' });
      }

      // Hapus kelas
      await prisma.kelas.delete({
        where: { id: classId }
      });

      res.status(200).json({ message: 'Kelas berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}