// pages/admin/guru.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import GuruModal from '../../components/admin/GuruModal';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function GuruManagement() {
  const [guru, setGuru] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedGuru, setSelectedGuru] = useState([]);

  // Fungsi untuk mengambil daftar mata pelajaran
  const fetchMataPelajaran = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/mata-pelajaran', {
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

  // Fungsi untuk mengambil daftar guru
  const fetchGuru = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search
      }).toString();
      
      const response = await fetch(`/api/admin/guru?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGuru(data.guru);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Gagal mengambil data guru');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus guru
  const deleteGuru = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/guru/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh daftar guru
        fetchGuru();
        alert('Guru berhasil dihapus');
      } else {
        alert(data.message || 'Gagal menghapus guru');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk menghapus banyak guru
  const handleBulkDelete = async () => {
    if (selectedGuru.length === 0) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedGuru.length} guru terpilih?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/guru/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedGuru })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${data.deletedCount} guru berhasil dihapus.`);
        setSelectedGuru([]); // Clear selection
        fetchGuru(); // Refresh list
      } else {
        alert(data.message || 'Gagal menghapus guru terpilih.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk memilih/tidak memilih semua guru
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allGuruIds = guru.map(g => g.id);
      setSelectedGuru(allGuruIds);
    } else {
      setSelectedGuru([]);
    }
  };

  // Fungsi untuk memilih/tidak memilih guru individual
  const handleSelectGuru = (e, id) => {
    if (e.target.checked) {
      setSelectedGuru(prev => [...prev, id]);
    } else {
      setSelectedGuru(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Fungsi untuk menangani submit form guru
  const handleGuruSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingGuru 
        ? `/api/admin/guru/${editingGuru.id}` 
        : '/api/admin/guru';
      const method = editingGuru ? 'PUT' : 'POST';
      
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
        // Refresh daftar guru
        fetchGuru();
        // Tutup modal
        setIsModalOpen(false);
        setEditingGuru(null);
        alert(editingGuru ? 'Guru berhasil diupdate' : 'Guru berhasil ditambahkan');
      } else {
        alert(data.message || 'Gagal menyimpan guru');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk menangani perubahan pencarian dengan debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Clear timeout sebelumnya
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set timeout baru
    const newTimeout = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value,
        page: 1 // Reset ke halaman pertama saat pencarian berubah
      }));
    }, 300); // 300ms debounce
    
    setSearchTimeout(newTimeout);
  };

  useEffect(() => {
    fetchMataPelajaran();
    fetchGuru();
  }, [filters]);

  // Fungsi untuk mengganti halaman
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Fungsi untuk membuka modal tambah guru
  const handleAddGuru = () => {
    setEditingGuru(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal edit guru
  const handleEditGuru = (guru) => {
    setEditingGuru(guru);
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGuru(null);
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
    <AdminLayout title="Data Guru">
      {/* Modal Popup */}
      <GuruModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        guruData={editingGuru}
        mataPelajaranList={mataPelajaran}
        onSubmit={handleGuruSubmit}
      />
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Daftar Guru</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleAddGuru}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1"
              title="Tambah Guru"
            >
              <FaPlus />
              <span className="ml-1">Tambah</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedGuru.length === 0}
              className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1 ${selectedGuru.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`Hapus Terpilih (${selectedGuru.length})`}
            >
              <FaTrash />
              {selectedGuru.length > 0 && (
                <span className="ml-1">({selectedGuru.length})</span>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Filter */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Cari
              </label>
              <input
                type="text"
                id="search"
                placeholder="Cari kode guru atau nama..."
                value={filters.search}
                onChange={handleSearchChange}
                className="form-input"
              />
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
          
          {/* Tabel Guru */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data guru...</p>
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
                          checked={guru.length > 0 && selectedGuru.length === guru.length}
                          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode Guru
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guru.length > 0 ? (
                      guru.map((g) => (
                        <tr key={g.id} className="hover:bg-gray-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <input
                              type="checkbox"
                              checked={selectedGuru.includes(g.id)}
                              onChange={(e) => handleSelectGuru(e, g.id)}
                              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {g.kodeGuru}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {g.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {g.user?.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {g.mataPelajaran?.kodeMapel} - {g.mataPelajaran?.namaMapel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {g.user?.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.user?.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {g.user?.status ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditGuru(g)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center space-x-1"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteGuru(g.id)}
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
                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada data guru yang ditemukan
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