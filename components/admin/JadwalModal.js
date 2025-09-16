// components/admin/JadwalModal.js
import { useState, useEffect } from 'react';

export default function JadwalModal({ isOpen, onClose, jadwalData, guruList, kelasList, mataPelajaranList, onSubmit }) {
  const [formData, setFormData] = useState({
    hari: '',
    jamMulai: '',
    jamSelesai: '',
    guruId: '',
    kelasId: '',
    mataPelajaranId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form ketika modal dibuka atau data jadwal berubah
  useEffect(() => {
    if (isOpen) {
      if (jadwalData) {
        setFormData({
          hari: jadwalData.hari || '',
          jamMulai: jadwalData.jamMulai || '',
          jamSelesai: jadwalData.jamSelesai || '',
          guruId: jadwalData.guru?.id?.toString() || '',
          kelasId: jadwalData.kelas?.id?.toString() || '',
          mataPelajaranId: jadwalData.mataPelajaran?.id?.toString() || ''
        });
      } else {
        setFormData({
          hari: '',
          jamMulai: '',
          jamSelesai: '',
          guruId: '',
          kelasId: '',
          mataPelajaranId: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, jadwalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.hari) {
      newErrors.hari = 'Hari harus dipilih';
    }
    
    if (!formData.jamMulai) {
      newErrors.jamMulai = 'Jam mulai harus diisi';
    }
    
    if (!formData.jamSelesai) {
      newErrors.jamSelesai = 'Jam selesai harus diisi';
    }
    
    if (!formData.guruId) {
      newErrors.guruId = 'Guru harus dipilih';
    }
    
    if (!formData.kelasId) {
      newErrors.kelasId = 'Kelas harus dipilih';
    }
    
    if (!formData.mataPelajaranId) {
      newErrors.mataPelajaranId = 'Mata pelajaran harus dipilih';
    }
    
    // Validasi waktu
    if (formData.jamMulai && formData.jamSelesai) {
      if (formData.jamMulai >= formData.jamSelesai) {
        newErrors.jamSelesai = 'Jam selesai harus lebih besar dari jam mulai';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      // Siapkan data untuk dikirim
      const dataToSend = {
        ...formData,
        guruId: parseInt(formData.guruId),
        kelasId: parseInt(formData.kelasId),
        mataPelajaranId: parseInt(formData.mataPelajaranId)
      };
      
      await onSubmit(dataToSend);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {jadwalData ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar'}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="hari" className="block text-sm font-medium text-gray-700 mb-1">
                        Hari
                      </label>
                      <select
                        id="hari"
                        name="hari"
                        value={formData.hari}
                        onChange={handleChange}
                        className={`form-input ${errors.hari ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Hari</option>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                      </select>
                      {errors.hari && (
                        <p className="mt-1 text-sm text-red-600">{errors.hari}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="jamMulai" className="block text-sm font-medium text-gray-700 mb-1">
                          Jam Mulai
                        </label>
                        <input
                          type="time"
                          id="jamMulai"
                          name="jamMulai"
                          value={formData.jamMulai}
                          onChange={handleChange}
                          className={`form-input ${errors.jamMulai ? 'border-red-500' : ''}`}
                        />
                        {errors.jamMulai && (
                          <p className="mt-1 text-sm text-red-600">{errors.jamMulai}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="jamSelesai" className="block text-sm font-medium text-gray-700 mb-1">
                          Jam Selesai
                        </label>
                        <input
                          type="time"
                          id="jamSelesai"
                          name="jamSelesai"
                          value={formData.jamSelesai}
                          onChange={handleChange}
                          className={`form-input ${errors.jamSelesai ? 'border-red-500' : ''}`}
                        />
                        {errors.jamSelesai && (
                          <p className="mt-1 text-sm text-red-600">{errors.jamSelesai}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="guruId" className="block text-sm font-medium text-gray-700 mb-1">
                        Guru
                      </label>
                      <select
                        id="guruId"
                        name="guruId"
                        value={formData.guruId}
                        onChange={handleChange}
                        className={`form-input ${errors.guruId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Guru</option>
                        {guruList && guruList.map(guru => (
                          <option key={guru.id} value={guru.id}>
                            {guru.kodeGuru} - {guru.nama}
                          </option>
                        ))}
                      </select>
                      {errors.guruId && (
                        <p className="mt-1 text-sm text-red-600">{errors.guruId}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="kelasId" className="block text-sm font-medium text-gray-700 mb-1">
                        Kelas
                      </label>
                      <select
                        id="kelasId"
                        name="kelasId"
                        value={formData.kelasId}
                        onChange={handleChange}
                        className={`form-input ${errors.kelasId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Kelas</option>
                        {kelasList && kelasList.map(kelas => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.tingkat} - {kelas.namaKelas}
                          </option>
                        ))}
                      </select>
                      {errors.kelasId && (
                        <p className="mt-1 text-sm text-red-600">{errors.kelasId}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="mataPelajaranId" className="block text-sm font-medium text-gray-700 mb-1">
                        Mata Pelajaran
                      </label>
                      <select
                        id="mataPelajaranId"
                        name="mataPelajaranId"
                        value={formData.mataPelajaranId}
                        onChange={handleChange}
                        className={`form-input ${errors.mataPelajaranId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Mata Pelajaran</option>
                        {mataPelajaranList && mataPelajaranList.map(mapel => (
                          <option key={mapel.id} value={mapel.id}>
                            {mapel.kodeMapel} - {mapel.namaMapel}
                          </option>
                        ))}
                      </select>
                      {errors.mataPelajaranId && (
                        <p className="mt-1 text-sm text-red-600">{errors.mataPelajaranId}</p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Menyimpan...' : (jadwalData ? 'Simpan Perubahan' : 'Tambah Jadwal')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}