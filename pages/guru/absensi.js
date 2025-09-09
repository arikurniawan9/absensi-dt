// pages/guru/absensi.js
import { useState, useEffect } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';
import { withGuruAuth } from '../../middleware/guruRoute';

export default function AbsensiSiswa() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [jadwal, setJadwal] = useState([]);
  const [students, setStudents] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data dummy untuk kelas
  const classes = [
    { id: 1, name: 'X-A', tingkat: 'X' },
    { id: 2, name: 'X-B', tingkat: 'X' },
    { id: 3, name: 'XI-A', tingkat: 'XI' },
    { id: 4, name: 'XI-B', tingkat: 'XI' },
    { id: 5, name: 'XII-A', tingkat: 'XII' },
    { id: 6, name: 'XII-B', tingkat: 'XII' },
  ];
  
  // Fungsi untuk mengambil jadwal berdasarkan kelas dan tanggal
  const fetchJadwal = async (kelasId, tanggal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/guru/schedule?kelasId=${kelasId}&tanggal=${tanggal}`, {
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
  
  // Fungsi untuk mengambil daftar siswa berdasarkan kelas
  const fetchStudents = async (kelasId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/guru/students?kelasId=${kelasId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        // Inisialisasi absensi dengan status kosong
        const initialAbsensi = data.students.map(student => ({
          siswaId: student.id,
          status: '',
          keterangan: ''
        }));
        setAbsensi(initialAbsensi);
      } else {
        setError(data.message || 'Gagal memuat daftar siswa');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk mengambil absensi yang sudah ada
  const fetchExistingAbsensi = async (jadwalId, tanggal) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/guru/absence?jadwalId=${jadwalId}&tanggal=${tanggal}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update state absensi dengan data yang sudah ada
        const existingAbsensi = data.absensi.reduce((acc, item) => {
          acc[item.siswaId] = {
            status: item.status,
            keterangan: item.keterangan || ''
          };
          return acc;
        }, {});
        
        setAbsensi(prev => prev.map(absen => ({
          ...absen,
          ...existingAbsensi[absen.siswaId]
        })));
      }
    } catch (err) {
      console.error('Gagal memuat absensi yang sudah ada:', err);
    }
  };
  
  const handleStatusChange = (siswaId, status) => {
    setAbsensi(prev => prev.map(absen => 
      absen.siswaId === siswaId ? { ...absen, status } : absen
    ));
  };
  
  const handleKeteranganChange = (siswaId, keterangan) => {
    setAbsensi(prev => prev.map(absen => 
      absen.siswaId === siswaId ? { ...absen, keterangan } : absen
    ));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Cari jadwalId berdasarkan kelas dan tanggal
      const jadwalItem = jadwal.find(j => j.kelasId == selectedClass);
      if (!jadwalItem) {
        setError('Jadwal tidak ditemukan untuk kelas dan tanggal yang dipilih');
        return;
      }
      
      const response = await fetch('/api/guru/absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jadwalId: jadwalItem.id,
          tanggal: selectedDate,
          kelasId: selectedClass,
          absensi: absensi
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Absensi berhasil disimpan!');
      } else {
        setError(data.message || 'Gagal menyimpan absensi');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menampilkan siswa ketika kelas dan tanggal dipilih
  const handleShowStudents = () => {
    if (selectedClass && selectedDate) {
      fetchJadwal(selectedClass, selectedDate);
      fetchStudents(selectedClass);
    }
  };

  return (
    <GuruLayout title="Absensi Siswa">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Form Absensi Siswa</h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Kelas
                </label>
                <select
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.tingkat} - {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleShowStudents}
                  disabled={!selectedClass || !selectedDate || loading}
                  className={`btn btn-primary ${(!selectedClass || !selectedDate || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Memuat...' : 'Tampilkan Siswa'}
                </button>
              </div>
            </div>
            
            {selectedClass && selectedDate && students.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Daftar Siswa - Kelas {classes.find(c => c.id == selectedClass)?.tingkat} - {classes.find(c => c.id == selectedClass)?.name}
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                      {students.map((student) => {
                        const studentAbsensi = absensi.find(a => a.siswaId === student.id) || { status: '', keterangan: '' };
                        return (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.nis}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.nama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <select
                                value={studentAbsensi.status}
                                onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                className="form-input"
                              >
                                <option value="">Pilih Status</option>
                                <option value="hadir">Hadir</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="alpha">Alpha</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <input
                                type="text"
                                value={studentAbsensi.keterangan}
                                onChange={(e) => handleKeteranganChange(student.id, e.target.value)}
                                placeholder="Keterangan (opsional)"
                                className="form-input"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Absensi'}
                  </button>
                </div>
              </div>
            )}
          </form>
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