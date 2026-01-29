import express from 'express';
import {
  proxySpotifyGet,
  proxySpotifyPost,
  proxySpotifyPut,
  proxySpotifyDelete,
} from '../controllers/spotify';
import { authenticateGuest } from '../middleware/auth';

const router = express.Router();

// All Spotify API routes require authentication
router.use(authenticateGuest);

// Proxy all Spotify API requests
router.get('/*', proxySpotifyGet);
router.post('/*', proxySpotifyPost);
router.put('/*', proxySpotifyPut);
router.delete('/*', proxySpotifyDelete);

export default router;
