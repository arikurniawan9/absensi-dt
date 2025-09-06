# Deployment Aplikasi Absensi Siswa

## Persiapan Deployment

Sebelum melakukan deployment, pastikan semua langkah berikut telah dilakukan:

1. **Pengujian Lokal**
   - Uji semua fitur aplikasi secara menyeluruh
   - Pastikan tidak ada error di console browser atau server
   - Uji autentikasi dan otorisasi dengan berbagai role pengguna

2. **Optimasi Kode**
   - Hapus kode yang tidak digunakan
   - Periksa dan perbaiki potensi memory leaks
   - Optimasi ukuran bundle jika diperlukan

3. **Konfigurasi Environment**
   - Siapkan file `.env.production` dengan environment variables yang sesuai
   - Pastikan semua secrets tidak di-commit ke repository

## Deployment ke Vercel (Rekomendasi)

Vercel adalah platform deployment yang sangat cocok untuk aplikasi Next.js.

### Langkah-langkah Deployment ke Vercel:

1. **Daftar/Login ke Vercel**
   - Kunjungi [https://vercel.com](https://vercel.com)
   - Daftar atau login dengan akun GitHub, GitLab, atau Bitbucket

2. **Import Project**
   - Klik "New Project"
   - Pilih repository yang berisi kode aplikasi absensi siswa
   - Klik "Import"

3. **Konfigurasi Project**
   - Framework Preset: Pilih "Next.js"
   - Root Directory: Biarkan kosong jika aplikasi ada di root repository
   - Build and Output Settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

4. **Environment Variables**
   - Tambahkan semua environment variables yang diperlukan:
     - `JWT_SECRET`: Secret key untuk JWT
     - `DATABASE_URL`: URL koneksi database (lihat bagian Database di bawah)
   - Pastikan semua variables ditandai sebagai "Production" dan "Preview"

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses deployment selesai (biasanya 1-5 menit)

6. **Konfigurasi Domain (Opsional)**
   - Setelah deployment berhasil, tambahkan domain kustom jika diperlukan
   - Ikuti petunjuk Vercel untuk konfigurasi DNS

## Deployment ke Server Pribadi

### Persyaratan Sistem:
- Node.js versi 16 atau lebih tinggi
- NPM atau Yarn
- Database (SQLite untuk development, PostgreSQL untuk production)
- Nginx atau Apache (opsional, untuk reverse proxy)

### Langkah-langkah Deployment:

1. **Clone Repository**
   ```bash
   git clone <url-repository>
   cd absensi-siswa
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   - Buat file `.env.production`:
     ```
     JWT_SECRET=your_secret_key_here
     DATABASE_URL=file:./prod.db
     # Untuk PostgreSQL: DATABASE_URL=postgresql://user:password@localhost:5432/absensi_siswa
     ```

4. **Migrasi Database**
   ```bash
   npx prisma migrate deploy
   ```

5. **Build Aplikasi**
   ```bash
   npm run build
   ```

6. **Jalankan Aplikasi**
   ```bash
   npm start
   ```

7. **Konfigurasi Reverse Proxy (Opsional)**
   Jika menggunakan Nginx, tambahkan konfigurasi berikut:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Setup PM2 untuk Process Management (Rekomendasi)**
   - Instal PM2:
     ```bash
     npm install -g pm2
     ```
   - Jalankan aplikasi dengan PM2:
     ```bash
     pm2 start npm --name "absensi-siswa" -- start
     ```
   - Simpan konfigurasi PM2:
     ```bash
     pm2 save
     ```
   - Setup startup script:
     ```bash
     pm2 startup
     ```

## Database untuk Production

### SQLite (Tidak Direkomendasikan untuk Production)
SQLite cocok untuk development, tetapi tidak direkomendasikan untuk production karena:
- Tidak support concurrent writes
- Tidak bisa di-scale secara horizontal
- Tidak ada user management

### PostgreSQL (Direkomendasikan untuk Production)
PostgreSQL adalah pilihan yang lebih baik untuk production karena:
- Support concurrent access
- Bisa di-scale
- Memiliki fitur keamanan yang baik

#### Setup PostgreSQL:
1. **Instal PostgreSQL**
   - Ubuntu/Debian:
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     ```
   - CentOS/RHEL:
     ```bash
     sudo yum install postgresql-server postgresql-contrib
     ```

2. **Buat Database dan User**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE absensi_siswa;
   CREATE USER absensi_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE absensi_siswa TO absensi_user;
   \q
   ```

3. **Update Environment Variables**
   ```
   DATABASE_URL=postgresql://absensi_user:your_password@localhost:5432/absensi_siswa
   ```

4. **Update Prisma Schema**
   Di file `prisma/schema.prisma`, ubah:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. **Jalankan Migrasi**
   ```bash
   npx prisma migrate deploy
   ```

## Monitoring dan Logging

### Monitoring Aplikasi
Untuk production, disarankan menggunakan tools monitoring seperti:
- **New Relic**
- **Datadog**
- **Prometheus + Grafana**

### Logging
Aplikasi ini sudah memiliki fitur logging aktivitas pengguna. Untuk logging sistem, pastikan:
- Log aplikasi disimpan di lokasi yang aman dan memiliki rotasi
- Log error dikirim ke sistem monitoring
- Log access diatur di web server (Nginx/Apache)

Contoh konfigurasi logging dengan Winston:
```javascript
// lib/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

## Backup dan Recovery

### Backup Database
Untuk PostgreSQL:
```bash
pg_dump -U absensi_user -h localhost absensi_siswa > backup_$(date +%Y%m%d).sql
```

Untuk SQLite:
```bash
cp prisma/prod.db backup_$(date +%Y%m%d).db
```

### Recovery Database
Untuk PostgreSQL:
```bash
psql -U absensi_user -h localhost absensi_siswa < backup_file.sql
```

Untuk SQLite:
```bash
cp backup_file.db prisma/prod.db
```

## Security Considerations

1. **HTTPS**
   - Gunakan SSL certificate (Let's Encrypt gratis)
   - Redirect HTTP ke HTTPS

2. **Rate Limiting**
   - Implement rate limiting untuk mencegah abuse
   - Gunakan tools seperti Cloudflare atau implementasi di aplikasi

3. **CORS**
   - Konfigurasi CORS dengan benar di `next.config.js`:
     ```javascript
     module.exports = {
       async headers() {
         return [
           {
             source: '/api/:path*',
             headers: [
               { key: 'Access-Control-Allow-Origin', value: 'yourdomain.com' },
               { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
               { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
             ],
           },
         ];
       },
     };
     ```

4. **Environment Variables**
   - Jangan commit secrets ke repository
   - Gunakan secret management tools seperti HashiCorp Vault

5. **Dependency Updates**
   - Secara rutin update dependensi untuk mengatasi vulnerability
   - Gunakan tools seperti `npm audit` atau `yarn audit`

## Scaling

Untuk menangani traffic yang tinggi:

1. **Database Connection Pooling**
   - Gunakan connection pooling untuk mengurangi overhead koneksi database

2. **Caching**
   - Implement Redis untuk caching data yang sering diakses

3. **Load Balancing**
   - Gunakan load balancer untuk mendistribusikan traffic

4. **CDN**
   - Gunakan CDN untuk file statis (gambar, CSS, JS)

5. **Database Optimization**
   - Tambahkan indeks yang sesuai
   - Optimasi query yang kompleks
   - Pertimbangkan read replicas untuk database

## Troubleshooting

### Masalah Umum dan Solusi

1. **Aplikasi tidak bisa start**
   - Periksa log error: `pm2 logs absensi-siswa`
   - Pastikan semua environment variables sudah diatur
   - Periksa koneksi database

2. **Database connection error**
   - Periksa DATABASE_URL di environment variables
   - Pastikan database service sudah running
   - Periksa credential database

3. **Performance issues**
   - Periksa query database yang lambat
   - Tambahkan indeks yang diperlukan
   - Implement caching untuk data yang sering diakses

4. **Memory leaks**
   - Monitor memory usage dengan tools seperti `htop` atau `pm2 monit`
   - Restart aplikasi secara berkala jika diperlukan
   - Investigasi dan perbaiki kode yang menyebabkan leak

### Monitoring Health Check

Implement health check endpoint di `/api/health`:
```javascript
// pages/api/health.js
export default async function handler(req, res) {
  try {
    // Cek koneksi database
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected'
    });
  }
}
```

## Maintenance

### Rutinitas Maintenance

1. **Backup Database** - Harian
2. **Update Dependensi** - Mingguan
3. **Monitoring Logs** - Harian
4. **Security Audit** - Bulanan
5. **Performance Review** - Bulanan

### Update Aplikasi

1. **Pull perubahan terbaru**
   ```bash
   git pull origin main
   ```

2. **Instal/update dependensi**
   ```bash
   npm install
   ```

3. **Jalankan migrasi database**
   ```bash
   npx prisma migrate deploy
   ```

4. **Build ulang aplikasi**
   ```bash
   npm run build
   ```

5. **Restart aplikasi**
   ```bash
   pm2 restart absensi-siswa
   ```