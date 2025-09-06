# Changelog

Semua perubahan penting pada proyek "Aplikasi Absensi Siswa" akan dicatat dalam file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini menggunakan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-07-15

### Added
- Struktur proyek dasar dengan Next.js
- Sistem autentikasi dengan dua role: Admin dan Guru
- Dashboard admin dengan statistik sistem
- Dashboard guru dengan jadwal mengajar
- Fitur manajemen pengguna untuk admin
- Fitur manajemen data master (siswa, guru, kelas, mata pelajaran)
- Fitur absensi siswa untuk guru
- Fitur log aktivitas pengguna
- Database schema dengan Prisma
- UI dengan Tailwind CSS
- Dokumentasi lengkap (development guide, API documentation, database schema, deployment guide, user manual)

### Changed
- - N/A (versi pertama)

### Deprecated
- - N/A (versi pertama)

### Removed
- - N/A (versi pertama)

### Fixed
- - N/A (versi pertama)

### Security
- Implementasi hashing password dengan bcrypt
- Implementasi autentikasi JWT
- Proteksi rute berdasarkan role pengguna
- Logging aktivitas pengguna untuk audit trail