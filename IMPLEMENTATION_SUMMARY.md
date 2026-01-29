# Multi-Tier Authentication System - Implementation Summary

## Overview
This implementation adds a comprehensive multi-tier authentication system to the Spotify React Web Client. The system allows a server owner (admin) to authenticate with their Spotify account and then share access with guests through a password-protected interface.

## Architecture

### Backend (Node.js/Express/TypeScript)
Located in `server/` directory:

**Key Components:**
- **Express Server** (`src/index.ts`): Main server with CORS, rate limiting, and error handling
- **Database** (`src/models/database.ts`): SQLite database for storing tokens, passwords, and sessions
- **Authentication Controllers** (`src/controllers/auth.ts`): Handles OAuth, setup, login, and logout
- **Spotify API Proxy** (`src/controllers/spotify.ts`): Proxies all Spotify API requests using stored tokens
- **Security Utilities**:
  - Password hashing with bcrypt (`src/utils/password.ts`)
  - JWT token generation and validation (`src/utils/jwt.ts`)
  - Rate limiting middleware (`src/middleware/rateLimiter.ts`)
- **Spotify Integration** (`src/utils/spotify.ts`): OAuth token exchange and automatic refresh

**API Endpoints:**
- `GET /health` - Health check (no auth required)
- `GET /auth/status` - Check if admin setup is complete
- `GET /auth/admin/oauth-url` - Get Spotify OAuth URL for admin
- `GET /auth/callback` - OAuth callback (redirects to frontend)
- `POST /auth/admin/complete-setup` - Complete admin setup with Spotify code and password
- `POST /auth/guest/login` - Guest login with password
- `POST /auth/guest/logout` - Guest logout
- `POST /auth/password/change` - Change site password
- `/api/spotify/*` - Proxy all Spotify API requests (requires guest auth)

**Security Features:**
1. **Password Security**: Bcrypt hashing with 10 salt rounds
2. **Session Tokens**: JWT tokens with 7-day expiration
3. **Rate Limiting**: 
   - Login: 5 attempts per 15 minutes per IP
   - General API: 100 requests per minute per IP
4. **Token Refresh**: Automatic Spotify token refresh with 5-minute buffer
5. **Environment Validation**: Requires JWT_SECRET to be set (fails in production with default values)
6. **Database Security**: WAL mode for concurrent access, indexed sessions

### Frontend (React/TypeScript)

**New Components:**
- `src/pages/Auth/AdminSetup.tsx` - Multi-step admin setup page
- `src/pages/Auth/GuestLogin.tsx` - Guest password login page
- `src/components/Auth/LogoutButton.tsx` - Logout functionality
- `src/backendAxios.ts` - Axios instance for backend API calls
- `src/services/backendAuth.ts` - Backend authentication service layer

**Modified Components:**
- `src/App.tsx` - Added AuthGate component, new routing structure
- `src/axios.ts` - Updated to use backend proxy instead of direct Spotify API

**Authentication Flow:**
1. App loads, checks backend setup status
2. If not setup: Redirect to `/admin-setup`
3. If setup but not authenticated: Redirect to `/login`
4. If authenticated: Show main app

**Key Features:**
- Token stored in localStorage
- Automatic redirect on 401 errors
- Session expiration checking
- Clean UI with Ant Design components

## Setup Process

### Admin Setup Flow:
1. Admin visits app for first time
2. Clicks "Connect with Spotify"
3. Backend generates OAuth URL with PKCE challenge
4. User authenticates with Spotify
5. Spotify redirects back to frontend with code
6. Admin sets site password (min 8 characters)
7. Frontend sends code, verifier, and password to backend
8. Backend exchanges code for tokens and stores everything
9. Setup marked as complete

### Guest Login Flow:
1. Guest visits app
2. Sees login page
3. Enters password set by admin
4. Backend verifies password
5. Backend generates JWT session token
6. Guest token stored in localStorage
7. All API requests use guest token
8. Backend proxies requests to Spotify using stored admin tokens

## Database Schema

**settings table:**
```sql
- key TEXT PRIMARY KEY
- value TEXT NOT NULL
- created_at DATETIME
- updated_at DATETIME
```

Stores:
- `spotify_access_token`: Current Spotify access token
- `spotify_refresh_token`: Spotify refresh token
- `spotify_token_expires_at`: Token expiration timestamp
- `site_password_hash`: Bcrypt hashed password
- `admin_setup_complete`: Setup completion flag

**guest_sessions table:**
```sql
- id INTEGER PRIMARY KEY AUTOINCREMENT
- session_token TEXT UNIQUE NOT NULL
- created_at DATETIME
- expires_at DATETIME NOT NULL
- last_used_at DATETIME
```

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
SPOTIFY_CLIENT_ID=<from Spotify Dashboard>
SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/callback
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<strong random string - REQUIRED>
DB_PATH=./data/auth.db
```

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

## Security Considerations

### Implemented:
✅ Password hashing with bcrypt
✅ JWT session tokens with expiration
✅ Rate limiting on authentication endpoints
✅ Secure token storage in database
✅ Automatic token refresh
✅ Environment variable validation
✅ CORS configuration
✅ Indexed database queries
✅ Error handling with context logging

### Limitations:
⚠️ WebPlayback SDK not available (limitation of shared account model)
⚠️ Single Spotify account shared among all users
⚠️ IP-based rate limiting may affect users behind NAT
⚠️ SQLite suitable for single-server deployments only

### Production Recommendations:
1. Use strong JWT_SECRET (64+ random characters)
2. Enable HTTPS with reverse proxy (nginx)
3. Set secure CORS origins
4. Consider PostgreSQL for multi-server deployments
5. Implement additional rate limiting strategies
6. Add logging and monitoring
7. Regular security audits
8. Implement backup strategy for database

## Dependencies Added

### Backend:
- express: Web framework
- bcrypt: Password hashing
- jsonwebtoken: JWT token management
- better-sqlite3: SQLite database
- cors: CORS handling
- dotenv: Environment variables
- express-rate-limit: Rate limiting
- axios: HTTP client for Spotify API

### Frontend:
- concurrently: Run multiple scripts (dev dependency)

## Testing

### Manual Testing Checklist:
- [ ] Backend starts successfully with valid config
- [ ] Backend fails to start without JWT_SECRET
- [ ] Health endpoint responds
- [ ] Status endpoint returns correct setup state
- [ ] Admin OAuth URL generation works
- [ ] OAuth callback redirects correctly
- [ ] Admin setup completes successfully
- [ ] Guest login works with correct password
- [ ] Guest login fails with wrong password
- [ ] Rate limiting blocks after 5 failed attempts
- [ ] Spotify API proxy works for authenticated users
- [ ] Token refresh happens automatically
- [ ] Logout clears session
- [ ] Frontend redirects work correctly

### Known Issues:
- Frontend build has dependency issue (ajv) - does not affect TypeScript compilation
- This is a known issue with react-scripts and can be resolved by rebuilding node_modules

## File Structure

```
spotify-react-web-client/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.ts
│   │   │   └── spotify.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── rateLimiter.ts
│   │   ├── models/
│   │   │   └── database.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── spotify.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── spotify.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── components/
│   │   └── Auth/
│   │       └── LogoutButton.tsx
│   ├── pages/
│   │   └── Auth/
│   │       ├── AdminSetup.tsx
│   │       ├── GuestLogin.tsx
│   │       └── Auth.scss
│   ├── services/
│   │   └── backendAuth.ts
│   ├── App.tsx (modified)
│   ├── axios.ts (modified)
│   └── backendAxios.ts
├── .env.dist (updated)
├── README.md (updated)
└── package.json (updated)
```

## Running the Application

### Development:
```bash
# Terminal 1 - Start backend
cd server
npm install
npm run dev

# Terminal 2 - Start frontend
npm install --legacy-peer-deps
npm start
```

Or use the combined script:
```bash
npm run start:all
```

### Production:
```bash
# Build backend
cd server
npm run build

# Build frontend
npm run build

# Start backend
cd server
NODE_ENV=production npm start

# Serve frontend with nginx or similar
```

## Migration from Old System

The old system used direct Spotify OAuth for each user. This new system:
- **Removed**: Individual user Spotify authentication
- **Added**: Centralized admin Spotify authentication
- **Added**: Password-based guest access
- **Changed**: All API calls now go through backend proxy

Users will need to:
1. Complete admin setup with their Spotify account
2. Set a site password
3. Share the password with guests

## Future Enhancements

Potential improvements:
- [ ] Multiple admin accounts
- [ ] Guest user management (list, revoke sessions)
- [ ] Admin dashboard
- [ ] Audit logging
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Role-based access control
- [ ] Database encryption at rest
- [ ] Session replay protection
- [ ] CAPTCHA for login
