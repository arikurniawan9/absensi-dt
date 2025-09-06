// pages/guru/profile.js
import { useState } from 'react';
import GuruLayout from '../../components/layout/GuruLayout';

export default function GuruProfile() {
  const [profileData, setProfileData] = useState({
    nama: 'Guru Pertama',
    nip: '123456789',
    email: 'guru@absensisiswa.com',
    alamat: 'Jl. Pendidikan No. 123',
    noTelp: '081234567890'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Di aplikasi sebenarnya, ini akan mengirim data ke server
    alert('Profil berhasil diperbarui!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Validasi password
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    
    // Di aplikasi sebenarnya, ini akan mengirim data ke server
    alert('Password berhasil diperbarui!');
    
    // Reset form password
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  return (
    <GuruLayout title="Pengaturan Akun">
      <div className="space-y-8">
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
                  <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">
                    NIP
                  </label>
                  <input
                    type="text"
                    id="nip"
                    name="nip"
                    value={profileData.nip}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
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
                    required
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
                  className="btn btn-primary"
                >
                  Simpan Perubahan
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
                  className="btn btn-primary"
                >
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}