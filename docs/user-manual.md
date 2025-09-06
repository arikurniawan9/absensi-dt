# User Manual Aplikasi Absensi Siswa

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Persyaratan Sistem](#persyaratan-sistem)
3. [Instalasi dan Setup](#instalasi-dan-setup)
4. [Login ke Aplikasi](#login-ke-aplikasi)
5. [Panduan Admin](#panduan-admin)
   - [Dashboard Admin](#dashboard-admin)
   - [Manajemen Pengguna](#manajemen-pengguna)
   - [Data Master](#data-master)
   - [Log Aktivitas](#log-aktivitas)
6. [Panduan Guru](#panduan-guru)
   - [Dashboard Guru](#dashboard-guru)
   - [Absensi Siswa](#absensi-siswa)
   - [Pengaturan Akun](#pengaturan-akun)
7. [Fitur Keamanan](#fitur-keamanan)
8. [Troubleshooting](#troubleshooting)

## Pendahuluan

Aplikasi Absensi Siswa adalah sistem berbasis web yang dirancang untuk membantu sekolah dalam mengelola absensi siswa. Aplikasi ini memiliki dua jenis pengguna: Admin dan Guru, masing-masing dengan hak akses dan fungsionalitas yang berbeda.

## Persyaratan Sistem

Untuk menggunakan aplikasi ini, Anda memerlukan:
- Browser web terbaru (Chrome, Firefox, Safari, atau Edge)
- Koneksi internet yang stabil
- Akun pengguna yang telah dibuat oleh administrator

## Instalasi dan Setup

Aplikasi ini berbasis web, sehingga tidak memerlukan instalasi khusus di komputer pengguna. Cukup buka browser dan akses alamat URL aplikasi yang telah disediakan oleh administrator sistem.

## Login ke Aplikasi

1. Buka browser dan masukkan alamat URL aplikasi
2. Anda akan melihat halaman login
3. Masukkan username dan password yang telah diberikan
4. Klik tombol "Masuk"
5. Jika kredensial benar, Anda akan diarahkan ke dashboard sesuai dengan role Anda

## Panduan Admin

### Dashboard Admin

Dashboard admin menampilkan:
- Statistik sistem (jumlah siswa, guru, kelas, mata pelajaran)
- Aktivitas terbaru pengguna
- Notifikasi penting (jika ada)

### Manajemen Pengguna

Admin dapat mengelola akun pengguna dengan fitur:
- **Tambah Pengguna**: Membuat akun baru untuk admin atau guru
- **Edit Pengguna**: Mengubah data pengguna yang sudah ada
- **Hapus Pengguna**: Menghapus akun pengguna
- **Reset Password**: Mengatur ulang password pengguna

**Langkah-langkah Manajemen Pengguna:**
1. Klik menu "Manajemen Pengguna" di sidebar
2. Untuk menambah pengguna:
   - Klik tombol "Tambah Pengguna"
   - Isi form dengan data pengguna
   - Klik "Simpan"
3. Untuk mengedit pengguna:
   - Klik tombol "Edit" pada baris pengguna yang ingin diubah
   - Ubah data yang diperlukan
   - Klik "Simpan"
4. Untuk menghapus pengguna:
   - Klik tombol "Hapus" pada baris pengguna yang ingin dihapus
   - Konfirmasi penghapusan

### Data Master

Admin dapat mengelola data master berikut:
- **Data Siswa**: Informasi detail tentang siswa
- **Data Guru**: Informasi detail tentang guru
- **Data Kelas**: Informasi tentang kelas
- **Data Mata Pelajaran**: Daftar mata pelajaran yang diajarkan

**Cara Mengelola Data Master:**
1. Klik menu yang sesuai di sidebar (Data Siswa, Data Guru, dll)
2. Gunakan tombol "Tambah" untuk menambah data baru
3. Gunakan tombol "Edit" untuk mengubah data yang sudah ada
4. Gunakan tombol "Hapus" untuk menghapus data

### Log Aktivitas

Fitur ini menampilkan semua aktivitas yang dilakukan oleh pengguna dalam sistem:
- Siapa yang melakukan aktivitas
- Jenis aktivitas yang dilakukan
- Waktu aktivitas
- Detail aktivitas
- Alamat IP dan informasi browser

**Cara Menggunakan Log Aktivitas:**
1. Klik menu "Log Aktivitas" di sidebar
2. Gunakan filter untuk mencari aktivitas tertentu:
   - Filter berdasarkan pengguna
   - Filter berdasarkan jenis aktivitas
3. Log ditampilkan dalam bentuk tabel dengan pagination

## Panduan Guru

### Dashboard Guru

Dashboard guru menampilkan:
- Selamat datang dan informasi dasar
- Jadwal mengajar hari ini
- Riwayat absensi terbaru

### Absensi Siswa

Fitur ini digunakan untuk menginput absensi siswa:
1. Klik menu "Absensi Siswa" di sidebar
2. Pilih kelas dan tanggal
3. Klik "Tampilkan Siswa" untuk melihat daftar siswa
4. Pilih status kehadiran untuk setiap siswa:
   - **Hadir**: Siswa hadir di kelas
   - **Izin**: Siswa tidak hadir dengan izin
   - **Sakit**: Siswa tidak hadir karena sakit
   - **Alpha**: Siswa tidak hadir tanpa keterangan
5. Tambahkan keterangan jika diperlukan
6. Klik "Simpan Absensi"

### Pengaturan Akun

Fitur ini memungkinkan guru untuk mengelola profil dan password mereka:
1. Klik menu "Pengaturan Akun" di sidebar
2. Di tab "Informasi Profil":
   - Lihat dan edit informasi pribadi seperti nama, NIP, email, alamat, dan no. telepon
   - Klik "Simpan Perubahan" untuk menyimpan perubahan
3. Di tab "Ubah Password":
   - Masukkan password saat ini
   - Masukkan password baru
   - Konfirmasi password baru
   - Klik "Ubah Password" untuk mengganti password

## Fitur Keamanan

Aplikasi ini memiliki beberapa fitur keamanan:
- **Autentikasi**: Login dengan username dan password
- **Otorisasi**: Hak akses berdasarkan role (admin/guru)
- **Logging**: Pencatatan semua aktivitas pengguna
- **Session Management**: Token JWT untuk manajemen sesi
- **Password Hashing**: Password dihash menggunakan bcrypt

## Troubleshooting

### Masalah Umum dan Solusi

**1. Tidak bisa login**
- Pastikan username dan password benar
- Periksa apakah Caps Lock aktif
- Coba refresh halaman dan login kembali
- Jika masih tidak bisa, hubungi administrator

**2. Lupa password**
- Hubungi administrator untuk reset password
- Administrator dapat mereset password melalui menu Manajemen Pengguna

**3. Data tidak muncul**
- Refresh halaman
- Periksa koneksi internet
- Clear cache browser
- Jika masalah berlanjut, hubungi administrator

**4. Error saat menginput absensi**
- Periksa apakah semua field sudah diisi
- Pastikan koneksi internet stabil
- Jika error terus muncul, catat pesan error dan hubungi administrator

### Kontak Support

Untuk bantuan teknis, hubungi administrator sistem atau kirim email ke:
- Email: admin@absensisiswa.com
- Telepon: (021) 12345678

### Feedback dan Saran

Kami selalu terbuka untuk feedback dan saran untuk meningkatkan aplikasi ini. Silakan kirimkan ke:
- Email: feedback@absensisiswa.com

## Catatan Rilis

**Versi 1.0.0** (Juli 2023)
- Rilis pertama aplikasi
- Fitur dasar untuk admin dan guru
- Sistem autentikasi dan otorisasi
- Fitur absensi siswa
- Log aktivitas pengguna

**Versi 1.1.0** (September 2023)
- Penyederhanaan menu untuk guru
- Penambahan halaman pengaturan akun untuk guru
- Perbaikan bug minor
- Peningkatan dokumentasi

## Lisensi

Aplikasi ini dilisensikan di bawah lisensi MIT.