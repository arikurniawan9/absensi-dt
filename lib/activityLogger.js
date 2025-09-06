// lib/activityLogger.js
import prisma from '../lib/prisma';

export const logActivity = async (userId, activity, detail = null, req = null) => {
  try {
    await prisma.logActivity.create({
      data: {
        userId: userId,
        activity: activity,
        detail: detail,
        ipAddress: req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || null,
        userAgent: req?.headers['user-agent'] || null,
      }
    });
  } catch (error) {
    console.error('Gagal mencatat aktivitas:', error);
  }
};

// Middleware untuk logging aktivitas otomatis
export const activityLogger = (activity, detail = null) => {
  return async (req, res, next) => {
    if (req.user) {
      await logActivity(req.user.id, activity, detail, req);
    }
    next();
  };
};