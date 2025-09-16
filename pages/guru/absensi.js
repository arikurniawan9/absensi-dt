// pages/guru/absensi.js
import { useState, useEffect } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';
import { withGuruAuth } from '../../middleware/guruRoute';

export default function AbsensiSiswa() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [students, setStudents] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]); // New state for selected students
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false); // New state for modal visibility
  const [requestType, setRequestType] = useState(''); // 'pindah' or 'hapus'
  const [requestFormData, setRequestFormData] = useState({
    kelasTujuanId: '',
    alasan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fungsi untuk mengambil daftar kelas
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/guru/classes');
      
      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes);
      } else {
        setError(data.message || 'Gagal memuat daftar kelas');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi saat memuat kelas');
      console.error(err);
    }
  };

  // Fungsi untuk mengambil jadwal berdasarkan kelas dan tanggal
  const fetchJadwal = async (kelasId, tanggal) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/schedule?kelasId=${kelasId}&tanggal=${tanggal}`);
      
      const data = await response.json();
      
      if (response.ok) {
        setJadwal(data.jadwal);
        
        // Jika ada jadwal, ambil absensi yang sudah ada
        if (data.jadwal.length > 0) {
          fetchExistingAbsensi(data.jadwal[0].id, tanggal);
        }
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
      const response = await fetch(`/api/guru/students?kelasId=${kelasId}`);
      
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        // Inisialisasi absensi dengan status default 'hadir'
        const initialAbsensi = data.students.map(student => ({
          siswaId: student.id,
          status: 'hadir',
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
      const response = await fetch(`/api/guru/absence?jadwalId=${jadwalId}&tanggal=${tanggal}`);
      
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

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };

  const handleSelectStudent = (siswaId) => {
    if (selectedStudents.includes(siswaId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== siswaId));
    } else {
      setSelectedStudents([...selectedStudents, siswaId]);
    }
  };

  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/guru/pengajuan-siswa/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaIds: selectedStudents,
          tipePengajuan: requestType,
          kelasTujuanId: requestType === 'pindah' ? parseInt(requestFormData.kelasTujuanId) : null,
          alasan: requestFormData.alasan,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Pengajuan berhasil diajukan!');
        setIsRequestModalOpen(false);
        setSelectedStudents([]); // Clear selection
        setRequestFormData({
          kelasTujuanId: '',
          alasan: '',
        });
      } else {
        setError(data.message || 'Gagal mengajukan permintaan');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Cari jadwalId berdasarkan kelas dan tanggal
      const jadwalItem = jadwal.find(j => j.kelasId == selectedClass);

      // Validasi waktu mengajar
      if (jadwalItem) {
        const now = new Date();
        const [startHour, startMinute] = jadwalItem.jamMulai.split(':');
        const [endHour, endMinute] = jadwalItem.jamSelesai.split(':');
        
        const startTime = new Date(selectedDate);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(selectedDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        if (now < startTime || now > endTime) {
          const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          setError(`Tidak ada jam mengajar untuk hari ini, tanggal ${formattedDate}. Anda hanya bisa absen antara ${jadwalItem.jamMulai} - ${jadwalItem.jamSelesai}.`);
          setLoading(false);
          return;
        }
      }
      
      if (!jadwalItem) {
        const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        setError(`Tidak ada jam mengajar untuk hari ini, tanggal ${formattedDate}.`);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/guru/absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  // Fetch classes when component mounts
  useEffect(() => {
    fetchClasses();
  }, []);

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
                      {cls.tingkat} - {cls.namaKelas}
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
                  Daftar Siswa - Kelas {classes.find(c => c.id == selectedClass)?.tingkat} - {classes.find(c => c.id == selectedClass)?.namaKelas}
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            onChange={handleSelectAllStudents}
                            checked={students.length > 0 && selectedStudents.length === students.length}
                            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                          />
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
                      {students.map((student) => {
                        const studentAbsensi = absensi.find(a => a.siswaId === student.id) || { status: '', keterangan: '' };
                        return (
                          <tr key={student.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                      <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(student.id)}
                                                        onChange={() => handleSelectStudent(student.id)}
                                                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                      />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                      {student.nis}
                                                    </td>                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.nama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-1">
                                {['hadir', 'sakit', 'izin', 'alpha'].map((status) => {
                                  const statusColors = {
                                    hadir: 'bg-green-500 hover:bg-green-600',
                                    sakit: 'bg-blue-500 hover:bg-blue-600',
                                    izin: 'bg-yellow-500 hover:bg-yellow-600',
                                    alpha: 'bg-red-500 hover:bg-red-600',
                                  };
                                  const activeClass = studentAbsensi.status === status ? statusColors[status] : 'bg-gray-200 hover:bg-gray-300';
                                  const textColor = studentAbsensi.status === status ? 'text-white' : 'text-gray-800';

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() => handleStatusChange(student.id, status)}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeClass} ${textColor}`}
                                    >
                                      {status.charAt(0).toUpperCase()}
                                    </button>
                                  );
                                })}
                              </div>
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
                
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestType('pindah');
                      setIsRequestModalOpen(true);
                    }}
                    disabled={selectedStudents.length === 0}
                    className={`btn btn-primary ${selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Ajukan Pindah Kelas ({selectedStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestType('hapus');
                      setIsRequestModalOpen(true);
                    }}
                    disabled={selectedStudents.length === 0}
                    className={`btn btn-danger ${selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Ajukan Hapus Kelas ({selectedStudents.length})
                  </button>
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

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsRequestModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ajukan {requestType === 'pindah' ? 'Pindah Kelas' : 'Hapus Kelas'}
                </h3>
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
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {requestType === 'pindah' && (
                    <div>
                      <label htmlFor="kelasTujuanId" className="block text-sm font-medium text-gray-700 mb-1">Kelas Tujuan</label>
                      <select
                        id="kelasTujuanId"
                        name="kelasTujuanId"
                        value={requestFormData.kelasTujuanId}
                        onChange={handleRequestFormChange}
                        className="form-input"
                        required
                      >
                        <option value="">-- Pilih Kelas Tujuan --</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.tingkat} - {cls.namaKelas}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="alasan" className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                    <textarea
                      id="alasan"
                      name="alasan"
                      value={requestFormData.alasan}
                      onChange={handleRequestFormChange}
                      rows="3"
                      className="form-input"
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="btn btn-secondary"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Mengajukan...' : 'Ajukan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}

// Terapkan middleware autentikasi
export const getServerSideProps = withGuruAuth(async (ctx) => {
  return {
    props: {}
  };
});