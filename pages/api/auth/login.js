// pages/api/auth/login.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    // Cari user berdasarkan username dan role admin
    const user = await prisma.user.findFirst({
      where: { 
        username: username,
        role: 'admin'
      }
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

        // Jika user adalah guru, dapatkan guruId
    let guruId = null;
    if (user.role === 'guru') {
      const guru = await prisma.guru.findUnique({
        where: { userId: user.id }
      });
      if (guru) {
        guruId = guru.id;
      }
    }

    // Buat token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        nama: user.nama,
        guruId: guruId
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    // Hapus password dari response
    const { password: userPassword, ...userWithoutPassword } = user;

    // Return response sukses dengan token
    res.status(200).json({
      message: 'Login berhasil',
      token: token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}