import express from 'express';
import {
  checkSetupStatus,
  getAdminOAuthUrl,
  completeAdminSetup,
  guestLogin,
  guestLogout,
  changeSitePassword,
} from '../controllers/auth';
import { requireSetupNotComplete, requireSetupComplete } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Public routes
router.get('/status', checkSetupStatus);

// Admin setup routes (only accessible before setup is complete)
router.get('/admin/oauth-url', requireSetupNotComplete, getAdminOAuthUrl);
router.post('/admin/complete-setup', requireSetupNotComplete, completeAdminSetup);

// Guest authentication routes (only accessible after setup is complete)
router.post('/guest/login', requireSetupComplete, loginRateLimiter, guestLogin);
router.post('/guest/logout', guestLogout);

// Password management (requires authentication)
router.post('/password/change', requireSetupComplete, loginRateLimiter, changeSitePassword);

export default router;
