// components/layout/GuruLayout.js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function GuruLayout({ title, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Periksa apakah pengguna sudah login dan memiliki role yang sesuai
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Decode token untuk mendapatkan informasi pengguna
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'guru') {
        router.push('/auth/login');
        return;
      }
      setUser(payload);
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('token');
    // Redirect ke halaman login
    router.push('/auth/login');
  };

  // Fungsi untuk menentukan apakah link aktif
  const isActive = (path) => {
    return router.pathname === path;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-gray-700">{user.nama || 'Guru'}</span>
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