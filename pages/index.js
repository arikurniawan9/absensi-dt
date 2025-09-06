import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Head>
        <title>Aplikasi Absensi Siswa</title>
        <meta name="description" content="Aplikasi absensi siswa dengan role admin dan guru" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Aplikasi Absensi Siswa
          </h1>
          
          <div className="space-y-4">
            <Link href="/auth/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline text-center transition duration-300">
              Masuk
            </Link>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Sistem absensi siswa dengan dua role pengguna: Admin dan Guru
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Aplikasi Absensi Siswa. All rights reserved.</p>
      </footer>
    </div>
  );
}