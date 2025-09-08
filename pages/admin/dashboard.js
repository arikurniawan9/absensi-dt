// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentActivities from '../../components/admin/RecentActivities';

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');

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

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

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
    </AdminLayout>
  );
}