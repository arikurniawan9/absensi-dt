// pages/api/guru/absence/history.js
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
      const { kelasId } = req.query;
      
      if (!kelasId) {
        return res.status(400).json({ message: 'Kelas ID harus diisi' });
      }

      // Dapatkan riwayat absensi berdasarkan kelasId dan guruId
      const absensi = await prisma.absensi.groupBy({
        by: ['tanggal', 'kelasId'],
        where: {
          kelasId: parseInt(kelasId),
          jadwal: {
            guruId: req.user.guruId
          }
        },
        _count: {
          status: true
        },
        orderBy: {
          tanggal: 'desc'
        }
      });

      // Hitung jumlah siswa untuk setiap status kehadiran
      const absensiWithDetails = await Promise.all(
        absensi.map(async (item) => {
          const hadir = await prisma.absensi.count({
            where: {
              tanggal: item.tanggal,
              kelasId: item.kelasId,
              status: 'hadir',
              jadwal: {
                guruId: req.user.guruId
              }
            }
          });

          const izin = await prisma.absensi.count({
            where: {
              tanggal: item.tanggal,
              kelasId: item.kelasId,
              status: 'izin',
              jadwal: {
                guruId: req.user.guruId
              }
            }
          });

          const sakit = await prisma.absensi.count({
            where: {
              tanggal: item.tanggal,
              kelasId: item.kelasId,
              status: 'sakit',
              jadwal: {
                guruId: req.user.guruId
              }
            }
          });

          const alpha = await prisma.absensi.count({
            where: {
              tanggal: item.tanggal,
              kelasId: item.kelasId,
              status: 'alpha',
              jadwal: {
                guruId: req.user.guruId
              }
            }
          });

          return {
            tanggal: item.tanggal,
            kelasId: item.kelasId,
            hadir,
            izin,
            sakit,
            alpha
          };
        })
      );

      res.status(200).json({
        absensi: absensiWithDetails
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}