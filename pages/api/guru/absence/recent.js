// pages/api/guru/absence/recent.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuru } from '../../../middleware/guruAuth';

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
  // Middleware autentikasi guru
  await new Promise((resolve, reject) => {
    authenticateGuru(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method === 'GET') {
    try {
      // Dapatkan 5 absensi terbaru berdasarkan guruId dari token
      const absences = await prisma.absensi.groupBy({
        by: ['jadwalId', 'tanggal', 'kelasId'],
        where: {
          jadwal: {
            guruId: req.user.guruId
          }
        },
        _count: {
          _all: true,
          status: true
        },
        orderBy: {
          tanggal: 'desc'
        },
        take: 5
      });

      // Dapatkan detail untuk setiap absensi
      const detailedAbsences = await Promise.all(
        absences.map(async (absence) => {
          // Hitung jumlah hadir dan tidak hadir
          const hadirCount = await prisma.absensi.count({
            where: {
              jadwalId: absence.jadwalId,
              tanggal: absence.tanggal,
              status: 'hadir'
            }
          });

          const tidakHadirCount = await prisma.absensi.count({
            where: {
              jadwalId: absence.jadwalId,
              tanggal: absence.tanggal,
              status: {
                not: 'hadir'
              }
            }
          });

          // Dapatkan detail jadwal
          const jadwal = await prisma.jadwal.findUnique({
            where: {
              id: absence.jadwalId
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

          return {
            id: absence.jadwalId,
            jadwalId: absence.jadwalId,
            tanggal: absence.tanggal,
            kelas: jadwal?.kelas,
            hadir: hadirCount,
            tidakHadir: tidakHadirCount
          };
        })
      );

      res.status(200).json({
        absences: detailedAbsences
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}