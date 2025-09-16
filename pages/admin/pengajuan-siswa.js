// pages/admin/pengajuan-siswa.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function PengajuanSiswaAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pengajuan-siswa', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data.pengajuan);
      } else {
        setError(data.message || 'Gagal memuat pengajuan');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcessRequest = async (id, status) => {
    if (!confirm(`Apakah Anda yakin ingin ${status === 'diterima' ? 'menerima' : 'menolak'} pengajuan ini?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/pengajuan-siswa/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setError('');
        fetchRequests(); // Refresh list
      } else {
        setError(data.message || 'Gagal memproses pengajuan');
        setSuccess('');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      setSuccess('');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <AdminLayout title="Manajemen Pengajuan Siswa">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Daftar Pengajuan Siswa</h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat pengajuan...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada pengajuan siswa yang ditemukan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas Asal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Pengajuan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas Tujuan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diajukan Oleh</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(req.tanggalPengajuan)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.siswa.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.kelasAsal.tingkat} - {req.kelasAsal.namaKelas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.tipePengajuan === 'pindah' ? 'Pindah Kelas' : 'Hapus Kelas'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.kelasTujuan ? `${req.kelasTujuan.tingkat} - ${req.kelasTujuan.namaKelas}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.alasan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.diajukanOleh.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'diterima' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {req.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleProcessRequest(req.id, 'diterima')}
                              className="text-green-600 hover:text-green-900"
                              title="Terima Pengajuan"
                            >
                              <FaCheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleProcessRequest(req.id, 'ditolak')}
                              className="text-red-600 hover:text-red-900"
                              title="Tolak Pengajuan"
                            >
                              <FaTimesCircle size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
