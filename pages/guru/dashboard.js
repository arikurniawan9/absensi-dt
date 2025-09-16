// pages/guru/dashboard.js
import { useState, useEffect } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';
import { withGuruAuth } from '../../middleware/guruRoute';

export default function GuruDashboard({ guruName }) {
  const [scheduleToday, setScheduleToday] = useState([]);
  const [recentAbsences, setRecentAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch jadwal hari ini
        const scheduleResponse = await fetch('/api/guru/schedule/today');
        
        const scheduleData = await scheduleResponse.json();
        
        if (scheduleResponse.ok) {
          setScheduleToday(scheduleData.schedule);
        } else {
          setError(scheduleData.message || 'Gagal memuat jadwal');
        }
        
        // Fetch riwayat absensi terbaru
        const absenceResponse = await fetch('/api/guru/absence/recent');
        
        const absenceData = await absenceResponse.json();
        
        if (absenceResponse.ok) {
          setRecentAbsences(absenceData.absences);
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <GuruLayout title="Dashboard Guru">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout title="Dashboard Guru">
      <div className="grid grid-cols-1 gap-8">
        {/* Selamat Datang */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Selamat Datang, {guruName}!</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600">
              Selamat datang di sistem absensi siswa. Gunakan menu di samping untuk mengakses fitur yang tersedia.
            </p>
          </div>
        </div>
        
        {/* Jadwal Hari Ini */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Jadwal Mengajar Hari Ini</h3>
          </div>
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {scheduleToday.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ruang
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduleToday.map((schedule) => (
                      <tr key={schedule.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {schedule.kelas?.tingkat} - {schedule.kelas?.namaKelas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.mataPelajaran?.namaMapel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.jamMulai} - {schedule.jamSelesai}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* Ruang bisa ditambahkan jika ada field untuk ruang */}
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => {
                              // Navigasi ke halaman absensi untuk jadwal ini
                              window.location.href = `/guru/absensi?jadwalId=${schedule.id}`;
                            }}
                          >
                            Absensi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada jadwal mengajar hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Riwayat Absensi Terbaru */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Riwayat Absensi Terbaru</h3>
          </div>
          <div className="p-6">
            {recentAbsences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hadir
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tidak Hadir
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAbsences.map((absence) => (
                      <tr key={absence.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {absence.kelas?.tingkat} - {absence.kelas?.namaKelas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(absence.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {absence.hadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {absence.tidakHadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => {
                              // Navigasi ke detail absensi
                              window.location.href = `/guru/absensi/detail?jadwalId=${absence.jadwalId}&tanggal=${absence.tanggal}`;
                            }}
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada data absensi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}

// Terapkan middleware autentikasi
export const getServerSideProps = withGuruAuth(async (ctx) => {
  const guruName = ctx.req.user.nama || 'Guru'; // Default to 'Guru' if name is not available
  return {
    props: {
      guruName,
    }
  };
});