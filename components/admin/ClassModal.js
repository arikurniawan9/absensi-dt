// components/admin/ClassModal.js
import { useState, useEffect } from 'react';

export default function ClassModal({ isOpen, onClose, classData, onSubmit }) {
  const [formData, setFormData] = useState({
    namaKelas: '',
    tingkat: '',
    tahunAjaran: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form ketika modal dibuka atau data kelas berubah
  useEffect(() => {
    if (isOpen) {
      if (classData) {
        setFormData({
          namaKelas: classData.namaKelas || '',
          tingkat: classData.tingkat || '',
          tahunAjaran: classData.tahunAjaran || ''
        });
      } else {
        setFormData({
          namaKelas: '',
          tingkat: '',
          tahunAjaran: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, classData]);

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
    
    if (!formData.namaKelas.trim()) {
      newErrors.namaKelas = 'Nama kelas harus diisi';
    }
    
    if (!formData.tingkat.trim()) {
      newErrors.tingkat = 'Tingkat harus diisi';
    }
    
    if (!formData.tahunAjaran.trim()) {
      newErrors.tahunAjaran = 'Tahun ajaran harus diisi';
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
      await onSubmit(formData);
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
                  {classData ? 'Edit Kelas' : 'Tambah Kelas'}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="namaKelas" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Kelas
                      </label>
                      <input
                        type="text"
                        id="namaKelas"
                        name="namaKelas"
                        value={formData.namaKelas}
                        onChange={handleChange}
                        className={`form-input ${errors.namaKelas ? 'border-red-500' : ''}`}
                        placeholder="Contoh: X-A, XI-B, XII-C"
                      />
                      {errors.namaKelas && (
                        <p className="mt-1 text-sm text-red-600">{errors.namaKelas}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="tingkat" className="block text-sm font-medium text-gray-700 mb-1">
                        Tingkat
                      </label>
                      <select
                        id="tingkat"
                        name="tingkat"
                        value={formData.tingkat}
                        onChange={handleChange}
                        className={`form-input ${errors.tingkat ? 'border-red-500' : ''}`}
                      >
                        <option value="">Pilih Tingkat</option>
                        <option value="X">X (Sepuluh)</option>
                        <option value="XI">XI (Sebelas)</option>
                        <option value="XII">XII (Dua Belas)</option>
                      </select>
                      {errors.tingkat && (
                        <p className="mt-1 text-sm text-red-600">{errors.tingkat}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="tahunAjaran" className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Ajaran
                      </label>
                      <input
                        type="text"
                        id="tahunAjaran"
                        name="tahunAjaran"
                        value={formData.tahunAjaran}
                        onChange={handleChange}
                        className={`form-input ${errors.tahunAjaran ? 'border-red-500' : ''}`}
                        placeholder="Contoh: 2023/2024"
                      />
                      {errors.tahunAjaran && (
                        <p className="mt-1 text-sm text-red-600">{errors.tahunAjaran}</p>
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
              {loading ? 'Menyimpan...' : (classData ? 'Simpan Perubahan' : 'Tambah Kelas')}
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