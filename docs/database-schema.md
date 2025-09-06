# Struktur Database Aplikasi Absensi Siswa

## Gambaran Umum

Aplikasi ini menggunakan SQLite sebagai database dengan Prisma ORM untuk manajemen schema dan migrasi. Struktur database dirancang untuk mendukung sistem absensi siswa dengan dua role pengguna: Admin dan Guru.

## Diagram Entity Relationship (ERD)

```
[User] 1─────0..* [LogActivity]
  │
  │ 1..1
  ↓
[Guru] 1─────0..* [Jadwal] ─────0..* [Absensi]
  │                │                 │
  │ 1..*           │ 1..1            │ 1..1
  ↓                ↓                 ↓
[MataPelajaran]  [Kelas] ─────0..* [Siswa]
```

## Tabel-tabel

### 1. User
Tabel untuk menyimpan data pengguna (admin dan guru).

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik pengguna |
| username | TEXT | UNIQUE, NOT NULL | Username untuk login |
| password | TEXT | NOT NULL | Password yang sudah dihash |
| role | TEXT | NOT NULL, DEFAULT 'guru' | Role pengguna (admin/guru) |
| nama | TEXT | NOT NULL | Nama lengkap pengguna |
| email | TEXT | NULLABLE | Alamat email pengguna |
| status | BOOLEAN | NOT NULL, DEFAULT true | Status akun aktif/tidak |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 2. Siswa
Tabel untuk menyimpan data siswa.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik siswa |
| nis | TEXT | UNIQUE, NOT NULL | Nomor Induk Siswa |
| nama | TEXT | NOT NULL | Nama lengkap siswa |
| kelasId | INTEGER | NOT NULL, FOREIGN KEY | ID kelas siswa |
| tanggalLahir | DATETIME | NULLABLE | Tanggal lahir siswa |
| alamat | TEXT | NULLABLE | Alamat siswa |
| noTelp | TEXT | NULLABLE | Nomor telepon siswa |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 3. Guru
Tabel untuk menyimpan data guru.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik guru |
| nip | TEXT | UNIQUE, NOT NULL | Nomor Induk Pegawai |
| nama | TEXT | NOT NULL | Nama lengkap guru |
| mataPelajaranId | INTEGER | NOT NULL, FOREIGN KEY | ID mata pelajaran yang diampu |
| alamat | TEXT | NULLABLE | Alamat guru |
| noTelp | TEXT | NULLABLE | Nomor telepon guru |
| userId | INTEGER | UNIQUE, NOT NULL, FOREIGN KEY | ID user terkait |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 4. Kelas
Tabel untuk menyimpan data kelas.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik kelas |
| namaKelas | TEXT | NOT NULL | Nama kelas (contoh: X-A, XI-B) |
| tingkat | TEXT | NOT NULL | Tingkat kelas (X, XI, XII) |
| tahunAjaran | TEXT | NOT NULL | Tahun ajaran (contoh: 2023/2024) |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 5. MataPelajaran
Tabel untuk menyimpan data mata pelajaran.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik mata pelajaran |
| kodeMapel | TEXT | UNIQUE, NOT NULL | Kode mata pelajaran |
| namaMapel | TEXT | NOT NULL | Nama mata pelajaran |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 6. Jadwal
Tabel untuk menyimpan jadwal mengajar guru.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik jadwal |
| hari | TEXT | NOT NULL | Hari mengajar (Senin, Selasa, dst) |
| jamMulai | TEXT | NOT NULL | Jam mulai mengajar (format: HH:MM) |
| jamSelesai | TEXT | NOT NULL | Jam selesai mengajar (format: HH:MM) |
| kelasId | INTEGER | NOT NULL, FOREIGN KEY | ID kelas |
| guruId | INTEGER | NOT NULL, FOREIGN KEY | ID guru |
| mataPelajaranId | INTEGER | NOT NULL, FOREIGN KEY | ID mata pelajaran |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 7. Absensi
Tabel untuk menyimpan data absensi siswa.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik absensi |
| tanggal | DATETIME | NOT NULL | Tanggal absensi |
| status | TEXT | NOT NULL | Status kehadiran (hadir, izin, sakit, alpha) |
| keterangan | TEXT | NULLABLE | Keterangan tambahan |
| siswaId | INTEGER | NOT NULL, FOREIGN KEY | ID siswa |
| jadwalId | INTEGER | NOT NULL, FOREIGN KEY | ID jadwal |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |
| updatedAt | DATETIME | NOT NULL | Tanggal update terakhir |

### 8. LogActivity
Tabel untuk menyimpan log aktivitas pengguna.

| Kolom | Tipe | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unik log |
| userId | INTEGER | NOT NULL, FOREIGN KEY | ID user yang melakukan aktivitas |
| activity | TEXT | NOT NULL | Nama aktivitas |
| detail | TEXT | NULLABLE | Detail aktivitas |
| ipAddress | TEXT | NULLABLE | Alamat IP pengguna |
| userAgent | TEXT | NULLABLE | User agent browser |
| createdAt | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Tanggal aktivitas |

## Relasi Tabel

1. **User ↔ LogActivity**: One-to-Many
   - Satu user dapat memiliki banyak log aktivitas
   - Setiap log aktivitas dimiliki oleh satu user

2. **User ↔ Guru**: One-to-One
   - Setiap user dengan role 'guru' terhubung dengan satu record di tabel Guru
   - Setiap record di tabel Guru terhubung dengan satu user

3. **Guru ↔ Jadwal**: One-to-Many
   - Satu guru dapat memiliki banyak jadwal mengajar
   - Setiap jadwal mengajar dimiliki oleh satu guru

4. **MataPelajaran ↔ Guru**: One-to-Many
   - Satu mata pelajaran dapat diajarkan oleh banyak guru
   - Setiap guru mengajar satu mata pelajaran

5. **MataPelajaran ↔ Jadwal**: One-to-Many
   - Satu mata pelajaran dapat memiliki banyak jadwal
   - Setiap jadwal terkait dengan satu mata pelajaran

6. **Kelas ↔ Siswa**: One-to-Many
   - Satu kelas dapat memiliki banyak siswa
   - Setiap siswa tergabung dalam satu kelas

7. **Kelas ↔ Jadwal**: One-to-Many
   - Satu kelas dapat memiliki banyak jadwal
   - Setiap jadwal terkait dengan satu kelas

8. **Jadwal ↔ Absensi**: One-to-Many
   - Satu jadwal dapat memiliki banyak data absensi
   - Setiap data absensi terkait dengan satu jadwal

9. **Siswa ↔ Absensi**: One-to-Many
   - Satu siswa dapat memiliki banyak data absensi
   - Setiap data absensi terkait dengan satu siswa

## Indeks

Untuk meningkatkan performa query, beberapa indeks dibuat secara otomatis:

1. **User.username** - UNIQUE
2. **Siswa.nis** - UNIQUE
3. **Guru.nip** - UNIQUE
4. **Guru.userId** - UNIQUE
5. **MataPelajaran.kodeMapel** - UNIQUE

## Migrasi Database

Migrasi database dilakukan menggunakan Prisma Migrate:

1. **Membuat migrasi baru**:
   ```bash
   npx prisma migrate dev --name nama_migrasi
   ```

2. **Menjalankan migrasi**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Reset database** (untuk development):
   ```bash
   npx prisma migrate reset
   ```

## Seed Data

Data awal dapat diisi menggunakan seed script:

```bash
npm run seed
```

Script ini akan membuat:
- User admin dengan username 'admin' dan password 'admin123'
- User guru dengan username 'guru' dan password 'guru123'