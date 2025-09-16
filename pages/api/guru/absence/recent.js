// pages/api/guru/absence/recent.js
import prisma from '@/lib/prisma';
import { authenticateGuruAPI } from '@/middleware/guruAuth';

// Helper to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, authenticateGuruAPI);
  } catch (error) {
    return;
  }

  if (req.method === 'GET') {
    try {
      if (!req.user || !req.user.guruId) {
        return res.status(401).json({ message: 'Data guru tidak ditemukan dalam token' });
      }

      // Dapatkan 5 absensi terbaru berdasarkan guruId dari token
      const absences = await prisma.absensi.groupBy({
        by: ['jadwalId', 'tanggal', 'kelasId'],
        where: {
          jadwal: {
            guruId: req.user.guruId
          }
        },
        _count: {
          _all: true
        },
        orderBy: {
          tanggal: 'desc'
        },
        take: 5
      });

      // Dapatkan detail untuk setiap absensi
      const detailedAbsences = await Promise.all(
        absences.map(async (absence) => {
          const [hadirCount, tidakHadirCount, jadwal] = await Promise.all([
            prisma.absensi.count({
              where: {
                jadwalId: absence.jadwalId,
                tanggal: absence.tanggal,
                status: 'hadir'
              }
            }),
            prisma.absensi.count({
              where: {
                jadwalId: absence.jadwalId,
                tanggal: absence.tanggal,
                status: { not: 'hadir' }
              }
            }),
            prisma.jadwal.findUnique({
              where: { id: absence.jadwalId },
              include: {
                kelas: {
                  select: {
                    id: true,
                    namaKelas: true,
                    tingkat: true
                  }
                }
              }
            })
          ]);

          return {
            id: `${absence.jadwalId}-${absence.tanggal}`,
            jadwalId: absence.jadwalId,
            tanggal: absence.tanggal,
            kelas: jadwal?.kelas,
            hadir: hadirCount,
            tidakHadir: tidakHadirCount
          };
        })
      );

      res.status(200).json({ absences: detailedAbsences });

    } catch (error) {
      console.error('Error fetching recent absences:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}