# Riven Market - Extension Chrome

Extension Chrome avec sidepanel pour faciliter les interactions avec Warframe Market via l'API publique.

## 🚀 Installation

### Mode développeur

1. Ouvrez Chrome et allez à `chrome://extensions/`
2. Activez le "Mode développeur" en haut à droite
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier de ce projet

## 📁 Structure du projet

```
riven-market/
├── manifest.json          # Configuration de l'extension
├── background.js          # Service worker (background script)
├── sidepanel.html        # Interface du sidepanel
├── styles/
│   └── sidepanel.css     # Styles CSS
├── scripts/
│   ├── api.js            # Module API Warframe Market
│   └── sidepanel.js      # Logique JavaScript du sidepanel
└── icons/                # Icônes de l'extension (à ajouter)
```

## 🎨 Fonctionnalités

- **Authentification OAuth 2.0 PKCE** : Connexion sécurisée via Warframe Market
- **Gestion de session** : Tokens d'accès et de rafraîchissement automatiques
- **Device ID unique** : Génération automatique et persistance d'un ID unique
- **Interface moderne** : Design élégant avec gradient et animations
- **Gestion utilisateur** : Affichage des informations de profil et déconnexion
- **Auto-refresh des tokens** : Rafraîchissement automatique quand le token expire

## 📝 Utilisation

### Première connexion

1. Cliquez sur l'icône de l'extension dans Chrome
2. Le sidepanel s'ouvre avec un bouton de connexion OAuth
3. Cliquez sur "Se connecter avec Warframe Market"
4. Une nouvelle fenêtre s'ouvre pour vous connecter sur Warframe Market
5. Autorisez l'accès à l'application
6. Vous êtes automatiquement redirigé et connecté

### Après connexion

- Vos informations sont affichées en haut de la page
- Vous restez connecté même après fermeture du navigateur
- Le token est automatiquement rafraîchi quand il expire
- Utilisez le bouton "Déconnexion" pour vous déconnecter

## 🔐 API Warframe Market

L'extension utilise l'API publique v2 de Warframe Market avec OAuth 2.0 PKCE :

- **Base URL** : `https://api.warframe.market/v2/`
- **Authorize URL** : `https://warframe.market/auth/authorize`
- **Token Endpoint** : `/oauth/token`
- **Client ID** : `64243a5d316686c642c2a56a`
- **Scopes** : `orders inventory`

### Fonctionnalités API disponibles

Le module `api.js` fournit les fonctions suivantes :

- `signIn()` : Lancer le flux OAuth 2.0 (ouvre une fenêtre navigateur)
- `signOut()` : Déconnexion et suppression des tokens
- `isAuthenticated()` : Vérification de l'état de connexion et validité du token
- `getAuthToken()` : Récupération du token (avec auto-refresh si nécessaire)
- `refreshAccessToken()` : Rafraîchir manuellement le token d'accès
- `getUserInfo()` : Récupérer les informations utilisateur sauvegardées
- `authenticatedRequest(endpoint, options)` : Requête API authentifiée

## 🔧 Développement

Pour modifier l'extension :

1. Éditez les fichiers sources
2. Retournez à `chrome://extensions/`
3. Cliquez sur l'icône de rechargement de l'extension

### Structure de données

Les données suivantes sont sauvegardées dans `chrome.storage.local` :

- `deviceId` : ID unique de l'appareil (format: `d-{16 chars}`)
- `accessToken` : Token d'accès JWT
- `refreshToken` : Token de rafraîchissement
- `expiresAt` : Timestamp d'expiration du token (Unix timestamp)
- `tokenType` : Type de token (généralement "Bearer")
- `user` : Objet contenant les informations utilisateur
- `isAuthenticated` : État de connexion (boolean)
- `authDate` : Date de connexion (ISO string)

## 📋 Permissions

- `sidePanel` : Permet d'utiliser l'API Sidepanel
- `storage` : Permet de sauvegarder des données localement
- `identity` : Permet d'utiliser le flux OAuth 2.0
- `host_permissions` : Accès à l'API Warframe Market
  - `https://api.warframe.market/*` (API)
  - `https://warframe.market/*` (OAuth authorization)

## 🎯 Prochaines étapes

- [ ] Ajouter des icônes personnalisées (16x16, 48x48, 128x128 pixels)
- [ ] Implémenter la recherche de Rivens
- [ ] Afficher les offres du marché
- [ ] Gérer les transactions
- [ ] Ajouter des notifications pour les nouvelles offres
- [ ] Implémenter le filtrage et le tri des résultats
