// middleware/guruAuth.js
import jwt from 'jsonwebtoken';
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

// Fungsi untuk memverifikasi token JWT
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
};

// Middleware autentikasi guru untuk API routes
export const authenticateGuruAPI = async (req, res, next) => {
  try {
    // Dapatkan token dari cookies
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan di cookies.' });
    }
    
    const decoded = verifyToken(token);
    
    // Cek apakah role adalah guru
    if (decoded.role !== 'guru') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya guru yang dapat mengakses.' });
    }
    
    // Jika guruId tidak ada di token (misalnya token lama), ambil dari database
    if (!decoded.guruId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { guru: true }
      });
      
      if (user && user.guru) {
        decoded.guruId = user.guru.id;
      } else {
        return res.status(401).json({ message: 'Data guru tidak ditemukan.' });
      }
    }
    
    // Simpan informasi user ke request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token tidak valid.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token telah kadaluarsa.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Middleware autentikasi guru untuk pages (getServerSideProps)
export const authenticateGuruPage = (ctx) => {
  return new Promise((resolve, reject) => {
    const { req } = ctx;
    
    // Dapatkan token dari cookies
    const { token } = req.cookies;
    
    if (!token) {
      reject(new Error('Akses ditolak. Token tidak ditemukan di cookies.'));
      return;
    }
    
    try {
      // Verifikasi token
      const decoded = verifyToken(token);
      
      // Cek apakah role adalah guru
      if (decoded.role !== 'guru') {
        reject(new Error('Akses ditolak. Hanya guru yang dapat mengakses.'));
        return;
      }
      
      // Simpan informasi user ke request untuk digunakan di halaman jika perlu
      ctx.req.user = decoded;
      resolve(decoded);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        reject(new Error('Token tidak valid.'));
        return;
      }
      if (error.name === 'TokenExpiredError') {
        reject(new Error('Token telah kadaluarsa.'));
        return;
      }
      console.error(error);
      reject(new Error('Terjadi kesalahan pada server saat verifikasi token.'));
    }
  });
};