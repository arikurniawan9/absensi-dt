// components/admin/MataPelajaranModal.js
import { useState, useEffect } from 'react';

export default function MataPelajaranModal({ isOpen, onClose, mataPelajaranData, onSubmit }) {
  const [formData, setFormData] = useState({
    kodeMapel: '',
    namaMapel: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form ketika modal dibuka atau data mata pelajaran berubah
  useEffect(() => {
    if (isOpen) {
      if (mataPelajaranData) {
        setFormData({
          kodeMapel: mataPelajaranData.kodeMapel || '',
          namaMapel: mataPelajaranData.namaMapel || ''
        });
      } else {
        setFormData({
          kodeMapel: '',
          namaMapel: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mataPelajaranData]);

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
    
    if (!formData.kodeMapel.trim()) {
      newErrors.kodeMapel = 'Kode mata pelajaran harus diisi';
    }
    
    if (!formData.namaMapel.trim()) {
      newErrors.namaMapel = 'Nama mata pelajaran harus diisi';
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
                  {mataPelajaranData ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="kodeMapel" className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        id="kodeMapel"
                        name="kodeMapel"
                        value={formData.kodeMapel}
                        onChange={handleChange}
                        className={`form-input ${errors.kodeMapel ? 'border-red-500' : ''}`}
                        placeholder="Masukkan kode mata pelajaran"
                      />
                      {errors.kodeMapel && (
                        <p className="mt-1 text-sm text-red-600">{errors.kodeMapel}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="namaMapel" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        id="namaMapel"
                        name="namaMapel"
                        value={formData.namaMapel}
                        onChange={handleChange}
                        className={`form-input ${errors.namaMapel ? 'border-red-500' : ''}`}
                        placeholder="Masukkan nama mata pelajaran"
                      />
                      {errors.namaMapel && (
                        <p className="mt-1 text-sm text-red-600">{errors.namaMapel}</p>
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
              {loading ? 'Menyimpan...' : (mataPelajaranData ? 'Simpan Perubahan' : 'Tambah Mata Pelajaran')}
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