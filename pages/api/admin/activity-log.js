// pages/api/admin/activity-log.js
import prisma from '../../../lib/prisma';
import { authenticate, authorizeAdmin } from '../../../middleware/auth';

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

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, userId, activity } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build filter conditions
      let where = {};
      if (userId) {
        where.userId = parseInt(userId);
      }
      if (activity) {
        where.activity = {
          contains: activity,
          mode: 'insensitive'
        };
      }

      // Dapatkan log aktivitas dengan pagination
      const [logs, total] = await Promise.all([
        prisma.logActivity.findMany({
          where,
          skip: offset,
          take: parseInt(limit),
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nama: true,
                role: true
              }
            }
          }
        }),
        prisma.logActivity.count({ where })
      ]);

      res.status(200).json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}