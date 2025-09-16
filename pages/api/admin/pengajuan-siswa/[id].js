// pages/api/admin/pengajuan-siswa/[id].js
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middleware/auth';
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

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;

      if (!status || !['diterima', 'ditolak'].includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
      }

      const pengajuan = await prisma.pengajuanSiswa.findUnique({
        where: { id: parseInt(id) },
        include: { siswa: true, kelasAsal: true, kelasTujuan: true },
      });

      if (!pengajuan) {
        return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
      }

      if (pengajuan.status !== 'pending') {
        return res.status(400).json({ message: 'Pengajuan sudah diproses' });
      }

      // Mulai transaksi database
      await prisma.$transaction(async (prisma) => {
        const updatedPengajuan = await prisma.pengajuanSiswa.update({
          where: { id: parseInt(id) },
          data: {
            status,
            diprosesOlehAdminId: req.user.id,
            tanggalProses: new Date(),
          },
        });

        // Jika pengajuan diterima dan tipenya pindah kelas
        if (status === 'diterima' && updatedPengajuan.tipePengajuan === 'pindah') {
          if (!updatedPengajuan.kelasTujuanId) {
            throw new Error('Kelas tujuan tidak ditemukan untuk pengajuan pindah kelas');
          }
          try {
            await prisma.siswa.update({
              where: { id: updatedPengajuan.siswaId },
              data: { kelasId: updatedPengajuan.kelasTujuanId },
            });
          } catch (siswaUpdateError) {
            console.error('Error updating siswa for pindah request:', siswaUpdateError);
            throw new Error('Gagal memperbarui data siswa untuk pengajuan pindah kelas.');
          }
        } else if (status === 'diterima' && updatedPengajuan.tipePengajuan === 'hapus') {
          try {
            await prisma.siswa.delete({
              where: { id: updatedPengajuan.siswaId },
            });
          } catch (siswaDeleteError) {
            console.error('Error deleting siswa for hapus request:', siswaDeleteError);
            throw new Error('Gagal menghapus data siswa untuk pengajuan hapus kelas.');
          }
        }

        return { message: `Pengajuan berhasil ${status}` }; // Return value from transaction
      });
      
      // Log aktivitas
      const adminNama = req.user.nama; // Asumsi nama admin tersedia di req.user
      const siswaNama = pengajuan.siswa.nama;
      const tipe = pengajuan.tipePengajuan === 'pindah' ? 'Pindah Kelas' : 'Hapus Kelas';
      await logActivity(req.user.id, 'Proses Pengajuan Siswa', `Admin ${adminNama} ${status} pengajuan ${tipe} untuk siswa ${siswaNama}.`, req);

      // Send response after transaction completes
      return res.status(200).json({ message: `Pengajuan berhasil ${status}` });
    } catch (error) {
      console.error('Error processing pengajuan siswa:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
