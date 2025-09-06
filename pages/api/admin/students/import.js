// pages/api/admin/students/import.js
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../../../middleware/auth';
import * as XLSX from 'xlsx';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Middleware autentikasi
  await new Promise((resolve, reject) => {
    authenticate(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Hanya admin yang bisa mengakses
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  if (req.method === 'POST') {
    try {
      // Parse form data
      const busboy = require('busboy');
      const bb = busboy({ headers: req.headers });
      
      let fileBuffer = null;
      let fileName = '';
      
      bb.on('file', (name, file, info) => {
        const { filename } = info;
        fileName = filename;
        fileBuffer = [];
        
        file.on('data', (data) => {
          fileBuffer.push(data);
        });
      });
      
      bb.on('close', async () => {
        try {
          if (!fileBuffer) {
            return res.status(400).json({ message: 'File tidak ditemukan' });
          }
          
          // Gabungkan buffer
          const buffer = Buffer.concat(fileBuffer);
          
          // Parse Excel file
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          
          // Validasi dan proses data
          const results = {
            success: 0,
            failed: 0,
            errors: []
          };
          
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // +2 karena header dan index dimulai dari 0
            
            try {
              // Validasi data
              if (!row.nis || !row.nama || !row['jenis kelamin'] || !row.kelas) {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: Data tidak lengkap`);
                continue;
              }
              
              // Validasi jenis kelamin
              const jenisKelamin = row['jenis kelamin'];
              if (jenisKelamin !== 'Laki-laki' && jenisKelamin !== 'Perempuan') {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: Jenis kelamin harus Laki-laki atau Perempuan`);
                continue;
              }
              
              // Cari kelas berdasarkan nama
              const kelas = await prisma.kelas.findFirst({
                where: { 
                  namaKelas: row.kelas.toString()
                }
              });
              
              if (!kelas) {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: Kelas ${row.kelas} tidak ditemukan`);
                continue;
              }
              
              // Cek apakah NIS sudah ada
              const existingStudent = await prisma.siswa.findUnique({
                where: { nis: row.nis.toString() }
              });
              
              if (existingStudent) {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: NIS ${row.nis} sudah digunakan`);
                continue;
              }
              
              // Simpan data siswa
              await prisma.siswa.create({
                data: {
                  nis: row.nis.toString(),
                  nama: row.nama.toString(),
                  jenisKelamin: jenisKelamin,
                  kelasId: kelas.id
                }
              });
              
              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push(`Baris ${rowNum}: ${error.message}`);
            }
          }
          
          res.status(200).json({
            message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
            results
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Terjadi kesalahan saat memproses file' });
        }
      });
      
      req.pipe(bb);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}