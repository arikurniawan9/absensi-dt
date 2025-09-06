// components/layout/AdminHeader.js
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminHeader({ title }) {
  const router = useRouter();

  const handleLogout = () => {
    // Hapus token dari localStorage atau cookies
    // Di sini kita hanya redirect ke halaman login
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Admin</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}