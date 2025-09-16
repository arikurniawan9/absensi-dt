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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Laporan Absensi</h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={fetchReport} className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
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
            <div className="mb-6">
              <button
                onClick={exportToExcel}
                className="btn btn-secondary"
              >
                Ekspor ke Excel
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat laporan absensi...</p>
            </div>
          ) : reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  {reportData.map((row) => {
                    const total = row.hadir + row.izin + row.sakit + row.alpha;
                    const percentage = total > 0 ? ((row.hadir / total) * 100).toFixed(2) : 0;
                    
                    return (
                      <tr key={row.siswa.id} className="hover:bg-gray-50">
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
            <div className="text-center py-8">
              <p className="text-gray-500">Silakan isi form di atas untuk melihat laporan absensi</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}