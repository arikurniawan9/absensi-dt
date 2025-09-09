// pages/guru/jadwal.js
import { useState, useEffect } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';
import { withGuruAuth } from '../../middleware/guruRoute';

export default function JadwalMengajar() {
  const [jadwal, setJadwal] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state untuk menambah/edit jadwal
  const [formData, setFormData] = useState({
    id: null,
    hari: '',
    jamMulai: '',
    jamSelesai: '',
    kelasId: '',
    mataPelajaranId: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fungsi untuk mengambil data jadwal
  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/guru/jadwal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setJadwal(data.jadwal);
      } else {
        setError(data.message || 'Gagal memuat jadwal');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil data kelas
  const fetchKelas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/guru/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setKelas(data.classes);
      }
    } catch (err) {
      console.error('Gagal memuat kelas:', err);
    }
  };

  // Fungsi untuk mengambil data mata pelajaran
  const fetchMataPelajaran = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/guru/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMataPelajaran(data.subjects);
      }
    } catch (err) {
      console.error('Gagal memuat mata pelajaran:', err);
    }
  };

  useEffect(() => {
    fetchJadwal();
    fetchKelas();
    fetchMataPelajaran();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = isEditing 
        ? `/api/guru/jadwal/${formData.id}`
        : '/api/guru/jadwal';
        
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(isEditing 
          ? 'Jadwal berhasil diperbarui!' 
          : 'Jadwal berhasil ditambahkan!');
        setError('');
        setShowForm(false);
        setIsEditing(false);
        setFormData({
          id: null,
          hari: '',
          jamMulai: '',
          jamSelesai: '',
          kelasId: '',
          mataPelajaranId: ''
        });
        fetchJadwal(); // Refresh data
      } else {
        setError(data.message || 'Gagal menyimpan jadwal');
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

  const handleEdit = (jadwalItem) => {
    setFormData({
      id: jadwalItem.id,
      hari: jadwalItem.hari,
      jamMulai: jadwalItem.jamMulai,
      jamSelesai: jadwalItem.jamSelesai,
      kelasId: jadwalItem.kelasId.toString(),
      mataPelajaranId: jadwalItem.mataPelajaranId.toString()
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/guru/jadwal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Jadwal berhasil dihapus!');
        setError('');
        fetchJadwal(); // Refresh data
      } else {
        setError(data.message || 'Gagal menghapus jadwal');
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

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setFormData({
      id: null,
      hari: '',
      jamMulai: '',
      jamSelesai: '',
      kelasId: '',
      mataPelajaranId: ''
    });
  };

  return (
    <GuruLayout title="Jadwal Mengajar">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Jadwal Mengajar</h3>
          <button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setFormData({
                id: null,
                hari: '',
                jamMulai: '',
                jamSelesai: '',
                kelasId: '',
                mataPelajaranId: ''
              });
            }}
            className="btn btn-primary"
          >
            Tambah Jadwal
          </button>
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
          
          {showForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
              </h4>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hari
                    </label>
                    <select
                      name="hari"
                      value={formData.hari}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    >
                      <option value="">Pilih Hari</option>
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas
                    </label>
                    <select
                      name="kelasId"
                      value={formData.kelasId}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {kelas.map(kls => (
                        <option key={kls.id} value={kls.id}>
                          {kls.tingkat} - {kls.namaKelas}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      name="mataPelajaranId"
                      value={formData.mataPelajaranId}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {mataPelajaran.map(mapel => (
                        <option key={mapel.id} value={mapel.id}>
                          {mapel.kodeMapel} - {mapel.namaMapel}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        name="jamMulai"
                        value={formData.jamMulai}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        name="jamSelesai"
                        value={formData.jamSelesai}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Jadwal')}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {loading && jadwal.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data jadwal...</p>
            </div>
          ) : jadwal.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hari
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jadwal.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.hari}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.kelas?.tingkat} - {item.kelas?.namaKelas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.mataPelajaran?.kodeMapel} - {item.mataPelajaran?.namaMapel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.jamMulai} - {item.jamSelesai}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada jadwal mengajar</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 btn btn-primary"
              >
                Tambah Jadwal Pertama
              </button>
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  );
}

// Terapkan middleware autentikasi
export const getServerSideProps = withGuruAuth(async ({ req, res }) => {
  return {
    props: {}
  };
});