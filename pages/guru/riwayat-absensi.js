// pages/guru/riwayat-absensi.js
import { useState, useEffect } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';
import { withGuruAuth } from '../../middleware/guruRoute';

export default function RiwayatAbsensi() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [absensiData, setAbsensiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fungsi untuk mengambil daftar kelas
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/guru/classes');
      
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

  // Fungsi untuk mengambil riwayat absensi berdasarkan kelas
  const fetchAbsensiHistory = async (kelasId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/absence/history?kelasId=${kelasId}`);
      
      const data = await response.json();
      
      if (response.ok) {
        setAbsensiData(data.absensi);
      } else {
        setError(data.message || 'Gagal memuat riwayat absensi');
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

  const handleClassChange = (e) => {
    const kelasId = e.target.value;
    setSelectedClass(kelasId);
    
    if (kelasId) {
      fetchAbsensiHistory(kelasId);
    } else {
      setAbsensiData([]);
    }
  };

  return (
    <GuruLayout title="Riwayat Absensi">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Riwayat Absensi</h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Kelas
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={handleClassChange}
              className="form-input"
            >
              <option value="">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.tingkat} - {cls.namaKelas}
                </option>
              ))}
            </select>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat riwayat absensi...</p>
            </div>
          ) : absensiData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
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
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {absensiData.map((absen) => (
                    <tr key={`${absen.tanggal}-${absen.kelasId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(absen.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {absen.hadir}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {absen.izin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {absen.sakit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {absen.alpha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            // Navigasi ke detail absensi
                            window.location.href = `/guru/absensi/detail?kelasId=${absen.kelasId}&tanggal=${absen.tanggal}`;
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedClass ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada data absensi untuk kelas ini</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Silakan pilih kelas untuk melihat riwayat absensi</p>
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  );
}

// Terapkan middleware autentikasi
export const getServerSideProps = withGuruAuth(async (ctx) => {
  return {
    props: {}
  };
});