import { Request, Response } from 'express';
import { makeSpotifyApiRequest } from '../utils/spotify';

// Proxy GET requests to Spotify API
export async function proxySpotifyGet(req: Request, res: Response): Promise<void> {
  try {
    const path = req.params[0]; // This captures the full path after /api/spotify
    const queryString = req.url.split('?')[1];
    const fullPath = queryString ? `/${path}?${queryString}` : `/${path}`;

    const data = await makeSpotifyApiRequest(fullPath, 'GET');
    res.json(data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || 'Spotify API request failed' });
  }
}

// Proxy POST requests to Spotify API
export async function proxySpotifyPost(req: Request, res: Response): Promise<void> {
  try {
    const path = req.params[0];
    const data = await makeSpotifyApiRequest(`/${path}`, 'POST', req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || 'Spotify API request failed' });
  }
}

// Proxy PUT requests to Spotify API
export async function proxySpotifyPut(req: Request, res: Response): Promise<void> {
  try {
    const path = req.params[0];
    const data = await makeSpotifyApiRequest(`/${path}`, 'PUT', req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || 'Spotify API request failed' });
  }
}

// Proxy DELETE requests to Spotify API
export async function proxySpotifyDelete(req: Request, res: Response): Promise<void> {
  try {
    const path = req.params[0];
    const data = await makeSpotifyApiRequest(`/${path}`, 'DELETE', req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || 'Spotify API request failed' });
  }
}
