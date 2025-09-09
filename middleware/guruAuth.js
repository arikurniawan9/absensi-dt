// middleware/guruAuth.js
import jwt from 'jsonwebtoken';

export const authenticateGuru = (req, res, next) => {
  try {
    // Dapatkan token dari header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'absensi_siswa_secret_key');
    
    // Cek apakah role adalah guru
    if (decoded.role !== 'guru') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya guru yang dapat mengakses.' });
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