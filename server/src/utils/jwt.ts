import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRATION = '7d'; // Guest sessions expire in 7 days

export interface GuestTokenPayload {
  type: 'guest';
  timestamp: number;
}

export function generateGuestToken(): string {
  const payload: GuestTokenPayload = {
    type: 'guest',
    timestamp: Date.now(),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function verifyGuestToken(token: string): GuestTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as GuestTokenPayload;
    if (decoded.type === 'guest') {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function getTokenExpiration(): Date {
  // Returns expiration date for 7 days from now
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 7);
  return expiration;
}
