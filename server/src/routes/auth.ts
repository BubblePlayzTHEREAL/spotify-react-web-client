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

// OAuth callback - redirects to frontend with code
router.get('/callback', (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (error) {
    res.redirect(`${frontendUrl}/admin-setup?error=${error}`);
    return;
  }

  if (code) {
    res.redirect(`${frontendUrl}/admin-setup?code=${code}`);
    return;
  }

  res.redirect(`${frontendUrl}/admin-setup`);
});

// Admin setup routes (only accessible before setup is complete)
router.get('/admin/oauth-url', requireSetupNotComplete, getAdminOAuthUrl);
router.post('/admin/complete-setup', requireSetupNotComplete, completeAdminSetup);

// Guest authentication routes (only accessible after setup is complete)
router.post('/guest/login', requireSetupComplete, loginRateLimiter, guestLogin);
router.post('/guest/logout', guestLogout);

// Password management (requires authentication)
router.post('/password/change', requireSetupComplete, loginRateLimiter, changeSitePassword);

export default router;
