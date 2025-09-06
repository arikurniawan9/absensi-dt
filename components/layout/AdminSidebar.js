// components/layout/AdminSidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminSidebar() {
  const router = useRouter();
  
  // Fungsi untuk menentukan apakah link aktif
  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Menu Utama</h3>
      </div>
      <div className="p-6">
        <nav className="space-y-2">
          <Link 
            href="/admin/dashboard" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/dashboard') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/users') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Manajemen Pengguna
          </Link>
          <Link 
            href="/admin/students" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/students') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Data Siswa
          </Link>
          <Link 
            href="/admin/teachers" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/teachers') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Data Guru
          </Link>
          <Link 
            href="/admin/classes" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/classes') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Data Kelas
          </Link>
          <Link 
            href="/admin/subjects" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/subjects') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Data Mata Pelajaran
          </Link>
          <Link 
            href="/admin/activity-log" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/activity-log') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Log Aktivitas
          </Link>
          <Link 
            href="/admin/reports" 
            className={`block px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/admin/reports') 
                ? 'text-white bg-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Laporan
          </Link>
        </nav>
      </div>
    </div>
  );
}