# Workflow Aplikasi Absensi Siswa dengan Next.js

## 1. Struktur Role Pengguna

### 1.1 Admin

- Mengelola data master (guru, kelas, siswa, mata pelajaran)
- Mengelola akun pengguna (admin dan guru)
- Melihat log aktivitas semua pengguna
- Membuat laporan absensi

### 1.2 Guru

- Melihat jadwal mengajar
- Melakukan absensi siswa
- Melihat riwayat absensi kelas yang diampu
- Membuat laporan absensi

## 2. Alur Autentikasi

```mermaid
graph TD
    A[Login] --> B{Validasi Credential}
    B -->|Sukses| C[Redirect ke Dashboard sesuai Role]
    B -->|Gagal| D[Tampilkan Error]
    D --> A
```

## 3. Alur Admin

### 3.1 Dashboard Admin

- Tampilan ringkasan sistem
- Jumlah siswa, guru, kelas
- Aktivitas terbaru pengguna
- Statistik absensi

### 3.2 Manajemen Data Master

```
Admin --> Pilih Menu Data Master --> Pilih Jenis Data (Kelas/Guru/Siswa) --> Tampilkan List Data -->
Pilihan: Tambah/Edit/Hapus Data --> Form Input --> Validasi --> Simpan ke Database --> Tampilkan Notifikasi
semua fitur menggunakan modal, pencarian, paginasi, import export data dengan file excel, multi hapus data.
```

### 3.3 Manajemen Pengguna

```
Admin --> Pilih Menu Pengguna --> Pilih Jenis Pengguna (Admin/Guru) --> Tampilkan List Pengguna -->
Pilihan: Tambah/Edit/Hapus/Reset Password --> Form Input --> Validasi --> Simpan ke Database --> Tampilkan Notifikasi
```

### 3.4 Log Aktivitas

```
Admin --> Pilih Menu Log Aktivitas --> Tampilkan List Aktivitas -->
Filter: Berdasarkan Tanggal/Pengguna/Type Aktivitas --> Tampilkan Detail Log
```

## 4. Alur Guru

### 4.1 Dashboard Guru

- Tampilan jadwal mengajar hari ini
- Kelas yang akan diampu
- Notifikasi jika ada jadwal mengajar

### 4.2 Absensi Siswa

```
Guru --> Pilih Menu Absensi --> Pilih Tanggal & Kelas --> Tampilkan List Siswa -->
Pilih Status Kehadiran (Hadir/Izin/Sakit/Alpha) --> Simpan Absensi --> Tampilkan Konfirmasi
```

### 4.3 Riwayat Absensi

```
Guru --> Pilih Menu Riwayat Absensi --> Pilih Kelas & Periode --> Tampilkan List Absensi -->
Pilihan: Lihat Detail/Edit --> Tampilkan Data Absensi --> Pilihan: Export/Cetak
```

## 5. Database Schema

### 5.1 Tabel Users

- id (primary key)
- username
- password (hashed)
- role (admin/guru)
- nama_lengkap
- email
- status
- no_wa
- created_at
- updated_at

### 5.2 Tabel Siswa

- id (primary key)
- nis
- nama_lengkap
- kelas_id
- jenis_kelamin
- created_at
- updated_at

### 5.3 Tabel Guru

- id (primary key)
- nip
- nama_lengkap
- mata_pelajaran_id
- no_wa
- created_at
- updated_at

### 5.4 Tabel Kelas

- id (primary key)
- nama_kelas
- tingkat_kelas
- tahun_ajaran
- created_at
- updated_at

### 5.5 Tabel Mata_Pelajaran

- id (primary key)
- kode_mapel
- nama_mapel
- created_at
- updated_at

### 5.6 Tabel Absensi

- id (primary key)
- siswa_id
- kelas_id
- tanggal
- status (hadir/izin/sakit/alpha)
- keterangan
- created_at
- updated_at

### 5.7 Tabel Log_Aktivitas

- id (primary key)
- user_id
- aktivitas
- detail
- ip_address
- user_agent
- created_at

## 6. Struktur Direktori Next.js

```
absensi-siswa/
├── components/           # Komponen UI reusable
│   ├── layout/
│   ├── dashboard/
│   ├── forms/
│   └── ui/
├── pages/               # Halaman Next.js
│   ├── api/             # API routes
│   ├── admin/           # Halaman admin
│   ├── guru/            # Halaman guru
│   ├── auth/
│   ├── _app.js
│   └── index.js
├── lib/                 # Library dan utility functions
├── styles/              # File CSS/SCSS
├── public/              # File statis
├── models/              # Model database
└── middleware/          # Middleware
```

## 7. Fitur Keamanan

### 7.1 Autentikasi

- Login dengan username dan password
- Hash password menggunakan bcrypt
- JSON Web Token (JWT) untuk session management
- Middleware proteksi rute berdasarkan role

### 7.2 Otorisasi

- Role-based access control (RBAC)
- Validasi role sebelum mengakses fitur
- Proteksi endpoint API

### 7.3 Logging

- Mencatat semua aktivitas pengguna
- Menyimpan informasi teknis (IP, user agent)
- Audit trail untuk keperluan keamanan

## 8. Teknologi yang Digunakan

### 8.1 Frontend

- Next.js (React Framework)
- Tailwind CSS untuk styling
- React Query untuk data fetching
- Formik dan Yup untuk form validation

### 8.2 Backend

- Next.js API Routes
- SQLite (dapat diupgrade ke PostgreSQL/MySQL)
- Prisma sebagai ORM
- JWT untuk autentikasi

### 8.3 Tools

- ESLint dan Prettier (code formatting)
- Husky dan lint-staged (pre-commit hooks)
