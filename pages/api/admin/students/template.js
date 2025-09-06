// pages/api/admin/students/template.js
import { PrismaClient } from '@prisma/client';
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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Dapatkan beberapa kelas dari database untuk contoh
      const classes = await prisma.kelas.findMany({
        take: 3,
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Buat data contoh berdasarkan kelas yang ada
      const sampleData = [];
      
      if (classes.length > 0) {
        // Contoh siswa untuk kelas pertama
        sampleData.push({
          nis: '12345',
          nama: 'Budi Santoso',
          'jenis kelamin': 'Laki-laki',
          kelas: classes[0].namaKelas // Gunakan nama kelas yang sebenarnya
        });
        
        sampleData.push({
          nis: '12346',
          nama: 'Ani Putri',
          'jenis kelamin': 'Perempuan',
          kelas: classes[0].namaKelas // Gunakan nama kelas yang sebenarnya
        });
        
        // Jika ada kelas kedua, tambahkan contoh untuk kelas tersebut
        if (classes.length > 1) {
          sampleData.push({
            nis: '12347',
            nama: 'Santoso',
            'jenis kelamin': 'Laki-laki',
            kelas: classes[1].namaKelas // Gunakan nama kelas yang sebenarnya
          });
        }
      } else {
        // Jika tidak ada kelas, gunakan contoh default
        sampleData.push({
          nis: '12345',
          nama: 'Budi Santoso',
          'jenis kelamin': 'Laki-laki',
          kelas: 'A' // Format default sederhana
        });
        
        sampleData.push({
          nis: '12346',
          nama: 'Ani Putri',
          'jenis kelamin': 'Perempuan',
          kelas: 'A' // Format default sederhana
        });
      }
      
      // Buat workbook dan worksheet
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Siswa');
      
      // Tambahkan sheet dengan instruksi
      const instructionData = [
        ['INSTRUKSI PENGGUNAAN TEMPLATE:'],
        ['1. Isi kolom NIS dengan nomor induk siswa (unik)'],
        ['2. Isi kolom Nama dengan nama lengkap siswa'],
        ['3. Isi kolom Jenis Kelamin dengan "Laki-laki" atau "Perempuan"'],
        ['4. Isi kolom Kelas dengan nama kelas yang sesuai'],
        ['5. Pastikan tidak ada baris kosong di tengah data'],
        ['6. Simpan file dalam format .xlsx'],
        [''],
        ['CATATAN:'],
        ['Format kelas harus sesuai dengan data kelas yang ada di sistem'],
        ['Contoh format kelas yang valid: A, B, C, dst. (sesuai dengan nama kelas di database)']
      ];
      
      const instructionWorksheet = XLSX.utils.aoa_to_sheet(instructionData);
      XLSX.utils.book_append_sheet(workbook, instructionWorksheet, 'Instruksi');
      
      // Set headers untuk download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template-import-siswa.xlsx');
      
      // Tulis file ke response
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}