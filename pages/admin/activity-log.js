// pages/admin/activity-log.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    userId: '',
    activity: ''
  });

  // Fungsi untuk mengambil data log aktivitas
  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Di aplikasi sebenarnya, ini akan mengambil data dari API
      // Untuk demo, kita gunakan data dummy
      const dummyData = [
        {
          id: 1,
          userId: 1,
          activity: 'Login',
          detail: 'User berhasil login ke sistem',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2023-07-15T08:30:00Z',
          user: {
            id: 1,
            username: 'admin',
            nama: 'Administrator',
            role: 'admin'
          }
        },
        {
          id: 2,
          userId: 2,
          activity: 'Create User',
          detail: 'Membuat akun guru baru: budi_santoso',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2023-07-15T09:15:00Z',
          user: {
            id: 1,
            username: 'admin',
            nama: 'Administrator',
            role: 'admin'
          }
        },
        {
          id: 3,
          userId: 3,
          activity: 'Login',
          detail: 'User berhasil login ke sistem',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2023-07-15T10:20:00Z',
          user: {
            id: 3,
            username: 'guru1',
            nama: 'Budi Santoso',
            role: 'guru'
          }
        },
        {
          id: 4,
          userId: 3,
          activity: 'Absensi',
          detail: 'Menginput absensi kelas X-A tanggal 2023-07-15',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2023-07-15T11:30:00Z',
          user: {
            id: 3,
            username: 'guru1',
            nama: 'Budi Santoso',
            role: 'guru'
          }
        }
      ];
      
      setActivities(dummyData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  return (
    <AdminLayout title="Log Aktivitas">
      <Head>
        <title>Log Aktivitas - Aplikasi Absensi Siswa</title>
        <meta name="description" content="Log aktivitas pengguna aplikasi absensi siswa" />
      </Head>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Daftar Aktivitas</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Filter user..."
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              value={filters.userId}
              onChange={(e) => setFilters({...filters, userId: e.target.value})}
            />
            <input
              type="text"
              placeholder="Filter aktivitas..."
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              value={filters.activity}
              onChange={(e) => setFilters({...filters, activity: e.target.value})}
            />
            <button
              onClick={fetchActivities}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Filter
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data aktivitas...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktivitas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.user.nama}</div>
                        <div className="text-sm text-gray-500">{activity.user.username} ({activity.user.role})</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.activity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={activity.detail}>
                          {activity.detail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}