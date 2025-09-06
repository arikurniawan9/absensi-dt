# Dokumentasi API Aplikasi Absensi Siswa

## Autentikasi

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login berhasil",
    "token": "jwt_token",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "nama": "Administrator",
      "email": "admin@absensisiswa.com",
      "status": true,
      "createdAt": "2023-07-15T00:00:00Z",
      "updatedAt": "2023-07-15T00:00:00Z"
    }
  }
  ```

## Admin APIs

### Manajemen Pengguna

#### Mendapatkan Daftar Pengguna
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Nomor halaman (default: 1)
  - `limit` (optional): Jumlah data per halaman (default: 10)
  - `role` (optional): Filter berdasarkan role (admin/guru)
- **Response**:
  ```json
  {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "nama": "Administrator",
        "email": "admin@absensisiswa.com",
        "status": true,
        "createdAt": "2023-07-15T00:00:00Z",
        "updatedAt": "2023-07-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### Membuat Pengguna Baru
- **URL**: `/api/admin/users`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "admin|guru",
    "nama": "string",
    "email": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User berhasil dibuat",
    "user": {
      "id": 1,
      "username": "newuser",
      "role": "guru",
      "nama": "New User",
      "email": "newuser@absensisiswa.com",
      "status": true,
      "createdAt": "2023-07-15T00:00:00Z",
      "updatedAt": "2023-07-15T00:00:00Z"
    }
  }
  ```

#### Mengupdate Pengguna
- **URL**: `/api/admin/users/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "string",
    "role": "admin|guru",
    "nama": "string",
    "email": "string",
    "status": "boolean"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User berhasil diupdate",
    "user": {
      "id": 1,
      "username": "updateduser",
      "role": "admin",
      "nama": "Updated User",
      "email": "updateduser@absensisiswa.com",
      "status": true,
      "createdAt": "2023-07-15T00:00:00Z",
      "updatedAt": "2023-07-15T00:00:00Z"
    }
  }
  ```

#### Menghapus Pengguna
- **URL**: `/api/admin/users/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "User berhasil dihapus"
  }
  ```

### Log Aktivitas

#### Mendapatkan Log Aktivitas
- **URL**: `/api/admin/activity-log`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Nomor halaman (default: 1)
  - `limit` (optional): Jumlah data per halaman (default: 10)
  - `userId` (optional): Filter berdasarkan user ID
  - `activity` (optional): Filter berdasarkan aktivitas
- **Response**:
  ```json
  {
    "logs": [
      {
        "id": 1,
        "userId": 1,
        "activity": "Login",
        "detail": "User berhasil login ke sistem",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2023-07-15T08:30:00Z",
        "user": {
          "id": 1,
          "username": "admin",
          "nama": "Administrator",
          "role": "admin"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

## Guru APIs

### Absensi

#### Mendapatkan Jadwal Mengajar
- **URL**: `/api/guru/schedule`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `date` (optional): Filter berdasarkan tanggal (format: YYYY-MM-DD)
- **Response**:
  ```json
  {
    "schedule": [
      {
        "id": 1,
        "hari": "Senin",
        "jamMulai": "08:00",
        "jamSelesai": "09:30",
        "kelas": {
          "id": 1,
          "namaKelas": "X-A"
        },
        "mataPelajaran": {
          "id": 1,
          "namaMapel": "Matematika"
        }
      }
    ]
  }
  ```

#### Menginput Absensi
- **URL**: `/api/guru/absensi`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "jadwalId": 1,
    "tanggal": "2023-07-15",
    "absensi": [
      {
        "siswaId": 1,
        "status": "hadir|izin|sakit|alpha",
        "keterangan": "string (optional)"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Absensi berhasil disimpan",
    "absensiId": 1
  }
  ```

#### Mendapatkan Riwayat Absensi
- **URL**: `/api/guru/absensi/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `kelasId` (optional): Filter berdasarkan ID kelas
  - `startDate` (optional): Filter berdasarkan tanggal mulai (format: YYYY-MM-DD)
  - `endDate` (optional): Filter berdasarkan tanggal akhir (format: YYYY-MM-DD)
  - `page` (optional): Nomor halaman (default: 1)
  - `limit` (optional): Jumlah data per halaman (default: 10)
- **Response**:
  ```json
  {
    "absensi": [
      {
        "id": 1,
        "tanggal": "2023-07-15",
        "kelas": {
          "id": 1,
          "namaKelas": "X-A"
        },
        "jumlahHadir": 28,
        "jumlahTidakHadir": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### Mendapatkan Detail Absensi
- **URL**: `/api/guru/absensi/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "absensi": {
      "id": 1,
      "tanggal": "2023-07-15",
      "kelas": {
        "id": 1,
        "namaKelas": "X-A"
      },
      "detail": [
        {
          "siswaId": 1,
          "siswaNama": "Budi Santoso",
          "status": "hadir",
          "keterangan": ""
        }
      ]
    }
  }
  ```

## Error Responses

Semua error response akan mengikuti format berikut:

```json
{
  "message": "Deskripsi error"
}
```

### Kode Status HTTP
- `400`: Bad Request - Input tidak valid
- `401`: Unauthorized - Token tidak valid atau tidak ada
- `403`: Forbidden - Akses ditolak (tidak memiliki role yang sesuai)
- `404`: Not Found - Resource tidak ditemukan
- `405`: Method Not Allowed - Method HTTP tidak didukung
- `500`: Internal Server Error - Kesalahan server

## Rate Limiting

API ini memiliki rate limiting untuk mencegah abuse:
- Maksimal 100 request per menit per IP address
- Untuk endpoint login: maksimal 5 percobaan per menit per IP address

## Security

- Semua endpoint (kecuali login) memerlukan token JWT
- Password dihash menggunakan bcrypt sebelum disimpan
- Input divalidasi dan disanitasi sebelum diproses
- CORS diatur untuk mencegah cross-site request forgery