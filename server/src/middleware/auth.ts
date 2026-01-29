import { Request, Response, NextFunction } from 'express';
import { guestSessionsDb, settingsDb } from '../models/database';
import { verifyGuestToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  isGuest: boolean;
  isAdmin: boolean;
}

export async function authenticateGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7);

  // Verify JWT token
  const payload = verifyGuestToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Verify session exists in database
  const session = guestSessionsDb.get(token);
  if (!session) {
    res.status(401).json({ error: 'Session not found or expired' });
    return;
  }

  // Update last used timestamp
  guestSessionsDb.updateLastUsed(token);

  (req as AuthenticatedRequest).isGuest = true;
  (req as AuthenticatedRequest).isAdmin = false;
  next();
}

export async function requireSetupComplete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const isSetupComplete = settingsDb.exists('admin_setup_complete');

  if (!isSetupComplete) {
    res.status(403).json({ error: 'Admin setup not complete' });
    return;
  }

  next();
}

export async function requireSetupNotComplete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const isSetupComplete = settingsDb.exists('admin_setup_complete');

  if (isSetupComplete) {
    res.status(403).json({ error: 'Admin setup already complete' });
    return;
  }

  next();
}
