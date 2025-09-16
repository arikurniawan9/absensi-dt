// pages/guru/profile.js
import { useState, useEffect } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';
import { withGuruAuth } from '../../middleware/guruRoute';

export default function GuruProfile() {
  const [profileData, setProfileData] = useState({
    nama: '',
    kodeGuru: '',
    email: '',
    alamat: '',
    noTelp: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fungsi untuk mengambil data profil guru
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guru/profile');
      
      const data = await response.json();
      
      if (response.ok) {
        setProfileData({
          nama: data.guru.nama,
          kodeGuru: data.guru.kodeGuru,
          email: data.user.email || '',
          alamat: data.guru.alamat || '',
          noTelp: data.guru.noTelp || ''
        });
      } else {
        setError(data.message || 'Gagal memuat data profil');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success message when user starts editing
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success message when user starts editing
    if (success) setSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/guru/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Profil berhasil diperbarui!');
        setError('');
      } else {
        setError(data.message || 'Gagal memperbarui profil');
        setSuccess('');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      setSuccess('');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi password
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Password baru dan konfirmasi password tidak cocok!');
      setSuccess('');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      setSuccess('');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/guru/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Password berhasil diperbarui!');
        setError('');
        // Reset form password
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setError(data.message || 'Gagal memperbarui password');
        setSuccess('');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
      setSuccess('');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.nama) {
    return (
      <GuruLayout title="Pengaturan Akun">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout title="Pengaturan Akun">
      <div className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {success}
          </div>
        )}
        
        {/* Form Profil */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Informasi Profil</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={profileData.nama}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="kodeGuru" className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Guru
                  </label>
                  <input
                    type="text"
                    id="kodeGuru"
                    name="kodeGuru"
                    value={profileData.kodeGuru}
                    onChange={handleProfileChange}
                    className="form-input bg-gray-100 cursor-not-allowed"
                    required
                    readOnly
                  />
                  <p className="mt-1 text-sm text-gray-500">Kode Guru tidak dapat diubah</p>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label htmlFor="noTelp" className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    id="noTelp"
                    name="noTelp"
                    value={profileData.noTelp}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    id="alamat"
                    name="alamat"
                    value={profileData.alamat}
                    onChange={handleProfileChange}
                    rows={3}
                    className="form-input"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Form Password */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ubah Password</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Memperbarui...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}

// Terapkan middleware autentikasi
export const getServerSideProps = withGuruAuth(async (ctx) => {
  return {
    props: {}
  };
});