# Aplikasi Absensi Siswa

Aplikasi absensi siswa berbasis web dengan dua role pengguna: Admin dan Guru.

## Fitur Utama

### Admin
- Mengelola data master (siswa, guru, kelas, mata pelajaran)
- Mengelola akun pengguna (admin dan guru)
- Melihat log aktivitas semua pengguna
- Membuat laporan absensi

### Guru
- Melihat jadwal mengajar
- Melakukan absensi siswa
- Melihat riwayat absensi kelas yang diampu
- Membuat laporan absensi

## Teknologi yang Digunakan

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite dengan Prisma ORM
- **Autentikasi**: JWT (JSON Web Tokens)
- **Keamanan**: bcryptjs untuk hashing password

## Struktur Direktori

```
absensi-siswa/
├── components/           # Komponen UI reusable
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
├── models/              # Model database (jika tidak menggunakan Prisma)
├── middleware/          # Middleware
├── prisma/              # Schema Prisma dan migrations
└── ...
```

## Cara Instalasi

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan migrasi database:
   ```bash
   npx prisma migrate dev
   ```
4. Jalankan aplikasi dalam mode development:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

## Cara Penggunaan

1. **Login sebagai Admin**:
   - Username: admin
   - Password: admin123

2. **Login sebagai Guru**:
   - Username: guru
   - Password: guru123

*(Catatan: Data pengguna di atas hanya untuk development. Di produksi, gunakan password yang lebih aman)*

## Development

### Menjalankan dalam mode development
```bash
npm run dev
```

### Membuat build untuk production
```bash
npm run build
```

### Menjalankan build production
```bash
npm start
```

## Struktur Database

Aplikasi ini menggunakan SQLite dengan Prisma ORM. Skema database terdiri dari:

1. **User** - Menyimpan data pengguna (admin dan guru)
2. **Siswa** - Data siswa
3. **Guru** - Data guru
4. **Kelas** - Data kelas
5. **MataPelajaran** - Data mata pelajaran
6. **Jadwal** - Jadwal mengajar guru
7. **Absensi** - Data absensi siswa
8. **LogActivity** - Log aktivitas pengguna

## Keamanan

- Password dihash menggunakan bcryptjs
- Autentikasi menggunakan JWT
- Otorisasi berdasarkan role (admin/guru)
- Logging aktivitas pengguna

## Lisensi

MIT License