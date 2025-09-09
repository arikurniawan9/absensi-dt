// middleware/guruRoute.js
import { authenticateGuru } from './guruAuth';

export const withGuruAuth = (handler) => {
  return async (req, res) => {
    // Terapkan middleware autentikasi guru
    return new Promise((resolve, reject) => {
      authenticateGuru(req, res, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            // Jika autentikasi berhasil, lanjutkan ke handler
            const result = await handler(req, res);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  };
};