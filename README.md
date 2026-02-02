# Riven Reader - Chrome Extension

Chrome extension with a sidepanel to facilitate interaction with the Warframe Market via the public API.

## 🚀 Installation

### Developer Mode

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer Mode" in the top right corner
3. Click "Load unpacked extension"
4. Select the folder for this project

## 📁 Project Structure

```
riven-parser/
├── manifest.json # Extension Configuration
├── background.js # Service worker (background script)
├── sidepanel.html # Sidepanel Interface
├── styles/
│ └── sidepanel.css # CSS Styles
├── scripts/
│ ├── api.js # Warframe Market API Module
│ ├── riven-parser.js # Riven parser
│ ├── new-tab.js # New tab JavaScript logic
│ ├── rivens-tab.js # Rivens tab JavaScript logic
│ ├── search-queries.js # Search queries JavaScript logic
│ ├── auction-cell.js # Auction cell JavaScript logic
│ ├── modules-loader.js # Modules loader
│ └── sidepanel.js # Sidepanel JavaScript logic
└── icons/ # Extension icons (to be added)
```

## 🎨 Features

- **OAuth 2.0 PKCE Authentication**: Secure login via Warframe Market
- ​​**Session Management**: Automatic login and refresh tokens
- **Unique Device ID**: Automatic generation and persistence of a unique ID
- **Modern Interface**: Elegant design with gradients and animations
- **User Management**: Display of profile information and logout
- **Auto-refresh Tokens**: Automatic refresh when the token expires
- **📷 Image Upload**: Drag and drop or select screenshots from Riven mods
- **🔍 Automatic OCR**: Text recognition via Tesseract.js with progress tracking
- **📊 Intelligent Analysis** : Automatic extraction of Riven data (weapon, stats, MR, rolls, polarity)
- **✅ Validation**: Verification of the consistency of the extracted data

## 📝 Usage

### First connection

1. Click on the extension icon in Chrome
2. The sidepanel opens with a login form
3. Enter your email and password
4. Click on "Login"
5. You are automatically logged in

### After login

- Your information is displayed at the top of the page
- You remain logged in even after closing the browser
- The token is automatically refreshed when it expires
- Use the "Logout" button to log out

## 🔐 Warframe Market API

The extension uses the Warframe Market public API v1:

- **Base URL**: `https://api.warframe.market/v1/`

### Available API Features

The `api.js` module provides the following functions:

- `signIn()`: Start the OAuth 2.0 flow (opens a browser window)
- `signOut()`: Log out and delete tokens
- `isAuthenticated()`: Check the connection status and token validity
- `getAuthToken()`: Retrieve the token (with auto-refresh if necessary)
- `refreshAccessToken()`: Manually Refresh the Access Token
- `getUserInfo()`: Retrieve saved user information
- `authenticatedRequest(endpoint, options)`: Authenticated API request

## 🔧 Development

To modify the extension:

1. Edit the source files
2. Go back to `chrome://extensions/`
3. Click the extension refresh icon

### Data Structure

The following data is stored in `chrome.storage.local`:

- `deviceId`: Unique device ID (format: `d-{16 chars}`)
- `accessToken`: JWT access token
- `refreshToken`: Refresh token
- `expiresAt`: Token expiration timestamp (Unix timestamp)
- `tokenType`: Token type (usually "Bearer")
- `user`: Object containing user information
- `isAuthenticated`: Login status (boolean)
- `authDate`: Login date (ISO string)

## 📋 Permissions

- `sidePanel`: Allows use of the Sidepanel API
- `storage`: Allows saving data locally
- `host_permissions`: Access to the Warframe Market API
- `https://api.warframe.market/*` (API)

## 🔍 Riven OCR and Analysis

### How to Use OCR

1. **Capture an Image**: Take a screenshot of your Riven mod in Warframe
2. **Upload the Image**:
- Drag and drop the image into the drop zone
- Or click to select a file
3. **Automatic Analysis**: Tesseract.js analyzes the image in real time
4. **Check the Results**

### Extracted Data

The Riven parser automatically extracts:

- **Weapon Name**: Ex: "Tonkor", "Rubico", "Acceltra"
- **Stats**:
  - Positive (e.g., +120.5% Critical Chance)
  - Negative (e.g., -45.2% Fire Rate)
- **Mastery**
- **Rolls**"