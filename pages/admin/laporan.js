// pages/admin/laporan.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function LaporanAbsensi() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fungsi untuk mengambil daftar kelas
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes);
      } else {
        setError(data.message || 'Gagal memuat daftar kelas');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi saat memuat kelas');
      console.error(err);
    }
  };

  // Fungsi untuk mengambil laporan absensi
  const fetchReport = async (e) => {
    e.preventDefault();
    
    if (!selectedClass || !startDate || !endDate) {
      setError('Semua field harus diisi');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/reports/attendance?kelasId=${selectedClass}&startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setReportData(data.report);
        setSuccess('Laporan berhasil diambil');
      } else {
        setError(data.message || 'Gagal memuat laporan');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes when component mounts
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fungsi untuk ekspor ke Excel
  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }
    
    // Buat CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "NIS,Nama Siswa,Hadir,Izin,Sakit,Alpha,% Kehadiran\n";
    
    // Data
    reportData.forEach(row => {
      const total = row.hadir + row.izin + row.sakit + row.alpha;
      const percentage = total > 0 ? ((row.hadir / total) * 100).toFixed(2) : 0;
      
      csvContent += `${row.siswa.nis},${row.siswa.nama},${row.hadir},${row.izin},${row.sakit},${row.alpha},${percentage}%\n`;
    });
    
    // Buat dan download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_absensi_${selectedClass}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Laporan Absensi">
      <div className="bg-white shadow rounded-lg overflow-hidden printable-area">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 print-hidden">
          <h3 className="text-lg font-medium text-gray-900">Laporan Absensi</h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 print-hidden">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 print-hidden">
              {success}
            </div>
          )}
          
          <form onSubmit={fetchReport} className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4 print-hidden">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Kelas
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.tingkat} - {cls.namaKelas}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Memuat...' : 'Tampilkan Laporan'}
              </button>
            </div>
          </form>
          
          {reportData.length > 0 && (
            <div className="mb-6 flex space-x-2 print-hidden">
              <button
                onClick={exportToExcel}
                className="btn btn-secondary"
              >
                Ekspor ke Excel
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-primary"
              >
                Ekspor ke PDF
              </button>
            </div>
          )}
          
          {/* Letterhead for printing */}
          <div className="hidden print:block mb-8">
            <img src="/kopsurat.png" alt="Kop Surat" className="w-full" />
          </div>

          {/* Report Title for printing */}
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">LAPORAN ABSENSI SISWA</h1>
            {selectedClass && classes.length > 0 && (
              <h2 className="text-xl font-semibold text-gray-800">Kelas {classes.find(c => c.id === parseInt(selectedClass))?.tingkat} - {classes.find(c => c.id === parseInt(selectedClass))?.namaKelas}</h2>
            )}
            {startDate && endDate && (
              <p className="text-gray-700">Periode: {new Date(startDate).toLocaleDateString('id-ID')} s/d {new Date(endDate).toLocaleDateString('id-ID')}</p>
            )}
            <p className="text-gray-700 text-sm mt-2">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {loading ? (
            <div className="text-center py-8 print-hidden">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat laporan absensi...</p>
            </div>
          ) : reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIS
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hadir
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Izin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sakit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alpha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Kehadiran
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row, index) => {
                    const total = row.hadir + row.izin + row.sakit + row.alpha;
                    const percentage = total > 0 ? ((row.hadir / total) * 100).toFixed(2) : 0;
                    
                    return (
                      <tr key={row.siswa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.siswa.nis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.siswa.nama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {row.hadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {row.izin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          {row.sakit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {row.alpha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 print-hidden">
              <p className="text-gray-500">Silakan isi form di atas untuk melihat laporan absensi</p>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact; /* For background colors */
            print-color-adjust: exact;
            font-size: 6pt; /* Further reduce base font size */
          }
          /* Hide elements not needed in print */
          header, aside, .print-hidden {
            display: none !important;
          }
          /* Ensure main content takes full width */
          main {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .printable-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .printable-area > div:first-child {
            border: none !important;
          }
          /* Table specific print styles */
          table {
            width: 100%;
            border-collapse: collapse;
            border: none; /* Remove table border */
          }
          table thead {
            display: table-header-group;
          }
          table tr {
            page-break-inside: avoid;
          }
          table th, table td {
            padding: 4px; /* Further reduce padding */
            border: none; /* Remove cell borders */
            vertical-align: top; /* Align content to top */
            word-break: break-word; /* Allow long words to break */
          }
          table th:nth-child(1), table td:nth-child(1) { /* No. */
            width: 5%;
            text-align: center;
            font-size: 5pt; /* Smaller font for No. */
          }
          table th:nth-child(2), table td:nth-child(2) { /* NIS */
            width: 12%;
            font-size: 5pt; /* Further reduce font size for NIS */
          }
          table th:nth-child(3), table td:nth-child(3) { /* Nama Siswa */
            width: 28%;
            font-size: 5pt; /* Further reduce font size for Nama Siswa */
          }
          table th:nth-child(4), table td:nth-child(4), /* Hadir */
          table th:nth-child(5), table td:nth-child(5), /* Izin */
          table th:nth-child(6), table td:nth-child(6), /* Sakit */
          table th:nth-child(7), table td:nth-child(7)  /* Alpha */
          {
            width: 8%; /* Give fixed width to count columns */
            text-align: center;
          }
          table th:last-child, table td:last-child {
            width: 15%; /* Give more space to percentage column */
            text-align: center;
            white-space: normal; /* Allow text to wrap */
            word-break: break-word; /* Break long words */
          }
          /* Adjust font sizes for report content */
          h1 {
            font-size: 14pt !important;
          }
          h2 {
            font-size: 10pt !important;
          }
          p, span, div {
            font-size: 6pt !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}