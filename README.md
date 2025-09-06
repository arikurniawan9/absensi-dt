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
- **Database**: SQLite (development) / PostgreSQL (production)
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

## Deployment ke Vercel

Aplikasi ini dapat di-deploy ke Vercel dengan database PostgreSQL. Ikuti langkah-langkah berikut:

1. **Buat Database PostgreSQL di Vercel**:
   - Kunjungi dashboard Vercel
   - Pilih "Storage" > "Create Database"
   - Pilih "PostgreSQL" dan ikuti petunjuk

2. **Deploy ke Vercel**:
   - Install Vercel CLI: `npm install -g vercel`
   - Login: `vercel login`
   - Deploy: `vercel`

3. **Konfigurasi Environment Variables**:
   - Tambahkan `JWT_SECRET` dengan secret key Anda
   - Tambahkan `DATABASE_URL` dengan connection string PostgreSQL

4. **Jalankan Migrasi Database**:
   ```bash
   vercel exec -- npx prisma migrate deploy
   ```

5. **Seed Data Awal**:
   ```bash
   vercel exec -- npm run seed
   ```

6. **Redeploy**:
   ```bash
   vercel --prod
   ```

Lihat dokumentasi lengkap di `docs/vercel-deployment.md` untuk detail lebih lanjut.

## Struktur Database

Aplikasi ini menggunakan SQLite dengan Prisma ORM untuk development dan PostgreSQL untuk production. Skema database terdiri dari:

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

## Dokumentasi Tambahan

- [Development Guide](docs/development-guide.md)
- [API Documentation](docs/api-documentation.md)
- [Database Schema](docs/database-schema.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Vercel Deployment](docs/vercel-deployment.md)
- [User Manual](docs/user-manual.md)

## Lisensi

MIT License