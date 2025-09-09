// pages/api/guru/absence/index.js
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
      const { jadwalId, tanggal } = req.query;
      
      if (!jadwalId || !tanggal) {
        return res.status(400).json({ message: 'Jadwal ID dan tanggal harus diisi' });
      }

      // Cari absensi berdasarkan jadwalId dan tanggal
      const absensi = await prisma.absensi.findMany({
        where: {
          jadwalId: parseInt(jadwalId),
          tanggal: new Date(tanggal)
        }
      });

      res.status(200).json({
        absensi
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else if (req.method === 'POST') {
    try {
      const { jadwalId, tanggal, kelasId, absensi } = req.body;
      
      if (!jadwalId || !tanggal || !kelasId || !absensi || !Array.isArray(absensi)) {
        return res.status(400).json({ message: 'Data absensi tidak lengkap' });
      }

      // Dapatkan tanggal dalam format Date
      const absensiDate = new Date(tanggal);

      // Hapus absensi yang sudah ada untuk jadwal dan tanggal ini
      await prisma.absensi.deleteMany({
        where: {
          jadwalId: parseInt(jadwalId),
          tanggal: absensiDate
        }
      });

      // Simpan absensi baru
      const newAbsensi = await Promise.all(
        absensi.map(async (item) => {
          if (item.status) { // Hanya simpan jika status tidak kosong
            return await prisma.absensi.create({
              data: {
                tanggal: absensiDate,
                status: item.status,
                keterangan: item.keterangan || null,
                siswaId: item.siswaId,
                jadwalId: parseInt(jadwalId),
                kelasId: parseInt(kelasId)
              }
            });
          }
          return null;
        })
      );

      // Filter out null values
      const filteredAbsensi = newAbsensi.filter(item => item !== null);

      res.status(201).json({
        message: 'Absensi berhasil disimpan',
        absensi: filteredAbsensi
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}