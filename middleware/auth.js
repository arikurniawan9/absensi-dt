// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // Dapatkan token dari header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Jika tidak ada token
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token tidak valid.' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  // Pastikan user sudah terautentikasi
  if (!req.user) {
    return res.status(401).json({ message: 'Akses ditolak. Autentikasi diperlukan.' });
  }

  // Cek apakah user adalah admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }

  next();
};

export const authorizeGuru = (req, res, next) => {
  // Pastikan user sudah terautentikasi
  if (!req.user) {
    return res.status(401).json({ message: 'Akses ditolak. Autentikasi diperlukan.' });
  }

  // Cek apakah user adalah guru
  if (req.user.role !== 'guru') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya guru yang dapat mengakses.' });
  }

  next();
};