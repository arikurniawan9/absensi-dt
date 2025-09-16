// pages/api/admin/jadwal/index.js
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

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search, hari, guruId, kelasId } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build filter conditions
      let where = {};
      
      // Filter berdasarkan pencarian
      if (search) {
        where.OR = [
          { guru: { nama: { contains: search } } },
          { kelas: { namaKelas: { contains: search } } },
          { mataPelajaran: { namaMapel: { contains: search } } }
        ];
      }
      
      // Filter berdasarkan hari
      if (hari) {
        where.hari = hari;
      }
      
      // Filter berdasarkan guru
      if (guruId) {
        where.guruId = parseInt(guruId);
      }
      
      // Filter berdasarkan kelas
      if (kelasId) {
        where.kelasId = parseInt(kelasId);
      }

      // Dapatkan daftar jadwal dengan pagination
      const [jadwal, total] = await Promise.all([
        prisma.jadwal.findMany({
          where,
          skip: offset,
          take: parseInt(limit),
          orderBy: [
            { hari: 'asc' },
            { jamMulai: 'asc' }
          ],
          include: {
            guru: {
              select: {
                id: true,
                kodeGuru: true,
                nama: true
              }
            },
            kelas: {
              select: {
                id: true,
                namaKelas: true,
                tingkat: true
              }
            },
            mataPelajaran: {
              select: {
                id: true,
                kodeMapel: true,
                namaMapel: true
              }
            }
          }
        }),
        prisma.jadwal.count({ where })
      ]);

      res.status(200).json({
        jadwal,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'POST') {
    try {
      const { hari, jamMulai, jamSelesai, guruId, kelasId, mataPelajaranId } = req.body;

      // Validasi input
      if (!hari || !jamMulai || !jamSelesai || !guruId || !kelasId || !mataPelajaranId) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      // Cek apakah guru, kelas, dan mata pelajaran ada
      const [guru, kelas, mataPelajaran] = await Promise.all([
        prisma.guru.findUnique({
          where: { id: parseInt(guruId) }
        }),
        prisma.kelas.findUnique({
          where: { id: parseInt(kelasId) }
        }),
        prisma.mataPelajaran.findUnique({
          where: { id: parseInt(mataPelajaranId) }
        })
      ]);

      if (!guru || !kelas || !mataPelajaran) {
        return res.status(400).json({ message: 'Guru, kelas, atau mata pelajaran tidak ditemukan' });
      }

      // Cek apakah guru atau kelas sudah ada jadwal yang bentrok di waktu yang sama
      const conflictingJadwal = await prisma.jadwal.findFirst({
        where: {
          hari,
          // Waktu tumpang tindih: (mulaiA < selesaiB) dan (selesaiA > mulaiB)
          jamMulai: {
            lt: jamSelesai, // Jam mulai jadwal baru lebih kecil dari jam selesai jadwal lama
          },
          jamSelesai: {
            gt: jamMulai, // Jam selesai jadwal baru lebih besar dari jam mulai jadwal lama
          },
          OR: [
            { guruId: parseInt(guruId) }, // Guru yang sama mengajar di kelas lain pada waktu yang sama
            { kelasId: parseInt(kelasId) }, // Kelas yang sama diajar oleh guru lain pada waktu yang sama
          ],
        },
      });

      if (conflictingJadwal) {
        let conflictMessage = 'Jadwal bentrok dengan yang sudah ada.';
        if (conflictingJadwal.guruId === parseInt(guruId)) {
          conflictMessage = `Guru tersebut sudah memiliki jadwal lain pada jam yang sama di hari ${hari}.`;
        } else if (conflictingJadwal.kelasId === parseInt(kelasId)) {
          conflictMessage = `Kelas tersebut sudah memiliki jadwal lain pada jam yang sama di hari ${hari}.`;
        }
        return res.status(400).json({ 
          message: conflictMessage
        });
      }

      // Buat jadwal baru
      const newJadwal = await prisma.jadwal.create({
        data: {
          hari,
          jamMulai,
          jamSelesai,
          guruId: parseInt(guruId),
          kelasId: parseInt(kelasId),
          mataPelajaranId: parseInt(mataPelajaranId)
        },
        include: {
          guru: {
            select: {
              id: true,
              kodeGuru: true,
              nama: true
            }
          },
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tingkat: true
            }
          },
          mataPelajaran: {
            select: {
              id: true,
              kodeMapel: true,
              namaMapel: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Jadwal berhasil dibuat',
        jadwal: newJadwal
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
