// lib/getClasses.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default async function getClasses() {
  try {
    const classes = await prisma.kelas.findMany({
      select: {
        id: true,
        namaKelas: true,
        tingkat: true
      }
    });
    
    console.log('Available classes:', classes);
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}