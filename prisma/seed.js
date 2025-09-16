// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 10);
    const guruPassword = await bcrypt.hash('guru123', 10);

    // Membuat user admin
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        nama: 'Administrator',
        email: 'admin@absensisiswa.com',
        status: true,
      },
    });

    // Membuat mata pelajaran contoh terlebih dahulu
    const mataPelajaran = await prisma.mataPelajaran.upsert({
      where: { id: 1 },
      update: {},
      create: {
        kodeMapel: 'MTK',
        namaMapel: 'Matematika',
      },
    });

    // Membuat user guru
    const guruUser = await prisma.user.upsert({
      where: { username: 'guru' },
      update: {},
      create: {
        username: 'guru',
        password: guruPassword,
        role: 'guru',
        nama: 'Guru Pertama',
        email: 'guru@absensisiswa.com',
        status: true,
      },
    });

    // Membuat guru
    const guru = await prisma.guru.upsert({
      where: { kodeGuru: 'GURU001' },
      update: {},
      create: {
        kodeGuru: 'GURU001',
        nama: 'Guru Pertama',
        mataPelajaranId: mataPelajaran.id,
        userId: guruUser.id,
      },
    });

    // Membuat kelas contoh
    const kelas = await prisma.kelas.upsert({
      where: { id: 1 },
      update: {},
      create: {
        namaKelas: 'A',
        tingkat: 'X',
        tahunAjaran: '2025/2026',
      },
    });

    // Membuat jadwal contoh
    const jadwal = await prisma.jadwal.upsert({
      where: { id: 1 },
      update: {},
      create: {
        hari: 'Senin',
        jamMulai: '08:00',
        jamSelesai: '09:30',
        kelasId: kelas.id,
        guruId: guru.id,
        mataPelajaranId: mataPelajaran.id,
      },
    });

    console.log('Data seed berhasil dibuat:');
    console.log('Admin:', admin);
    console.log('Guru:', guru);
    console.log('Kelas:', kelas);
    console.log('Mata Pelajaran:', mataPelajaran);
    console.log('Jadwal:', jadwal);
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
