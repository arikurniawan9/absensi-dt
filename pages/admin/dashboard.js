// pages/admin/dashboard.js
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentActivities from '../../components/admin/RecentActivities';

export default function AdminDashboard() {
  // Data dummy untuk dashboard
  const stats = [
    { name: 'Total Siswa', value: '142' },
    { name: 'Total Guru', value: '12' },
    { name: 'Total Kelas', value: '6' },
    { name: 'Total Mata Pelajaran', value: '15' },
  ];

  const recentActivities = [
    { id: 1, user: 'Budi Santoso', action: 'Login', time: '2 menit yang lalu' },
    { id: 2, user: 'Ani Putri', action: 'Menginput absensi kelas X-A', time: '15 menit yang lalu' },
    { id: 3, user: 'Joko Widodo', action: 'Login', time: '1 jam yang lalu' },
    { id: 4, user: 'Siti Nurhaliza', action: 'Menginput absensi kelas XI-B', time: '2 jam yang lalu' },
  ];

  return (
    <AdminLayout title="Dashboard Admin">
      <Head>
        <title>Dashboard Admin - Aplikasi Absensi Siswa</title>
        <meta name="description" content="Dashboard admin aplikasi absensi siswa" />
      </Head>

      {/* Stats Section */}
      <div className="mb-8">
        <DashboardStats stats={stats} />
      </div>

      {/* Recent Activities */}
      <RecentActivities activities={recentActivities} />
    </AdminLayout>
  );
}