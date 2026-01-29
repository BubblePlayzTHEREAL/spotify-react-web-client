import axios from 'axios';
import { settingsDb } from '../models/database';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<SpotifyTokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Spotify configuration missing');
  }

  const response = await axios.post<SpotifyTokenResponse>(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}

export async function refreshSpotifyToken(): Promise<string> {
  const refreshToken = settingsDb.get('spotify_refresh_token');
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  if (!clientId) {
    throw new Error('Spotify configuration missing');
  }

  const response = await axios.post<SpotifyTokenResponse>(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const { access_token, expires_in, refresh_token } = response.data;

  // Store new access token with expiration
  const expiresAt = Date.now() + expires_in * 1000;
  settingsDb.set('spotify_access_token', access_token);
  settingsDb.set('spotify_token_expires_at', expiresAt.toString());

  // Update refresh token if a new one was provided
  if (refresh_token) {
    settingsDb.set('spotify_refresh_token', refresh_token);
  }

  return access_token;
}

export async function getValidSpotifyToken(): Promise<string> {
  const accessToken = settingsDb.get('spotify_access_token');
  const expiresAt = settingsDb.get('spotify_token_expires_at');

  // If no token or expiration info, try to refresh
  if (!accessToken || !expiresAt) {
    return refreshSpotifyToken();
  }

  // If token is expired or will expire in the next 5 minutes, refresh it
  const expiresAtNum = parseInt(expiresAt, 10);
  if (Date.now() >= expiresAtNum - 5 * 60 * 1000) {
    return refreshSpotifyToken();
  }

  return accessToken;
}

export async function makeSpotifyApiRequest<T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const token = await getValidSpotifyToken();

  const response = await axios({
    method,
    url: `${SPOTIFY_API_BASE}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });

  return response.data;
}
