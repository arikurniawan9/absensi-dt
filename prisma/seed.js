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
        mataPelajaranId: 1,
        userId: guruUser.id,
      },
    });

    console.log('Data seed berhasil dibuat:');
    console.log('Admin:', admin);
    console.log('Guru:', guru);
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