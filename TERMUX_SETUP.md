# 📱 Termux (Android) Setup Guide

This guide provides detailed instructions for installing and running the Spotify React Web Client server on Termux, an Android terminal emulator.

## Prerequisites

Before installing the application, you need to set up your Termux environment with the required packages.

### 1. Update Termux Packages

```bash
pkg update && pkg upgrade
```

### 2. Install Required Packages

Install Node.js, Git, Python, and build tools:

```bash
pkg install nodejs git python build-essential
```

**Note**: The `build-essential` package provides the necessary tools for compiling native modules.

### 3. Configure Storage Access (Optional)

If you want to access your device's storage from Termux:

```bash
termux-setup-storage
```

This will prompt you to allow storage permissions on your Android device.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BubblePlayzTHEREAL/spotify-react-web-client.git
cd spotify-react-web-client
```

### 2. Install Server Dependencies

The server has been optimized for Termux compatibility by using pure JavaScript alternatives for native modules:

- **bcryptjs** instead of bcrypt (no native compilation needed)
- **better-sqlite3** (works on Termux with proper build tools)

```bash
cd server
npm install
```

**Note**: The installation may take longer on Termux compared to desktop environments. This is normal.

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
nano .env
```

Add the following configuration (replace with your values):

```env
PORT=3001
NODE_ENV=development

# Spotify OAuth Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Secret for session tokens
JWT_SECRET=your_random_jwt_secret_change_this_in_production

# Database
DB_PATH=./data/auth.db
```

Save the file by pressing `Ctrl+X`, then `Y`, then `Enter`.

### 4. Start the Server

Run the development server:

```bash
npm run dev
```

Or build and run the production server:

```bash
npm run build
npm start
```

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Make sure all dependencies are installed:

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Permission denied" when creating database

**Solution**: Ensure the server has permission to create the data directory:

```bash
mkdir -p server/data
chmod 755 server/data
```

### Issue: Port 3001 is already in use

**Solution**: Either:
1. Kill the process using that port:
   ```bash
   pkill -f node
   ```
2. Or change the PORT in your `.env` file to a different port (e.g., 3002)

### Issue: better-sqlite3 compilation fails

**Solution**: Ensure you have all build tools installed:

```bash
pkg install nodejs git python build-essential
```

Then try installing again:

```bash
cd server
npm install better-sqlite3 --build-from-source
```

### Issue: Out of memory during installation

**Solution**: If your device has limited RAM, close other apps and try again. You can also try installing dependencies one at a time if needed.

## Running the Frontend on Termux

While the server can run on Termux, the React frontend is resource-intensive and may not perform well on all Android devices. For the best experience:

1. Run the server on Termux (Android device)
2. Access the frontend from a browser on a desktop/laptop computer using your Android device's IP address

To find your Android device's IP address:

```bash
ifconfig wlan0 | grep "inet "
```

Then update the frontend `.env` to point to your Android device's IP:

```env
REACT_APP_API_BASE_URL=http://YOUR_ANDROID_IP:3001
```

## Performance Tips

1. **Use a device with at least 3GB RAM** for better performance
2. **Close unnecessary apps** while running the server
3. **Use a stable WiFi connection** for better Spotify API performance
4. **Consider using a wake lock app** to prevent your device from sleeping while the server is running

## Security Considerations

When running the server on a mobile device:

1. **Only run on trusted networks** (avoid public WiFi)
2. **Don't expose the server to the internet** without proper security measures
3. **Use strong passwords** for the admin setup
4. **Keep Termux and packages updated**: `pkg update && pkg upgrade`
5. **Restart the server periodically** to clear memory

## Additional Resources

- [Termux Wiki](https://wiki.termux.com/)
- [Node.js on Termux](https://wiki.termux.com/wiki/Node.js)
- [Spotify Developer Documentation](https://developer.spotify.com/documentation/)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the main [README.md](README.md) for general setup instructions
2. Search for existing issues on the [GitHub repository](https://github.com/BubblePlayzTHEREAL/spotify-react-web-client/issues)
3. Create a new issue with:
   - Your Termux version (`termux-info`)
   - Node.js version (`node --version`)
   - Error messages or logs
   - Steps to reproduce the problem
