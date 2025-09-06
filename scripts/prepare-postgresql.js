// scripts/prepare-postgresql.js
const fs = require('fs');
const path = require('path');

// Hanya jalankan script ini saat di Vercel
if (process.env.VERCEL) {
  console.log('Mengganti schema Prisma untuk PostgreSQL...');
  
  // Copy schema-postgresql.prisma ke schema.prisma
  const postgresqlSchema = path.join(__dirname, '..', 'prisma', 'schema-postgresql.prisma');
  const mainSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  
  fs.copyFileSync(postgresqlSchema, mainSchema);
  
  console.log('Schema Prisma telah diubah untuk PostgreSQL');
} else {
  console.log('Tidak di Vercel, menggunakan schema default (SQLite)');
}