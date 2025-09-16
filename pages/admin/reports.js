// pages/admin/reports.js
import AdminLayout from '../../components/layout/AdminLayout';
import Link from 'next/link';

export default function AdminReports() {
  return (
    <AdminLayout title="Manajemen Laporan">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pilih Jenis Laporan</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Laporan Absensi */}
            <Link href="/admin/laporan" className="block p-6 border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors">
              <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">Laporan Absensi</h5>
              <p className="font-normal text-gray-700">Lihat dan ekspor laporan absensi siswa berdasarkan kelas dan periode.</p>
            </Link>

            {/* Tambahkan jenis laporan lain di sini di masa mendatang */}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
