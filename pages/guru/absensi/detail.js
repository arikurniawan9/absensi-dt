// pages/guru/absensi/detail.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GuruLayout from '../../../components/layout/GuruLayout';
import { withGuruAuth } from '../../../middleware/guruRoute';

import { FaPrint, FaArrowLeft } from 'react-icons/fa';

export default function DetailAbsensi() {
  const router = useRouter();
  const { kelasId, tanggal } = router.query;
  
  const [absensi, setAbsensi] = useState([]);
  const [kelas, setKelas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fungsi untuk mengambil detail absensi
  const fetchAbsensiDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Dapatkan detail kelas
      const kelasResponse = await fetch(`/api/admin/classes/${kelasId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const kelasData = await kelasResponse.json();
      
      if (kelasResponse.ok) {
        setKelas(kelasData.class);
      }
      
      // Dapatkan detail absensi
      const response = await fetch(`/api/guru/absence/detail?kelasId=${kelasId}&tanggal=${tanggal}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAbsensi(data.absensi);
      } else {
        setError(data.message || 'Gagal memuat detail absensi');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kelasId && tanggal) {
      fetchAbsensiDetail();
    }
  }, [kelasId, tanggal]);

  // Ganti judul dokumen saat akan mencetak
  useEffect(() => {
    if (!kelas) return;

    const originalTitle = document.title;
    const printTitle = `Laporan Absensi - Kelas ${kelas.tingkat} ${kelas.namaKelas}`;

    const handleBeforePrint = () => {
      document.title = printTitle;
    };

    const handleAfterPrint = () => {
      document.title = originalTitle;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.title = originalTitle;
    };
  }, [kelas, tanggal]);

  // Format tanggal untuk ditampilkan
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <GuruLayout title="Detail Absensi">
      <div className="bg-white shadow rounded-lg overflow-hidden printable-area">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center print-hidden">
          <h3 className="text-lg font-medium text-gray-900">Detail Absensi</h3>
          <div className="flex items-center space-x-4">
            {/* Print Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={() => window.print()}
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                aria-label="Cetak ke PDF"
              >
                <FaPrint size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Cetak ke PDF
              </div>
            </div>

            {/* Back Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full shadow-md hover:shadow-lg hover:bg-gray-300 hover:scale-105 transition-all duration-300"
                aria-label="Kembali"
              >
                <FaArrowLeft size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Kembali
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 print-hidden">
              {error}
            </div>
          )}
          
          {/* Letterhead for printing */}
          <div className="hidden print:block mb-8">
            <img src="/kopsurat.png" alt="Kop Surat" className="w-full" />
          </div>

          {kelas && tanggal && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900">
                Kelas {kelas.tingkat} - {kelas.namaKelas}
              </h4>
              <p className="text-gray-600">
                Tanggal: {formatDate(tanggal)}
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8 print-hidden">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat detail absensi...</p>
            </div>
          ) : absensi.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIS
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {absensi.map((item, index) => (
                    <tr key={item.siswa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.siswa.nis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.siswa.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'hadir' ? 'bg-green-100 text-green-800' :
                          item.status === 'izin' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'sakit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.keterangan || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading && kelasId && tanggal ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada data absensi untuk kelas dan tanggal ini</p>
            </div>
          ) : null}
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-hidden, header, aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-area {
            box-shadow: none !important;
            border: none !important;
          }
          .printable-area > div:first-child {
            border: none !important;
          }
        }
      `}</style>
    </GuruLayout>
  );
}

// Terapkan middleware autentikasi
export const getServerSideProps = withGuruAuth(async (ctx) => {
  return {
    props: {}
  };
});