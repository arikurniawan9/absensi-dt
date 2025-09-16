// pages/api/guru/pengajuan-siswa/bulk.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuruAPI } from '../../../../middleware/guruAuth';
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
  try {
    await new Promise((resolve, reject) => {
      authenticateGuruAPI(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  } catch (error) {
    return res.status(401).json({ message: 'Autentikasi gagal' });
  }

  const diajukanOlehGuruId = req.user.guruId; // Guru yang mengajukan

  if (!diajukanOlehGuruId) {
    return res.status(400).json({ message: 'ID guru tidak ditemukan dalam sesi. Mohon login kembali.' });
  }

  if (req.method === 'POST') {
    try {
      const { siswaIds, kelasTujuanId, tipePengajuan, alasan } = req.body;

      // Validasi input
      if (!siswaIds || !Array.isArray(siswaIds) || siswaIds.length === 0 || !tipePengajuan || !alasan) {
        return res.status(400).json({ message: 'Data pengajuan tidak lengkap atau tidak valid' });
      }

      if (tipePengajuan === 'pindah' && !kelasTujuanId) {
        return res.status(400).json({ message: 'Kelas tujuan wajib diisi untuk pengajuan pindah kelas' });
      }

      const createdRequests = [];

      for (const siswaId of siswaIds) {
        const parsedSiswaId = parseInt(siswaId);
        if (isNaN(parsedSiswaId)) {
          console.warn(`Siswa ID ${siswaId} tidak valid (bukan angka), melewati pengajuan.`);
          continue; // Lewati siswa ini jika ID tidak valid
        }

        // Pastikan siswa ada dan dapatkan kelas asalnya
        const siswa = await prisma.siswa.findUnique({
          where: { id: parsedSiswaId },
          select: { kelasId: true }
        });

        if (!siswa) {
          console.warn(`Siswa dengan ID ${siswaId} tidak ditemukan, melewati pengajuan.`);
          continue; // Lewati siswa ini jika tidak ditemukan
        }

        // Pastikan kelas tujuan ada jika tipe pengajuan adalah pindah
        if (tipePengajuan === 'pindah') {
          const kelasTujuan = await prisma.kelas.findUnique({
            where: { id: parseInt(kelasTujuanId) }
          });
          if (!kelasTujuan) {
            console.warn(`Kelas tujuan dengan ID ${kelasTujuanId} tidak ditemukan, melewati pengajuan.`);
            continue; // Lewati jika kelas tujuan tidak ditemukan
          }
          if (siswa.kelasId === parseInt(kelasTujuanId)) {
            console.warn(`Siswa ${siswaId} sudah berada di kelas tujuan ${kelasTujuanId}, melewati pengajuan.`);
            continue; // Lewati jika siswa sudah di kelas tujuan
          }
        }

        const newPengajuan = await prisma.pengajuanSiswa.create({
          data: {
            siswaId: parseInt(siswaId),
            kelasAsalId: siswa.kelasId, // Kelas asal dari data siswa
            kelasTujuanId: tipePengajuan === 'pindah' ? parseInt(kelasTujuanId) : null,
            tipePengajuan,
            alasan,
            diajukanOlehGuruId: diajukanOlehGuruId,
            status: 'pending',
          },
        });
        createdRequests.push(newPengajuan);
      }

      if (createdRequests.length === 0) {
        return res.status(400).json({ message: 'Tidak ada pengajuan yang berhasil dibuat. Pastikan siswa dan kelas tujuan valid.' });
      }

      // Log aktivitas pengajuan siswa
      const guruNama = req.user.nama; // Asumsi nama guru tersedia di req.user
      await logActivity(req.user.id, 'Pengajuan Siswa', `Guru ${guruNama} mengajukan ${createdRequests.length} permintaan ${tipePengajuan} siswa.`, req);

      return res.status(201).json({ message: 'Pengajuan berhasil diajukan', count: createdRequests.length, pengajuan: createdRequests });
    } catch (error) {
      console.error('Error creating bulk pengajuan siswa:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengajukan permintaan' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
