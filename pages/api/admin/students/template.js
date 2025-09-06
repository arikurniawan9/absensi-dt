// pages/api/admin/students/template.js
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Buat data contoh
      const sampleData = [
        {
          nis: '12345',
          nama: 'Budi Santoso',
          'jenis kelamin': 'Laki-laki',
          kelas: 'X-A'
        },
        {
          nis: '12346',
          nama: 'Ani Putri',
          'jenis kelamin': 'Perempuan',
          kelas: 'X-A'
        }
      ];

      // Buat workbook dan worksheet
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Siswa');

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