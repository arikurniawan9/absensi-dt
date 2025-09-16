// middleware/guruRoute.js
import { authenticateGuruPage } from './guruAuth';

export const withGuruAuth = (handler) => {
  return async (ctx) => {
    // Terapkan middleware autentikasi guru untuk pages
    try {
      const user = await authenticateGuruPage(ctx);
      
      // Jika autentikasi berhasil, lanjutkan ke handler
      return await handler(ctx);
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Redirect ke halaman login jika autentikasi gagal
      return {
        redirect: {
          destination: '/auth/guru/login',
          permanent: false,
        },
      };
    }
  };
};