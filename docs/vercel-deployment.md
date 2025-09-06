# Dokumentasi Deployment Aplikasi Absensi Siswa

## Deployment ke Vercel dengan PostgreSQL

### 1. Persiapan Database PostgreSQL di Vercel

1. **Buat Akun Vercel**
   - Kunjungi [https://vercel.com](https://vercel.com)
   - Daftar atau login dengan akun GitHub, GitLab, atau email

2. **Buat PostgreSQL Database**
   - Di dashboard Vercel, klik "Storage"
   - Klik "Create Database"
   - Pilih "PostgreSQL"
   - Beri nama database (misal: absensi-siswa-db)
   - Pilih region terdekat
   - Klik "Create"

3. **Dapatkan Connection String**
   - Setelah database dibuat, klik database tersebut
   - Di tab "Connection String", copy URL koneksi
   - Contoh format: `postgresql://default:password@host:port/verceldb`

### 2. Konfigurasi Environment Variables di Vercel

1. **Clone Repository**
   ```bash
   git clone https://github.com/arikurniawan9/absensi-dt.git
   cd absensi-dt
   ```

2. **Deploy ke Vercel**
   - Install Vercel CLI: `npm install -g vercel`
   - Login ke Vercel: `vercel login`
   - Deploy project: `vercel`

3. **Tambahkan Environment Variables**
   - Di dashboard project Vercel, klik "Settings"
   - Klik "Environment Variables"
   - Tambahkan variabel berikut:
     - `JWT_SECRET`: Secret key untuk JWT (gunakan string acak panjang)
     - `DATABASE_URL`: Connection string PostgreSQL dari Vercel

### 3. Menjalankan Migrasi Database

Setelah deploy pertama, kita perlu menjalankan migrasi database:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Jalankan Migrasi**
   ```bash
   vercel exec -- npx prisma migrate deploy
   ```

### 4. Menjalankan Seed Data

Untuk menambahkan data awal:

```bash
vercel exec -- npm run seed
```

### 5. Redeploy

Setelah migrasi dan seed selesai, redeploy aplikasi:

```bash
vercel --prod
```

## Konfigurasi Dual Schema Database

Aplikasi ini menggunakan dua schema database:
- **SQLite** untuk development lokal (`prisma/schema.prisma`)
- **PostgreSQL** untuk production di Vercel (`prisma/schema-postgresql.prisma`)

### Cara Kerja
Saat deploy ke Vercel, script `scripts/prepare-postgresql.js` secara otomatis mengganti schema default dengan schema PostgreSQL.

### Development dengan SQLite
Untuk development lokal:
1. Pastikan file `.env` berisi:
   ```
   DATABASE_URL=file:./dev.db
   JWT_SECRET=absensi_siswa_secret_key
   ```
2. Jalankan migrasi:
   ```bash
   npx prisma migrate dev
   ```

### Production dengan PostgreSQL
Saat deploy ke Vercel:
1. Vercel secara otomatis menjalankan script `vercel-build` yang mengganti schema
2. Environment variable `DATABASE_URL` di Vercel akan digunakan

## Troubleshooting

**Masalah Umum:**

1. **Database Connection Error**
   - Pastikan DATABASE_URL sudah benar
   - Periksa apakah database PostgreSQL sudah dibuat di Vercel
   - Pastikan tidak ada firewall yang memblokir koneksi

2. **Migrasi Gagal**
   - Pastikan Prisma schema sudah sesuai dengan provider PostgreSQL
   - Periksa log error migrasi untuk detail lebih lanjut

3. **Seed Data Gagal**
   - Pastikan database sudah dibuat dan dapat diakses
   - Periksa apakah ada constraint yang dilanggar

### Update dan Maintenance

Untuk update aplikasi di masa depan:

1. **Pull perubahan terbaru**
   ```bash
   git pull origin main
   ```

2. **Deploy ke Vercel**
   ```bash
   vercel --prod
   ```

3. **Jika ada perubahan schema database**
   ```bash
   npx prisma migrate dev
   vercel exec -- npx prisma migrate deploy
   ```

### Monitoring

Vercel menyediakan monitoring bawaan:
- Logs real-time
- Performance metrics
- Error tracking

Untuk monitoring lebih lanjut, Anda bisa mengintegrasikan dengan tools seperti:
- Sentry untuk error tracking
- Datadog untuk monitoring infrastructure
- New Relic untuk application performance monitoring

### Backup Database

Vercel PostgreSQL menyediakan backup otomatis:
- Backup harian otomatis
- Point-in-time recovery
- Manual backup melalui dashboard

Untuk backup manual:
1. Di dashboard Vercel, pilih database
2. Klik "Backups"
3. Klik "Create Backup"

### Scaling

Vercel PostgreSQL secara otomatis menskalakan berdasarkan kebutuhan:
- CPU dan memory otomatis disesuaikan
- Storage otomatis bertambah
- Connection pooling untuk performa optimal

### Security

Vercel menerapkan berbagai langkah keamanan:
- Enkripsi data at-rest dan in-transit
- Network isolation
- Automatic security updates
- DDoS protection

Untuk keamanan tambahan:
- Gunakan secret yang kuat untuk JWT_SECRET
- Batasi akses database hanya dari aplikasi Vercel
- Gunakan environment variables untuk menyimpan secret