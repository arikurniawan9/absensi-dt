// components/admin/GuruModal.js
import { useState, useEffect } from 'react';

export default function GuruModal({ isOpen, onClose, guruData, mataPelajaranList, onSubmit }) {
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    mataPelajaranId: '',
    alamat: '',
    noTelp: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Reset form ketika modal dibuka atau data guru berubah
  useEffect(() => {
    if (isOpen) {
      if (guruData) {
        setIsEditMode(true);
        setFormData({
          nip: guruData.nip || '',
          nama: guruData.nama || '',
          mataPelajaranId: guruData.mataPelajaran?.id?.toString() || '',
          alamat: guruData.alamat || '',
          noTelp: guruData.noTelp || '',
          username: guruData.user?.username || '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setIsEditMode(false);
        setFormData({
          nip: '',
          nama: '',
          mataPelajaranId: '',
          alamat: '',
          noTelp: '',
          username: '',
          password: '',
          confirmPassword: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, guruData]);

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
    
    if (!formData.nip.trim()) {
      newErrors.nip = 'NIP harus diisi';
    }
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama harus diisi';
    }
    
    if (!formData.mataPelajaranId) {
      newErrors.mataPelajaranId = 'Mata pelajaran harus dipilih';
    }
    
    if (!isEditMode) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username harus diisi';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password harus diisi';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
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
        mataPelajaranId: parseInt(formData.mataPelajaranId)
      };
      
      // Hapus field yang tidak diperlukan saat edit
      if (isEditMode) {
        delete dataToSend.username;
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
      } else {
        delete dataToSend.confirmPassword;
      }
      
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
                  {isEditMode ? 'Edit Guru' : 'Tambah Guru'}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">
                        NIP
                      </label>
                      <input
                        type="text"
                        id="nip"
                        name="nip"
                        value={formData.nip}
                        onChange={handleChange}
                        className={`form-input ${errors.nip ? 'border-red-500' : ''}`}
                        placeholder="Masukkan NIP"
                        disabled={isEditMode}
                      />
                      {errors.nip && (
                        <p className="mt-1 text-sm text-red-600">{errors.nip}</p>
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
                        {mataPelajaranList.map(mapel => (
                          <option key={mapel.id} value={mapel.id}>
                            {mapel.kodeMapel} - {mapel.namaMapel}
                          </option>
                        ))}
                      </select>
                      {errors.mataPelajaranId && (
                        <p className="mt-1 text-sm text-red-600">{errors.mataPelajaranId}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <textarea
                        id="alamat"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className={`form-input ${errors.alamat ? 'border-red-500' : ''}`}
                        placeholder="Masukkan alamat"
                        rows="3"
                      />
                      {errors.alamat && (
                        <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="noTelp" className="block text-sm font-medium text-gray-700 mb-1">
                        No. Telepon
                      </label>
                      <input
                        type="text"
                        id="noTelp"
                        name="noTelp"
                        value={formData.noTelp}
                        onChange={handleChange}
                        className={`form-input ${errors.noTelp ? 'border-red-500' : ''}`}
                        placeholder="Masukkan no. telepon"
                      />
                      {errors.noTelp && (
                        <p className="mt-1 text-sm text-red-600">{errors.noTelp}</p>
                      )}
                    </div>
                    
                    {!isEditMode && (
                      <>
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${errors.username ? 'border-red-500' : ''}`}
                            placeholder="Masukkan username"
                          />
                          {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                            placeholder="Masukkan password"
                          />
                          {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Konfirmasi Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            placeholder="Konfirmasi password"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </>
                    )}
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
              {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Guru')}
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