// pages/api/admin/users/[id]/password.js
import prisma from '@/lib/prisma';
import { authenticate, authorizeAdmin } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Middleware autentikasi dan otorisasi
  try {
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        authorizeAdmin(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  } catch (error) {
    // Error sudah ditangani di dalam middleware
    return;
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { newPassword } = req.body;

    // Validasi input
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    try {
      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password user di database
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          password: hashedPassword,
        },
      });

      res.status(200).json({ message: 'Password berhasil diupdate' });
    } catch (error) { 
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}