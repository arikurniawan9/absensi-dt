// pages/api/admin/reports/attendance.js
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

  if (req.method === 'GET') {
    try {
      const { kelasId, startDate, endDate } = req.query;
      
      if (!kelasId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Kelas ID, tanggal mulai, dan tanggal selesai harus diisi' });
      }

      // Validasi format tanggal
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Format tanggal tidak valid' });
      }
      
      if (start > end) {
        return res.status(400).json({ message: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' });
      }

      // Dapatkan daftar siswa dalam kelas
      const students = await prisma.siswa.findMany({
        where: {
          kelasId: parseInt(kelasId)
        },
        orderBy: {
          nama: 'asc'
        }
      });

      // Untuk setiap siswa, hitung jumlah absensi berdasarkan status
      const report = await Promise.all(
        students.map(async (student) => {
          const hadir = await prisma.absensi.count({
            where: {
              siswaId: student.id,
              tanggal: {
                gte: start,
                lte: end
              },
              status: 'hadir'
            }
          });

          const izin = await prisma.absensi.count({
            where: {
              siswaId: student.id,
              tanggal: {
                gte: start,
                lte: end
              },
              status: 'izin'
            }
          });

          const sakit = await prisma.absensi.count({
            where: {
              siswaId: student.id,
              tanggal: {
                gte: start,
                lte: end
              },
              status: 'sakit'
            }
          });

          const alpha = await prisma.absensi.count({
            where: {
              siswaId: student.id,
              tanggal: {
                gte: start,
                lte: end
              },
              status: 'alpha'
            }
          });

          return {
            siswa: {
              id: student.id,
              nis: student.nis,
              nama: student.nama
            },
            hadir,
            izin,
            sakit,
            alpha
          };
        })
      );

      res.status(200).json({
        report
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}