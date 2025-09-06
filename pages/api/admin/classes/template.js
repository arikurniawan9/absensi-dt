// pages/api/admin/classes/template.js
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Buat data contoh
      const sampleData = [
        {
          'nama kelas': 'A',
          tingkat: 'X',
          'tahun ajaran': '2023/2024'
        },
        {
          'nama kelas': 'B',
          tingkat: 'XI',
          'tahun ajaran': '2023/2024'
        }
      ];

      // Buat workbook dan worksheet
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Kelas');

      // Set headers untuk download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template-import-kelas.xlsx');

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