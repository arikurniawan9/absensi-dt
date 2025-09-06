# Dokumentasi Pengembangan Aplikasi Absensi Siswa

## Struktur Proyek

```
absensi-siswa/
├── components/           # Komponen UI reusable
│   ├── layout/          # Layout komponen (header, sidebar, dll)
│   ├── admin/           # Komponen khusus admin
│   ├── guru/            # Komponen khusus guru
│   └── ui/              # Komponen UI umum
├── pages/               # Halaman Next.js dan API routes
│   ├── api/             # API routes
│   ├── admin/           # Halaman admin
│   ├── guru/            # Halaman guru
│   ├── auth/            # Halaman autentikasi
│   ├── _app.js          # Komponen App
│   └── index.js         # Halaman utama
├── lib/                 # Library dan utility functions
├── styles/              # File CSS
├── public/              # File statis
├── prisma/              # Schema Prisma dan migrations
├── middleware/          # Middleware
├── docs/                # Dokumentasi
└── ...
```

## Setup Awal

1. **Instalasi Dependensi**
   ```bash
   npm install
   ```

2. **Inisialisasi Database**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed Data Awal**
   ```bash
   npm run seed
   ```

4. **Menjalankan Aplikasi dalam Mode Development**
   ```bash
   npm run dev
   ```

5. **Membuka Aplikasi**
   Buka browser dan akses [http://localhost:3000](http://localhost:3000)

## Penggunaan Aplikasi

### Login
- **Admin**: 
  - Username: admin
  - Password: admin123
  
- **Guru**: 
  - Username: guru
  - Password: guru123

### Fitur Admin
1. **Dashboard** - Menampilkan statistik sistem dan aktivitas terbaru
2. **Manajemen Pengguna** - Mengelola akun admin dan guru
3. **Data Siswa** - Mengelola data siswa
4. **Data Guru** - Mengelola data guru
5. **Data Kelas** - Mengelola data kelas
6. **Data Mata Pelajaran** - Mengelola data mata pelajaran
7. **Log Aktivitas** - Melihat log aktivitas semua pengguna
8. **Laporan** - Membuat dan mengekspor laporan

### Fitur Guru
1. **Dashboard** - Menampilkan jadwal mengajar dan riwayat absensi
2. **Absensi Siswa** - Menginput absensi siswa
3. **Jadwal Mengajar** - Melihat jadwal mengajar
4. **Riwayat Absensi** - Melihat riwayat absensi yang telah diinput
5. **Laporan** - Membuat dan mengekspor laporan absensi

## Pengembangan

### Menambahkan Halaman Baru
1. Buat file baru di direktori `pages/` sesuai dengan role pengguna (admin/guru)
2. Gunakan layout yang sesuai (`AdminLayout` atau `GuruLayout`)
3. Tambahkan route ke navigasi sidebar jika diperlukan

### Menambahkan API Route
1. Buat file baru di direktori `pages/api/`
2. Gunakan middleware autentikasi dan otorisasi jika diperlukan
3. Implementasikan logika bisnis di dalam handler

### Menambahkan Komponen
1. Buat file baru di direktori `components/` sesuai dengan kategori
2. Gunakan Tailwind CSS untuk styling
3. Pastikan komponen dapat digunakan kembali jika memungkinkan

### Memperbarui Database Schema
1. Modifikasi file `prisma/schema.prisma`
2. Jalankan migrasi:
   ```bash
   npx prisma migrate dev
   ```
3. Perbarui seed data jika diperlukan

## Teknologi yang Digunakan

- **Next.js** - Framework React untuk aplikasi web
- **Tailwind CSS** - Framework CSS utility-first
- **Prisma** - ORM untuk database
- **SQLite** - Database untuk development
- **JWT** - Autentikasi berbasis token
- **bcryptjs** - Hashing password

## Keamanan

1. **Autentikasi**
   - Login dengan username dan password
   - Password dihash menggunakan bcrypt
   - Token JWT untuk session management

2. **Otorisasi**
   - Role-based access control (RBAC)
   - Middleware proteksi rute berdasarkan role
   - Validasi role sebelum mengakses fitur

3. **Logging**
   - Mencatat semua aktivitas pengguna
   - Menyimpan informasi teknis (IP, user agent)
   - Audit trail untuk keperluan keamanan

## Deployment

### Persiapan Production
1. **Build Aplikasi**
   ```bash
   npm run build
   ```

2. **Menjalankan Aplikasi Production**
   ```bash
   npm start
   ```

### Environment Variables
Pastikan environment variables berikut diatur di lingkungan production:
- `JWT_SECRET` - Secret key untuk JWT
- `DATABASE_URL` - URL koneksi database

### Database Production
Untuk production, disarankan menggunakan database yang lebih robust seperti PostgreSQL:
1. Perbarui `DATABASE_URL` di environment variables
2. Modifikasi `provider` di `prisma/schema.prisma` menjadi `postgresql`
3. Jalankan migrasi database

## Troubleshooting

### Masalah Umum
1. **Port sudah digunakan**
   - Ubah port di file `next.config.js`:
     ```js
     module.exports = {
       // ...
       port: 3001, // Ubah port sesuai kebutuhan
     }
     ```

2. **Error database**
   - Pastikan file database ada dan dapat diakses
   - Jalankan ulang migrasi database:
     ```bash
     npx prisma migrate reset
     npx prisma migrate dev
     ```

3. **Error dependensi**
   - Hapus `node_modules` dan `package-lock.json`
   - Jalankan `npm install` kembali

### Pengujian
1. **Pengujian Manual**
   - Uji semua fitur dengan akun admin dan guru
   - Periksa validasi input
   - Uji alur autentikasi dan otorisasi

2. **Pengujian Otomatis**
   - (Akan ditambahkan di fase pengembangan selanjutnya)

## Lisensi
MIT License