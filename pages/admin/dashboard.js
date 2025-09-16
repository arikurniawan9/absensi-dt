// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentActivities from '../../components/admin/RecentActivities';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState('');

  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setStats([
          { name: 'Total Siswa', value: data.totalStudents },
          { name: 'Total Kelas', value: data.totalClasses },
          { name: 'Total Pengguna', value: data.totalUsers },
          { name: 'Pengajuan Tertunda', value: data.totalPendingRequests },
        ]);
      } else {
        setStatsError(data.message || 'Gagal mengambil statistik dashboard');
      }
    } catch (err) {
      setStatsError('Terjadi kesalahan koneksi saat mengambil statistik');
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    setActivitiesError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/activity-log?limit=5', { // Fetch last 5 activities
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setActivities(data.logs);
      } else {
        setActivitiesError(data.message || 'Gagal mengambil log aktivitas');
      }
    } catch (err) {
      setActivitiesError('Terjadi kesalahan koneksi saat mengambil log aktivitas');
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    setRequestsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingRequests(data.requests);
      } else {
        setRequestsError(data.message || 'Gagal mengambil pengajuan tertunda');
      }
    } catch (err) {
      setRequestsError('Terjadi kesalahan koneksi saat mengambil pengajuan tertunda');
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchActivities();
    fetchPendingRequests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <AdminLayout title="Dashboard Admin">
      <Head>
        <title>Dashboard Admin - Aplikasi Absensi Siswa</title>
        <meta name="description" content="Dashboard admin aplikasi absensi siswa" />
      </Head>

      {/* Stats Section */}
      <div className="mb-8">
        {loadingStats ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat statistik...</p>
          </div>
        ) : statsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {statsError}
          </div>
        ) : (
          <DashboardStats stats={stats} />
        )}
      </div>

      {/* Recent Activities */}
      <div className="mb-8">
        {loadingActivities ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat aktivitas terbaru...</p>
          </div>
        ) : activitiesError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {activitiesError}
          </div>
        ) : (
          <RecentActivities activities={activities} />
        )}
      </div>

      {/* Recent Pending Requests */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pengajuan Siswa Tertunda Terbaru</h3>
        </div>
        <div className="p-6">
          {loadingRequests ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat pengajuan tertunda...</p>
            </div>
          ) : requestsError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {requestsError}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada pengajuan siswa tertunda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diajukan Oleh</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map(req => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(req.tanggalPengajuan)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.siswa.nama} ({req.siswa.nis})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.tipePengajuan === 'pindah' ? `Pindah ke ${req.kelasTujuan.tingkat} - ${req.kelasTujuan.namaKelas}` : 'Hapus Kelas'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.diajukanOleh.nama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <Link href="/admin/pengajuan-siswa" className="text-blue-600 hover:text-blue-800 font-medium">
                  Lihat Semua Pengajuan &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}