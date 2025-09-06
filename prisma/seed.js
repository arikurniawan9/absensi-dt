// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const guruPassword = await bcrypt.hash('guru123', 10);

  // Membuat user admin
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      nama: 'Administrator',
      email: 'admin@absensisiswa.com',
      status: true,
    },
  });

  // Membuat user guru
  const guru = await prisma.user.create({
    data: {
      username: 'guru',
      password: guruPassword,
      role: 'guru',
      nama: 'Guru Pertama',
      email: 'guru@absensisiswa.com',
      status: true,
    },
  });

  console.log('Data seed berhasil dibuat:');
  console.log('Admin:', admin);
  console.log('Guru:', guru);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });