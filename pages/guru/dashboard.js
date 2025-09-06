// pages/guru/dashboard.js
import GuruLayout from '../../components/layout/GuruLayout';

export default function GuruDashboard() {
  // Data dummy untuk dashboard
  const scheduleToday = [
    { id: 1, class: 'X-A', subject: 'Matematika', time: '08:00 - 09:30', room: 'Ruang 101' },
    { id: 2, class: 'XI-B', subject: 'Fisika', time: '10:00 - 11:30', room: 'Ruang 202' },
    { id: 3, class: 'XII-C', subject: 'Kimia', time: '13:00 - 14:30', room: 'Ruang 303' },
  ];

  const recentAbsences = [
    { id: 1, class: 'X-A', date: '2023-07-14', present: 28, absent: 2 },
    { id: 2, class: 'XI-B', date: '2023-07-13', present: 25, absent: 5 },
    { id: 3, class: 'XII-C', date: '2023-07-12', present: 30, absent: 0 },
  ];

  return (
    <GuruLayout title="Dashboard Guru">
      <div className="grid grid-cols-1 gap-8">
        {/* Selamat Datang */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Selamat Datang, Guru!</h3>
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
                          {schedule.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.room}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900">
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
                          {absence.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {absence.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {absence.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {absence.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900">
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