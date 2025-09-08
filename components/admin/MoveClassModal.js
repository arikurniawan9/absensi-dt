import { useState, useEffect } from 'react';

export default function MoveClassModal({ isOpen, onClose, selectedStudentIds, kelasList, onSubmit }) {
  const [newKelasId, setNewKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewKelasId(''); // Reset selected class when modal opens
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newKelasId) {
      setError('Pilih kelas tujuan terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedStudentIds, parseInt(newKelasId));
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memindahkan kelas.');
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
                  Pindah Kelas Siswa Terpilih
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Anda akan memindahkan {selectedStudentIds.length} siswa ke kelas baru.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="newKelasId" className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Kelas Tujuan
                      </label>
                      <select
                        id="newKelasId"
                        name="newKelasId"
                        value={newKelasId}
                        onChange={(e) => setNewKelasId(e.target.value)}
                        className="form-input"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {kelasList.map(kelas => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.tingkat} - {kelas.namaKelas}
                          </option>
                        ))}
                      </select>
                      {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
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
              {loading ? 'Memindahkan...' : 'Pindahkan Kelas'}
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