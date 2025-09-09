// pages/api/guru/jadwal.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuru } from '../../middleware/guruAuth';

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
      // Dapatkan semua jadwal untuk guru yang sedang login
      const jadwal = await prisma.jadwal.findMany({
        where: {
          guruId: req.user.guruId
        },
        include: {
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
        },
        orderBy: {
          hari: 'asc',
          jamMulai: 'asc'
        }
      });

      res.status(200).json({
        jadwal
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'POST') {
    try {
      const { hari, jamMulai, jamSelesai, kelasId, mataPelajaranId } = req.body;

      // Validasi input
      if (!hari || !jamMulai || !jamSelesai || !kelasId || !mataPelajaranId) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      // Cek apakah kelas ada
      const kelas = await prisma.kelas.findUnique({
        where: { id: parseInt(kelasId) }
      });

      if (!kelas) {
        return res.status(400).json({ message: 'Kelas tidak ditemukan' });
      }

      // Cek apakah mata pelajaran ada
      const mataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: parseInt(mataPelajaranId) }
      });

      if (!mataPelajaran) {
        return res.status(400).json({ message: 'Mata pelajaran tidak ditemukan' });
      }

      // Cek apakah sudah ada jadwal yang bentrok
      const existingJadwal = await prisma.jadwal.findFirst({
        where: {
          guruId: req.user.guruId,
          hari,
          OR: [
            {
              jamMulai: {
                lte: jamSelesai
              },
              jamSelesai: {
                gte: jamMulai
              }
            }
          ]
        }
      });

      if (existingJadwal) {
        return res.status(400).json({ 
          message: 'Jadwal bentrok dengan jadwal yang sudah ada' 
        });
      }

      // Buat jadwal baru
      const newJadwal = await prisma.jadwal.create({
        data: {
          hari,
          jamMulai,
          jamSelesai,
          kelasId: parseInt(kelasId),
          guruId: req.user.guruId,
          mataPelajaranId: parseInt(mataPelajaranId)
        },
        include: {
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
        message: 'Jadwal berhasil ditambahkan',
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