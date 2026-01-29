import { Request, Response } from 'express';
import { settingsDb, guestSessionsDb } from '../models/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateGuestToken, getTokenExpiration } from '../utils/jwt';
import { exchangeCodeForTokens } from '../utils/spotify';

// Check if admin setup is complete
export async function checkSetupStatus(req: Request, res: Response): Promise<void> {
  const isSetupComplete = settingsDb.exists('admin_setup_complete');
  res.json({ setupComplete: isSetupComplete });
}

// Get Spotify OAuth URL for admin setup
export async function getAdminOAuthUrl(req: Request, res: Response): Promise<void> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Spotify configuration missing' });
    return;
  }

  const scopes = [
    'ugc-image-upload',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-collaborative',
    'user-follow-modify',
    'user-follow-read',
    'user-read-playback-position',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read',
    'user-library-modify',
    'user-read-email',
    'user-read-private',
  ];

  // Generate code verifier and challenge
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier temporarily (could use a session or short-lived cache)
  // For simplicity, we'll return it to the client to send back
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes.join(' '));
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);

  res.json({
    authUrl: authUrl.toString(),
    codeVerifier,
  });
}

// Handle OAuth callback and complete admin setup
export async function completeAdminSetup(req: Request, res: Response): Promise<void> {
  const { code, codeVerifier, sitePassword } = req.body;

  if (!code || !codeVerifier || !sitePassword) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  if (sitePassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    // Store tokens
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    settingsDb.set('spotify_access_token', tokens.access_token);
    settingsDb.set('spotify_token_expires_at', expiresAt.toString());
    if (tokens.refresh_token) {
      settingsDb.set('spotify_refresh_token', tokens.refresh_token);
    }

    // Hash and store password
    const hashedPassword = await hashPassword(sitePassword);
    settingsDb.set('site_password_hash', hashedPassword);

    // Mark setup as complete
    settingsDb.set('admin_setup_complete', 'true');

    res.json({ success: true });
  } catch (error: any) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: 'Failed to complete admin setup' });
  }
}

// Guest login with password
export async function guestLogin(req: Request, res: Response): Promise<void> {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  // Get stored password hash
  const storedHash = settingsDb.get('site_password_hash');
  if (!storedHash) {
    res.status(500).json({ error: 'Site password not configured' });
    return;
  }

  // Verify password
  const isValid = await verifyPassword(password, storedHash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  // Generate session token
  const sessionToken = generateGuestToken();
  const expiresAt = getTokenExpiration();

  // Store session
  guestSessionsDb.create(sessionToken, expiresAt);

  // Clean up expired sessions
  guestSessionsDb.deleteExpired();

  res.json({
    token: sessionToken,
    expiresAt: expiresAt.toISOString(),
  });
}

// Guest logout
export async function guestLogout(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    guestSessionsDb.delete(token);
  }

  res.json({ success: true });
}

// Change site password (requires current password)
export async function changeSitePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long' });
    return;
  }

  // Get stored password hash
  const storedHash = settingsDb.get('site_password_hash');
  if (!storedHash) {
    res.status(500).json({ error: 'Site password not configured' });
    return;
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, storedHash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid current password' });
    return;
  }

  // Hash and store new password
  const hashedPassword = await hashPassword(newPassword);
  settingsDb.set('site_password_hash', hashedPassword);

  res.json({ success: true });
}

// Helper functions
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
