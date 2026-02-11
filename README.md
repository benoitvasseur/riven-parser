# Riven Reader - Chrome Extension

Chrome extension with a sidepanel to facilitate interaction with the Warframe Market via the public API.
The extension focus primarily on the Rivens, with an embedded OCR to parse the Riven data from a screenshot, list your existing auctions and easily find similar rivens to help you find the best price for your Riven.

Use cases:
- Upload a riven image and let the OCR parse the data
You can update / complet the riven info and look for similar rivens in the Warframe Market
Once you have an idea of the price, you can create the auction directly through the extension.

- See all your current auctions in the `Rivens` tab.
You have the possibility to update the price of each auction and see current similar rivens in Warframe Market.

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
│ ├── image-processor.js # Image processor JavaScript logic
│ └── sidepanel.js # Sidepanel JavaScript logic
└── icons/ # Extension icons
```

## 🎨 Features

- **Riven Reader**: Extract data from Riven mods (Weapon, Stats, MR, Rolls, Polarity)
- **Find similar rivens**: Find similar rivens in the Warframe Market, from a new parsed Riven or from an existing auction.
- **Create new auctions**: Create new auctions in the Warframe Market using the Riven data parsed.
- **Update existing auctions**: Update existing auctions in the Warframe Market.
- ​​**Session Management**: Automatic login and refresh tokens
- **Auto-refresh Tokens**: Automatic refresh when the token expires

### Similarity search

The similarity search is based on the following rules:
- If the Riven is marked as unrolled, we search for unrolled rivens only.
- If the Riven is rolled, we search for similar rivens with the same attributes.

Attributes color coding:
- Green: Same positive attribute than your riven
- Red: Same negative attribute than your riven
- Yellow: Similar attribute than your riven (Example: Heat damage instead of Cold damage)
- Grey: Others


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
