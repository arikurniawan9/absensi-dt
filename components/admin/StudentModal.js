// components/admin/StudentModal.js
import { useState, useEffect } from 'react';

export default function StudentModal({ isOpen, onClose, studentData, kelasList, onSubmit }) {
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    jenisKelamin: '',
    kelasId: '',
    tanggalLahir: '',
    alamat: '',
    noTelp: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form ketika modal dibuka atau data siswa berubah
  useEffect(() => {
    if (isOpen) {
      if (studentData) {
        setFormData({
          nis: studentData.nis || '',
          nama: studentData.nama || '',
          jenisKelamin: studentData.jenisKelamin || '',
          kelasId: studentData.kelas?.id?.toString() || '',
          tanggalLahir: studentData.tanggalLahir ? new Date(studentData.tanggalLahir).toISOString().split('T')[0] : '',
          alamat: studentData.alamat || '',
          noTelp: studentData.noTelp || ''
        });
      } else {
        setFormData({
          nis: '',
          nama: '',
          jenisKelamin: '',
          kelasId: '',
          tanggalLahir: '',
          alamat: '',
          noTelp: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, studentData]);

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
    
    if (!formData.nis.trim()) {
      newErrors.nis = 'NIS harus diisi';
    }
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama harus diisi';
    }
    
    if (!formData.jenisKelamin) {
      newErrors.jenisKelamin = 'Jenis kelamin harus dipilih';
    }
    
    if (!formData.kelasId) {
      newErrors.kelasId = 'Kelas harus dipilih';
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
      await onSubmit({
        ...formData,
        kelasId: parseInt(formData.kelasId)
      });
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
                  {studentData ? 'Edit Siswa' : 'Tambah Siswa'}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="nis" className="block text-sm font-medium text-gray-700 mb-1">
                        NIS
                      </label>
                      <input
                        type="text"
                        id="nis"
                        name="nis"
                        value={formData.nis}
                        onChange={handleChange}
                        className={`form-input ${errors.nis ? 'border-red-500' : ''}`}
                        placeholder="Masukkan NIS"
                      />
                      {errors.nis && (
                        <p className="mt-1 text-sm text-red-600">{errors.nis}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama
                      </label>
                      <input
                        type="text"
                        id="nama"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        className={`form-input ${errors.nama ? 'border-red-500' : ''}`}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.nama && (
                        <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        id="jenisKelamin"
                        name="jenisKelamin"
                        value={formData.jenisKelamin}
                        onChange={handleChange}
                        className={`form-input ${errors.jenisKelamin ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      {errors.jenisKelamin && (
                        <p className="mt-1 text-sm text-red-600">{errors.jenisKelamin}</p>
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
                        {kelasList.map(kelas => (
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
                      <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Lahir (Opsional)
                      </label>
                      <input
                        type="date"
                        id="tanggalLahir"
                        name="tanggalLahir"
                        value={formData.tanggalLahir}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat (Opsional)
                      </label>
                      <textarea
                        id="alamat"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        rows={3}
                        className="form-input"
                        placeholder="Masukkan alamat"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label htmlFor="noTelp" className="block text-sm font-medium text-gray-700 mb-1">
                        No. Telepon (Opsional)
                      </label>
                      <input
                        type="text"
                        id="noTelp"
                        name="noTelp"
                        value={formData.noTelp}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Masukkan no. telepon"
                      />
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
              {loading ? 'Menyimpan...' : (studentData ? 'Simpan Perubahan' : 'Tambah Siswa')}
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