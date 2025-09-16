// components/layout/GuruLayout.js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';

export default function GuruLayout({ title, children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guruName, setGuruName] = useState('...'); // Default name while loading

  useEffect(() => {
    const fetchGuruProfile = async () => {
      try {
        const response = await fetch('/api/guru/profile');
        if (response.ok) {
          const data = await response.json();
          setGuruName(data.guru.nama);
        } else {
          // Handle error, maybe redirect to login if unauthorized
          console.error('Failed to fetch guru profile');
          setGuruName('Guru');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setGuruName('Guru');
      }
    };

    fetchGuruProfile();
  }, []);

  const handleLogout = () => {
    // Hapus token atau sesi di sini jika ada
    router.push('/auth/guru/login');
  };

  const isActive = (path) => {
    return router.pathname.startsWith(path);
  };

  const navLinks = [
    { href: '/guru/dashboard', label: 'Dashboard' },
    { href: '/guru/absensi', label: 'Absensi Siswa' },
    { href: '/guru/riwayat-absensi', label: 'Riwayat Absensi' },
    { href: '/guru/jadwal', label: 'Jadwal Mengajar' },
    { href: '/guru/profile', label: 'Pengaturan Akun' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} - Aplikasi Absensi Siswa</title>
        <meta name="description" content="Aplikasi absensi siswa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Menu Guru</h3>
        </div>
        <div className="p-4">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.href)
                    ? 'text-white bg-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)} // Close sidebar on link click
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-700 p-2 rounded-md hover:bg-gray-100 lg:hidden"
                  aria-label="Open sidebar"
                >
                  <FaBars size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 ml-2 lg:ml-0">{title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 hidden sm:block">{guruName || 'Nama Guru'}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}