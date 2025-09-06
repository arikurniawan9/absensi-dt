import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Cek token pada setiap perubahan route
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Jika bukan halaman login, register, atau index, cek token
      if (!url.startsWith('/auth') && url !== '/') {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
        }
      }
    };

    // Cek token saat pertama kali load
    handleRouteChange(router.pathname);

    // Tambahkan event listener untuk perubahan route
    router.events.on('routeChangeStart', handleRouteChange);

    // Bersihkan event listener saat komponen unmount
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Aplikasi Absensi Siswa</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;