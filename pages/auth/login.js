import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validasi sederhana
    if (!loginData.username || !loginData.password) {
      setError('Username dan password harus diisi');
      return;
    }
    
    // Simulasi proses login
    // Di aplikasi sebenarnya, ini akan mengirim request ke API
    try {
      // Untuk demo, kita akan redirect ke dashboard admin
      // Di aplikasi sebenarnya, ini akan tergantung pada role pengguna
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Login gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Head>
        <title>Login - Aplikasi Absensi Siswa</title>
        <meta name="description" content="Login ke aplikasi absensi siswa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
            <p className="text-gray-600 mt-2">Masuk ke aplikasi absensi siswa</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Masuk
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Kembali ke halaman utama
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Aplikasi Absensi Siswa. All rights reserved.</p>
      </footer>
    </div>
  );
}