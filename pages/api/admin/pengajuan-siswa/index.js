// pages/api/admin/pengajuan-siswa/index.js
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
  try {
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    return res.status(401).json({ message: 'Autentikasi gagal' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  if (req.method === 'GET') {
    try {
      const pengajuan = await prisma.pengajuanSiswa.findMany({
        include: {
          siswa: { select: { id: true, nama: true, nis: true } },
          kelasAsal: { select: { id: true, namaKelas: true, tingkat: true } },
          kelasTujuan: { select: { id: true, namaKelas: true, tingkat: true } },
          diajukanOleh: { select: { id: true, nama: true, kodeGuru: true } },
        },
        orderBy: { tanggalPengajuan: 'desc' },
      });

      return res.status(200).json({ pengajuan });
    } catch (error) {
      console.error('Error fetching pengajuan siswa:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
