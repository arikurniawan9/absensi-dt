// pages/api/admin/students/[id].js
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

  const studentId = parseInt(req.query.id);

  if (req.method === 'GET') {
    try {
      // Dapatkan detail siswa
      const student = await prisma.siswa.findUnique({
        where: { id: studentId },
        include: {
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tingkat: true
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ message: 'Siswa tidak ditemukan' });
      }

      res.status(200).json({ student });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { nis, nama, jenisKelamin, kelasId } = req.body;

      // Validasi input
      if (!nis || !nama || !jenisKelamin || !kelasId) {
        return res.status(400).json({ message: 'NIS, nama, jenis kelamin, dan kelas harus diisi' });
      }

      // Validasi jenis kelamin
      if (jenisKelamin !== 'Laki-laki' && jenisKelamin !== 'Perempuan') {
        return res.status(400).json({ message: 'Jenis kelamin harus Laki-laki atau Perempuan' });
      }

      // Cek apakah siswa ada
      const existingStudent = await prisma.siswa.findUnique({
        where: { id: studentId }
      });

      if (!existingStudent) {
        return res.status(404).json({ message: 'Siswa tidak ditemukan' });
      }

      // Cek apakah NIS sudah digunakan oleh siswa lain
      const studentWithSameNIS = await prisma.siswa.findUnique({
        where: { nis }
      });

      if (studentWithSameNIS && studentWithSameNIS.id !== studentId) {
        return res.status(400).json({ message: 'NIS sudah digunakan' });
      }

      // Cek apakah kelas ada
      const kelas = await prisma.kelas.findUnique({
        where: { id: parseInt(kelasId) }
      });

      if (!kelas) {
        return res.status(400).json({ message: 'Kelas tidak ditemukan' });
      }

      // Update siswa
      const updatedStudent = await prisma.siswa.update({
        where: { id: studentId },
        data: {
          nis,
          nama,
          jenisKelamin,
          kelasId: parseInt(kelasId)
        },
        include: {
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tingkat: true
            }
          }
        }
      });

      res.status(200).json({
        message: 'Siswa berhasil diupdate',
        student: updatedStudent
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Cek apakah siswa ada
      const existingStudent = await prisma.siswa.findUnique({
        where: { id: studentId }
      });

      if (!existingStudent) {
        return res.status(404).json({ message: 'Siswa tidak ditemukan' });
      }

      // Hapus siswa
      await prisma.siswa.delete({
        where: { id: studentId }
      });

      res.status(200).json({ message: 'Siswa berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}