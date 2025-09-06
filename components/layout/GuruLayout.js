// components/layout/GuruLayout.js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function GuruLayout({ title, children }) {
  const router = useRouter();

  const handleLogout = () => {
    // Hapus token dari localStorage atau cookies
    // Di sini kita hanya redirect ke halaman login
    router.push('/auth/login');
  };

  // Fungsi untuk menentukan apakah link aktif
  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} - Aplikasi Absensi Siswa</title>
        <meta name="description" content="Aplikasi absensi siswa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Guru</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Navigasi */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Menu Guru</h3>
              </div>
              <div className="p-6">
                <nav className="space-y-2">
                  <Link 
                    href="/guru/dashboard" 
                    className={`block px-4 py-2 text-sm font-medium rounded-md ${
                      isActive('/guru/dashboard') 
                        ? 'text-white bg-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/guru/absensi" 
                    className={`block px-4 py-2 text-sm font-medium rounded-md ${
                      isActive('/guru/absensi') 
                        ? 'text-white bg-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Absensi Siswa
                  </Link>
                  <Link 
                    href="/guru/profile" 
                    className={`block px-4 py-2 text-sm font-medium rounded-md ${
                      isActive('/guru/profile') 
                        ? 'text-white bg-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Pengaturan Akun
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}