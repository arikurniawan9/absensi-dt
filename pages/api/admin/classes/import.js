// pages/api/admin/classes/import.js
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
              if (!row['nama kelas'] || !row.tingkat || !row['tahun ajaran']) {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: Data tidak lengkap`);
                continue;
              }
              
              // Validasi tingkat
              const validTingkat = ['X', 'XI', 'XII'];
              if (!validTingkat.includes(row.tingkat)) {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: Tingkat harus X, XI, atau XII`);
                continue;
              }
              
              // Cek apakah kelas sudah ada
              const existingClass = await prisma.kelas.findFirst({
                where: { 
                  namaKelas: row['nama kelas'].toString(),
                  tingkat: row.tingkat.toString(),
                  tahunAjaran: row['tahun ajaran'].toString()
                }
              });
              
              if (existingClass) {
                results.failed++;
                results.errors.push(`Baris ${rowNum}: Kelas ${row['nama kelas']} dengan tingkat ${row.tingkat} dan tahun ajaran ${row['tahun ajaran']} sudah ada`);
                continue;
              }
              
              // Simpan data kelas
              await prisma.kelas.create({
                data: {
                  namaKelas: row['nama kelas'].toString(),
                  tingkat: row.tingkat.toString(),
                  tahunAjaran: row['tahun ajaran'].toString()
                }
              });
              
              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push(`Baris ${rowNum}: ${error.message}`);
              console.error(`Error processing row ${rowNum}:`, error);
            }
          }
          
          res.status(200).json({
            message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
            results
          });
        } catch (error) {
          console.error('Error processing file:', error);
          res.status(500).json({ message: 'Terjadi kesalahan saat memproses file: ' + error.message });
        }
      });
      
      req.pipe(bb);
    } catch (error) {
      console.error('Error in import handler:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server: ' + error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}