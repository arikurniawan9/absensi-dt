
// pages/api/guru/jadwal/index.js
import { PrismaClient } from '@prisma/client';
import { authenticateGuruAPI } from '../../../../middleware/guruAuth';

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

  const guruId = req.user.guruId; // Ambil guruId dari sesi login

  if (req.method === 'GET') {
    try {
      const jadwal = await prisma.jadwal.findMany({
        where: { guruId },
        include: {
          kelas: true,
          mataPelajaran: true,
        },
        orderBy: { hari: 'asc', jamMulai: 'asc' },
      });
      return res.status(200).json({ jadwal });
    } catch (error) {
      console.error('Error fetching schedule for guru:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { hari, jamMulai, jamSelesai, kelasId, mataPelajaranId } = req.body;

      if (!hari || !jamMulai || !jamSelesai || !kelasId || !mataPelajaranId) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      // Validasi jadwal bentrok (menggunakan logika yang sudah diperbaiki sebelumnya)
      const conflictingJadwal = await prisma.jadwal.findFirst({
        where: {
          hari,
          jamMulai: { lt: jamSelesai },
          jamSelesai: { gt: jamMulai },
          OR: [
            { guruId: guruId },
            { kelasId: parseInt(kelasId) },
          ],
        },
      });

      if (conflictingJadwal) {
        let conflictMessage = 'Jadwal bentrok dengan yang sudah ada.';
        if (conflictingJadwal.guruId === guruId) {
          conflictMessage = `Anda sudah memiliki jadwal lain pada jam yang sama di hari ${hari}.`;
        } else if (conflictingJadwal.kelasId === parseInt(kelasId)) {
          conflictMessage = `Kelas tersebut sudah memiliki jadwal dengan guru lain pada jam yang sama di hari ${hari}.`;
        }
        return res.status(400).json({ message: conflictMessage });
      }

      const newJadwal = await prisma.jadwal.create({
        data: {
          hari,
          jamMulai,
          jamSelesai,
          guruId, // Langsung dari sesi
          kelasId: parseInt(kelasId),
          mataPelajaranId: parseInt(mataPelajaranId),
        },
      });

      return res.status(201).json({ message: 'Jadwal berhasil dibuat', jadwal: newJadwal });
    } catch (error) {
      console.error('Error creating schedule for guru:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat jadwal' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
