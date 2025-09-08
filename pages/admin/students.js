// pages/admin/students.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import StudentModal from '../../components/admin/StudentModal';
import MoveClassModal from '../../components/admin/MoveClassModal';
import { FaFileDownload, FaFileUpload, FaFileExport, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    kelasId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isMoveClassModalOpen, setIsMoveClassModalOpen] = useState(false);

  // Fungsi untuk mengambil daftar kelas
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  // Fungsi untuk mengambil daftar siswa
  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        kelasId: filters.kelasId
      }).toString();
      
      const response = await fetch(`/api/admin/students?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Gagal mengambil data siswa');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus siswa
  const deleteStudent = async (studentId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh daftar siswa
        fetchStudents();
        alert('Siswa berhasil dihapus');
      } else {
        alert(data.message || 'Gagal menghapus siswa');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk menghapus banyak siswa
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedStudents.length} siswa terpilih?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/students/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedStudents })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${data.deletedCount} siswa berhasil dihapus.`);
        setSelectedStudents([]); // Clear selection
        fetchStudents(); // Refresh list
      } else {
        alert(data.message || 'Gagal menghapus siswa terpilih.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk memilih/tidak memilih semua siswa
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allStudentIds = students.map(student => student.id);
      setSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };

  // Fungsi untuk memilih/tidak memilih siswa individual
  const handleSelectStudent = (e, studentId) => {
    if (e.target.checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  // Fungsi untuk menangani submit form siswa
  const handleStudentSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingStudent 
        ? `/api/admin/students/${editingStudent.id}` 
        : '/api/admin/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
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
        // Refresh daftar siswa
        fetchStudents();
        // Tutup modal
        setIsModalOpen(false);
        setEditingStudent(null);
        alert(editingStudent ? 'Siswa berhasil diupdate' : 'Siswa berhasil ditambahkan');
      } else {
        alert(data.message || 'Gagal menyimpan siswa');
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

  // Fungsi untuk menghandle import file
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset hasil import sebelumnya
    setImportResult(null);
    
    // Validasi ekstensi file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('File harus berupa Excel (.xlsx atau .xls)');
      return;
    }
    
    setImportLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setImportResult(data);
        // Refresh daftar siswa
        fetchStudents();
        alert('Import berhasil');
      } else {
        alert(data.message || 'Gagal mengimport data');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setImportLoading(false);
      // Reset input file
      e.target.value = '';
    }
  };

  // Fungsi untuk menghandle export
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/students/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Buat blob dari response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-siswa-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        alert(data.message || 'Gagal mengekspor data');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  // Fungsi untuk mendownload template
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/students/template');
      
      if (response.ok) {
        // Buat blob dari response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-siswa.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        alert(data.message || 'Gagal mendownload template');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [filters]);

  // Fungsi untuk mengganti halaman
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Fungsi untuk membuka modal tambah siswa
  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal edit siswa
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  // Fungsi untuk menutup modal pindah kelas
  const handleCloseMoveClassModal = () => {
    setIsMoveClassModalOpen(false);
    setSelectedStudents([]); // Clear selection after closing modal
  };

  // Fungsi untuk menangani pemindahan kelas siswa
  const handleMoveClass = async (studentIds, newKelasId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/students/bulk-move-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: studentIds, newKelasId })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${data.movedCount} siswa berhasil dipindahkan kelasnya.`);
        setSelectedStudents([]); // Clear selection
        fetchStudents(); // Refresh list
      } else {
        throw new Error(data.message || 'Gagal memindahkan kelas siswa.');
      }
    } catch (err) {
      console.error(err);
      throw err; // Re-throw to be caught by modal's onSubmit
    }
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
    <AdminLayout title="Data Siswa">
      {/* Modal Popup */}
      <StudentModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        studentData={editingStudent}
        kelasList={classes}
        onSubmit={handleStudentSubmit}
      />
      <MoveClassModal
        isOpen={isMoveClassModalOpen}
        onClose={handleCloseMoveClassModal}
        selectedStudentIds={selectedStudents}
        kelasList={classes}
        onSubmit={handleMoveClass}
      />
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Daftar Siswa</h3>
          <div className="flex space-x-2">
            <button
              onClick={downloadTemplate}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1"
              title="Download Template"
            >
              <FaFileDownload />
            </button>
            <label className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 cursor-pointer flex items-center space-x-1"
              title="Import Excel"
            >
              {importLoading ? 'Mengimport...' : <FaFileUpload />}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                disabled={importLoading}
              />
            </label>
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1"
              title="Export Excel"
            >
              <FaFileExport />
            </button>
            <button
              onClick={handleAddStudent}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1"
              title="Tambah Siswa"
            >
              <FaPlus />
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedStudents.length === 0}
              className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1 ${selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`Hapus Terpilih (${selectedStudents.length})`}
            >
              <FaTrash />
              {selectedStudents.length > 0 && (
                <span className="ml-1">({selectedStudents.length})</span>
              )}
            </button>
            <button
              onClick={() => setIsMoveClassModalOpen(true)}
              disabled={selectedStudents.length === 0}
              className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center space-x-1 ${selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`Pindah Kelas (${selectedStudents.length})`}
            >
              <FaEdit />
              {selectedStudents.length > 0 && (
                <span className="ml-1">({selectedStudents.length})</span>
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
                placeholder="Cari NIS atau nama..."
                defaultValue={filters.search}
                onChange={handleSearchChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="kelasId" className="block text-sm font-medium text-gray-700 mb-1">
                Kelas
              </label>
              <select
                id="kelasId"
                value={filters.kelasId}
                onChange={(e) => setFilters(prev => ({ ...prev, kelasId: e.target.value, page: 1 }))}
                className="form-input"
              >
                <option value="">Semua Kelas</option>
                {classes.map(kelas => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.tingkat} - {kelas.namaKelas}
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
                <option value="150">150</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>
          
          {/* Petunjuk Format Kelas */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Petunjuk Format Kelas:</h4>
            <p className="text-sm text-blue-700">
              Untuk import Excel, pastikan nama kelas sesuai dengan format yang ada di database. 
              Contoh format yang valid berdasarkan kelas yang tersedia: 
              {classes.length > 0 ? (
                <span className="font-medium"> {classes.slice(0, 3).map(k => `"${k.namaKelas}"`).join(', ')}</span>
              ) : (
                <span> Silakan tambahkan kelas terlebih dahulu atau gunakan format sederhana seperti "A", "B", "C"</span>
              )}
            </p>
          </div>
          
          {/* Hasil Import */}
          {importResult && (
            <div className={`mb-6 p-4 rounded-md ${importResult.results.failed > 0 ? 'bg-red-100 border border-red-400' : 'bg-green-100 border border-green-400'}`}>
              <h4 className="font-medium text-gray-900 mb-2">Hasil Import</h4>
              <p className="text-sm">
                Berhasil: {importResult.results.success}, Gagal: {importResult.results.failed}
              </p>
              {importResult.results.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Error:</p>
                  <ul className="list-disc list-inside text-sm">
                    {importResult.results.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.results.errors.length > 5 && (
                      <li>... dan {importResult.results.errors.length - 5} error lainnya</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Tabel Siswa */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data siswa...</p>
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
                          checked={students.length > 0 && selectedStudents.length === students.length}
                          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIS
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Kelamin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Dibuat
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => handleSelectStudent(e, student.id)}
                              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.nis}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.jenisKelamin || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.kelas?.tingkat} - {student.kelas?.namaKelas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center space-x-1"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteStudent(student.id)}
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
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada data siswa yang ditemukan
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