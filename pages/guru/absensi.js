// pages/guru/absensi.js
import { useState } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';

export default function AbsensiSiswa() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Data dummy untuk kelas
  const classes = [
    { id: 1, name: 'X-A' },
    { id: 2, name: 'X-B' },
    { id: 3, name: 'XI-A' },
    { id: 4, name: 'XI-B' },
    { id: 5, name: 'XII-A' },
    { id: 6, name: 'XII-B' },
  ];
  
  // Data dummy untuk siswa
  const students = [
    { id: 1, nis: '12345', name: 'Budi Santoso', status: '', keterangan: '' },
    { id: 2, nis: '12346', name: 'Ani Putri', status: '', keterangan: '' },
    { id: 3, nis: '12347', name: 'Joko Widodo', status: '', keterangan: '' },
    { id: 4, nis: '12348', name: 'Siti Nurhaliza', status: '', keterangan: '' },
    { id: 5, nis: '12349', name: 'Andi Prasetyo', status: '', keterangan: '' },
  ];
  
  const handleStatusChange = (studentId, status) => {
    // Di aplikasi sebenarnya, ini akan mengupdate state siswa
    console.log(`Student ${studentId} status changed to ${status}`);
  };
  
  const handleKeteranganChange = (studentId, keterangan) => {
    // Di aplikasi sebenarnya, ini akan mengupdate state siswa
    console.log(`Student ${studentId} keterangan: ${keterangan}`);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Di aplikasi sebenarnya, ini akan mengirim data ke server
    alert('Absensi berhasil disimpan!');
  };

  return (
    <GuruLayout title="Absensi Siswa">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Form Absensi Siswa</h3>
        </div>
        <div className="p-6">
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
                      {cls.name}
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
                  className="btn btn-primary"
                  disabled={!selectedClass}
                >
                  Tampilkan Siswa
                </button>
              </div>
            </div>
            
            {selectedClass && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Daftar Siswa - Kelas {classes.find(c => c.id == selectedClass)?.name}
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
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.nis}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={student.status}
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
                              value={student.keterangan}
                              onChange={(e) => handleKeteranganChange(student.id, e.target.value)}
                              placeholder="Keterangan (opsional)"
                              className="form-input"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Simpan Absensi
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