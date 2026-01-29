<div align="center">
<a align="center" href="https://spotify-react-web-client.onrender.com/" target="_blank" >
  <p align="center">
    <img src="https://github.com/user-attachments/assets/726763a6-094a-42cf-878c-1e7d47a2e597" style="height: 250px"/>
  </p>
</a>
</div>

<p align="center">

<img src="https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white" alt="Spotify Badge">
<img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React Badge">
<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript Badge">
<img src="https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Badge">

</p>

# 🎧 Spotify React Web Client

> [!IMPORTANT]
> Spotify Playback requires users to authenticate with a valid Spotify Premium subscription.

![gif](https://github.com/user-attachments/assets/2077cdef-f3fa-49c9-a905-9cc9ab6629fb)

## 🚀 Features

⚡ **Music Playback**: Play songs in real-time using the Spotify Playback SDK.

⚡ **Playback Controls**: Play, pause, next, previous, shuffle, and repeat functionalities.

⚡ **Music Browsing**: Search and explore songs, artists, albums, and playlists.

⚡ **Playlists Management**: Create, edit, and delete personalized playlists.

⚡ **Saved Playlists and Albums Access**: View and play your saved playlists and albums.

⚡ **Liked Songs**: Mark tracks as "liked" and access a dedicated playlist for liked songs.

⚡ **Playback Devices**: Switch between different playback devices (desktop, mobile, smart speakers).

⚡ **Follow/Unfollow Artists**: Follow and unfollow artists to get updates on their new releases.

⚡ **Artist and Album Pages**: Dedicated pages for artists and albums, showcasing top songs, discography, and related artists.

## 🛠 Technologies Used

🎵 React: For building the user interface with reusable components.

🎵 React Redux: For global state management and smooth data flow across the app.

🎵 <a href="https://developer.spotify.com/documentation/web-api/">Spotify Web API</a>: To fetch data like playlists, albums, and user information.

🎵 <a href="https://developer.spotify.com/documentation/web-playback-sdk/">Spotify Playback SDK</a>: For real-time music playback control within the web client.

## 📸 Screenshots

More in images [folder](https://github.com/francoborrelli/spotify-react-web-client/tree/main/images).

<div align="center">
    <table >
     <tr>
       <td>
         <img src="images/Home.png?raw=true 'Playlist'"/>
         <img src="images/CurrentDevices.png?raw=true 'Playlist'"/>
       </td>
        <td>
         <img src="images/NewPlaylist.png?raw=true 'Playlist'"/>
          <img src="images/browse.png?raw=true 'Playlist'"/>
       </td>
                 <td>
         <img src="images/Profile.png?raw=true 'Playlist'"/>
          <img src="images/playlist.png?raw=true 'Playlist'"/>
       </td>
     </tr>
    </table>
    </div>

## ⚙️ Installation & Setup

This project now includes a **multi-tier authentication system** where a server owner authenticates with Spotify and sets a password, then shares access with guests who only need the password.

### Prerequisites

- Node.js (v16 or higher)
- A Spotify Premium account (required for playback features)
- Spotify Developer account

### Setup Instructions

1. Clone this repository:

   ```bash
   git clone https://github.com/francoborrelli/spotify-react-web-client.git
   ```

2. Navigate to the project directory:

   ```bash
   cd spotify-react-web-client
   ```

3. Install frontend dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

4. Install backend server dependencies:

   ```bash
   cd server
   npm install
   cd ..
   ```

5. Set up your Spotify Developer account:
   
   - Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
   - Create a new app
   - Note your **Client ID** and **Client Secret**
   - Add these redirect URIs in your app settings:
     - `http://localhost:3001/auth/callback` (for backend OAuth)
     - `http://localhost:3000/admin-setup` (for frontend redirect)

6. Configure the backend server:
   
   Create a `.env` file in the `server/` directory:
   
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

7. Configure the frontend:
   
   Create a `.env` file in the root directory:
   
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3001
   ```

8. Start the backend server:

   ```bash
   cd server
   npm run dev
   ```

9. In a new terminal, start the frontend development server:

   ```bash
   npm start
   ```

10. Open your browser and navigate to `http://localhost:3000`

### Initial Setup (Admin/Server Owner)

1. When you first visit the app, you'll be redirected to the Admin Setup page
2. Click "Connect with Spotify" to authenticate with your Spotify account
3. After successful authentication, set a site password (min 8 characters)
4. Complete the setup - your Spotify tokens are now stored securely on the server

### Guest Access

1. After admin setup is complete, guests can visit the app
2. Enter the password set by the admin to gain access
3. Guests will use the admin's Spotify account without needing their own Spotify authentication
4. Guest sessions are valid for 7 days

### Security Features

- 🔒 **Password Hashing**: Site passwords are hashed with bcrypt
- 🔑 **JWT Tokens**: Secure session tokens for guest authentication
- 🚫 **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- 🔄 **Automatic Token Refresh**: Spotify tokens are refreshed automatically
- 📊 **SQLite Database**: Secure local storage for credentials

### Changing the Site Password

To change the site password, use the backend API:

```bash
curl -X POST http://localhost:3001/auth/password/change \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "old_password",
    "newPassword": "new_password"
  }'
```

### Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in the server `.env`
2. Generate a strong JWT secret
3. Use a reverse proxy (nginx) with HTTPS
4. Set appropriate CORS origins
5. Use environment variables for all secrets
6. Consider using a more robust database (PostgreSQL, MySQL)

## 🌐 2018 Version

There is also a 2018 version of this Spotify clone, which features the Spotify UI from that year. You can find the code for that version in the [`main-2018`](https://github.com/francoborrelli/spotify-react-web-client/tree/main-2018) branch.

- **2018 version branch**: [main-2018](https://github.com/francoborrelli/spotify-react-web-client/tree/main-2018)
- **2018 live demo**: [Check out the app](https://spotify-react-web-client-2018.onrender.com/)

Feel free to explore the older version and compare the features and functionality between the two versions.

## 🤝 Contributions

Contributions are welcome! If you have any suggestions or improvements, feel free to fork the repository, create a new branch, and submit a pull request.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
