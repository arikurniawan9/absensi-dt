// pages/admin/jadwal.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import JadwalModal from '../../components/admin/JadwalModal';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function JadwalManagement() {
  const [jadwal, setJadwal] = useState([]);
  const [guru, setGuru] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    hari: '',
    guruId: '',
    kelasId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedJadwal, setSelectedJadwal] = useState([]);

  // Fungsi untuk mengambil daftar guru
  const fetchGuru = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/jadwal/guru', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGuru(data.guru);
      }
    } catch (err) {
      console.error('Error fetching guru:', err);
    }
  };

  // Fungsi untuk mengambil daftar kelas
  const fetchKelas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/jadwal/kelas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setKelas(data.kelas);
      }
    } catch (err) {
      console.error('Error fetching kelas:', err);
    }
  };

  // Fungsi untuk mengambil daftar mata pelajaran
  const fetchMataPelajaran = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/jadwal/mata-pelajaran', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMataPelajaran(data.mataPelajaran);
      }
    } catch (err) {
      console.error('Error fetching mata pelajaran:', err);
    }
  };

  // Fungsi untuk mengambil daftar jadwal
  const fetchJadwal = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        hari: filters.hari,
        guruId: filters.guruId,
        kelasId: filters.kelasId
      }).toString();
      
      const response = await fetch(`/api/admin/jadwal?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setJadwal(data.jadwal);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Gagal mengambil data jadwal');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus jadwal
  const deleteJadwal = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/jadwal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh daftar jadwal
        fetchJadwal();
        alert('Jadwal berhasil dihapus');
      } else {
        alert(data.message || 'Gagal menghapus jadwal');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk menghapus banyak jadwal
  const handleBulkDelete = async () => {
    if (selectedJadwal.length === 0) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedJadwal.length} jadwal terpilih?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/jadwal/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedJadwal })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${data.deletedCount} jadwal berhasil dihapus.`);
        setSelectedJadwal([]); // Clear selection
        fetchJadwal(); // Refresh list
      } else {
        alert(data.message || 'Gagal menghapus jadwal terpilih.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk memilih/tidak memilih semua jadwal
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allJadwalIds = jadwal.map(j => j.id);
      setSelectedJadwal(allJadwalIds);
    } else {
      setSelectedJadwal([]);
    }
  };

  // Fungsi untuk memilih/tidak memilih jadwal individual
  const handleSelectJadwal = (e, id) => {
    if (e.target.checked) {
      setSelectedJadwal(prev => [...prev, id]);
    } else {
      setSelectedJadwal(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Fungsi untuk menangani submit form jadwal
  const handleJadwalSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingJadwal 
        ? `/api/admin/jadwal/${editingJadwal.id}` 
        : '/api/admin/jadwal';
      const method = editingJadwal ? 'PUT' : 'POST';
      
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
        // Refresh daftar jadwal
        fetchJadwal();
        // Tutup modal
        setIsModalOpen(false);
        setEditingJadwal(null);
        alert(editingJadwal ? 'Jadwal berhasil diupdate' : 'Jadwal berhasil ditambahkan');
      } else {
        alert(data.message || 'Gagal menyimpan jadwal');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk menangani perubahan filter dengan debounce
  const handleFilterChange = (name, value) => {
    // Clear timeout sebelumnya
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set timeout baru
    const newTimeout = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        [name]: value,
        page: 1 // Reset ke halaman pertama saat filter berubah
      }));
    }, 300); // 300ms debounce
    
    setSearchTimeout(newTimeout);
  };

  useEffect(() => {
    fetchGuru();
    fetchKelas();
    fetchMataPelajaran();
    fetchJadwal();
  }, [filters]);

  // Fungsi untuk mengganti halaman
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Fungsi untuk membuka modal tambah jadwal
  const handleAddJadwal = () => {
    setEditingJadwal(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal edit jadwal
  const handleEditJadwal = (jadwal) => {
    setEditingJadwal(jadwal);
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJadwal(null);
  };

  // Cleanup timeout saat komponen unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <AdminLayout title="Jadwal Mengajar">
      {/* Modal Popup */}
      <JadwalModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jadwalData={editingJadwal}
        guruList={guru}
        kelasList={kelas}
        mataPelajaranList={mataPelajaran}
        onSubmit={handleJadwalSubmit}
      />
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Daftar Jadwal Mengajar</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleAddJadwal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1"
              title="Tambah Jadwal"
            >
              <FaPlus />
              <span className="ml-1">Tambah</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedJadwal.length === 0}
              className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1 ${selectedJadwal.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`Hapus Terpilih (${selectedJadwal.length})`}
            >
              <FaTrash />
              {selectedJadwal.length > 0 && (
                <span className="ml-1">({selectedJadwal.length})</span>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Filter */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Cari
              </label>
              <input
                type="text"
                id="search"
                placeholder="Cari guru, kelas, atau mata pelajaran..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="hari" className="block text-sm font-medium text-gray-700 mb-1">
                Hari
              </label>
              <select
                id="hari"
                value={filters.hari}
                onChange={(e) => handleFilterChange('hari', e.target.value)}
                className="form-input"
              >
                <option value="">Semua Hari</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="guruId" className="block text-sm font-medium text-gray-700 mb-1">
                Guru
              </label>
              <select
                id="guruId"
                value={filters.guruId}
                onChange={(e) => handleFilterChange('guruId', e.target.value)}
                className="form-input"
              >
                <option value="">Semua Guru</option>
                {guru.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.kodeGuru} - {g.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                Tampilkan
              </label>
              <select
                id="limit"
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="form-input"
              >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          {/* Tabel Jadwal */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data jadwal...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={jadwal.length > 0 && selectedJadwal.length === jadwal.length}
                          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hari
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guru
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jadwal.length > 0 ? (
                      jadwal.map((j) => (
                        <tr key={j.id} className="hover:bg-gray-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <input
                              type="checkbox"
                              checked={selectedJadwal.includes(j.id)}
                              onChange={(e) => handleSelectJadwal(e, j.id)}
                              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {j.hari}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {j.jamMulai} - {j.jamSelesai}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {j.guru?.kodeGuru} - {j.guru?.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {j.kelas?.tingkat} - {j.kelas?.namaKelas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {j.mataPelajaran?.kodeMapel} - {j.mataPelajaran?.namaMapel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditJadwal(j)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center space-x-1"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteJadwal(j.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1"
                              title="Hapus"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada data jadwal yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan halaman {pagination.page} dari {pagination.totalPages}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pagination.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pagination.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(pagination.totalPages).keys()].map((pageNumber) => {
                      const page = pageNumber + 1;
                      // Tampilkan hanya beberapa halaman di sekitar halaman aktif
                      if (page === 1 || page === pagination.totalPages || (page >= pagination.page - 2 && page <= pagination.page + 2)) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              page === pagination.page
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === pagination.page - 3 || page === pagination.page + 3) {
                        return <span key={page} className="px-3 py-1 text-sm font-medium">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pagination.page === pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pagination.page === pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}