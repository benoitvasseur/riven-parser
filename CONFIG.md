# Configuration - Riven Market Extension

## 📋 Configuration Tesseract.js

### Worker Configuration

Le worker Tesseract est configuré dans `scripts/nouveau-tab.js` :

```javascript
tesseractWorker = await Tesseract.createWorker('eng', 1, {
  logger: (m) => {
    if (m.status === 'recognizing text') {
      updateOCRProgress(m.progress);
    }
  }
});
```

#### Paramètres

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Language** | `'eng'` | Langue de reconnaissance (anglais) |
| **OEM** | `1` | OCR Engine Mode (LSTM neural network) |
| **Logger** | fonction | Callback pour suivre la progression |

### Options de langue

Pour ajouter d'autres langues :

```javascript
// Une langue
await Tesseract.createWorker('eng', 1);

// Plusieurs langues
await Tesseract.createWorker(['eng', 'fra'], 1);

// Chinois simplifié
await Tesseract.createWorker('chi_sim', 1);
```

Langues disponibles : [Liste complète](https://tesseract-ocr.github.io/tessdoc/Data-Files#data-files-for-version-400-november-29-2016)

### OCR Engine Modes (OEM)

| Mode | Description | Performances |
|------|-------------|--------------|
| 0 | Legacy engine only | Rapide, moins précis |
| 1 | Neural nets LSTM only | **Recommandé** - Meilleur équilibre |
| 2 | Legacy + LSTM | Plus lent |
| 3 | Default (basé sur la langue) | Variable |

## 🎨 Configuration CSS

### Thème de couleur principal

Variables dans `styles/sidepanel.css` :

```css
/* Couleur primaire (gradient) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Couleur des liens et highlights */
color: #667eea;

/* Confiance OCR */
/* Vert : 80-100% */
color: #28a745;

/* Jaune : 60-79% */
color: #ffc107;

/* Rouge : 0-59% */
color: #dc3545;
```

### Animations

```css
/* Fade in des résultats OCR */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🔒 Content Security Policy

Configuration dans `manifest.json` :

```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
},
"web_accessible_resources": [
  {
    "resources": ["libs/*.js"],
    "matches": ["<all_urls>"]
  }
]
```

### Explications

- `'self'` : Permet les scripts du même domaine
- `'wasm-unsafe-eval'` : **Requis pour Tesseract.js** (WebAssembly)
- `object-src 'self'` : Restriction des objets embarqués
- `web_accessible_resources` : Rend les fichiers du dossier `libs/` accessibles depuis l'extension

**Note** : Tesseract.js est maintenant inclus localement dans `libs/` plutôt que chargé depuis un CDN pour respecter la CSP de Chrome.

## 🌐 API Configuration

Configuration dans `scripts/api.js` :

```javascript
const BASE_URL = 'https://api.warframe.market/v2/';
const CLIENT_ID = '64243a5d316686c642c2a56a';
const REDIRECT_URI = 'https://warframe.market/auth/redirect';
const SCOPES = 'orders inventory';
```

### Endpoints

- **Auth** : `https://warframe.market/auth/authorize`
- **Token** : `/oauth/token`
- **User** : `/auth/current_user`
- **Orders** : `/profile/{username}/orders`

## 📊 Parser Configuration

Configuration dans `scripts/riven-parser.js` :

### Patterns Regex

```javascript
// Stats pattern
const statPattern = /([+-])\s*(\d+\.?\d*)\s*%\s*(.+?)(?=\n|$)/gi;

// Mastery patterns
const patterns = [
  /Mastery\s*Rank\s*(\d+)/i,
  /MR\s*(\d+)/i,
  /Rank\s*(\d+)/i
];

// Rolls patterns
const patterns = [
  /Rolled\s*(\d+)\s*times?/i,
  /(\d+)\s*rolls?/i
];
```

### Polarités supportées

```javascript
const polarities = [
  'Madurai',  // V shape
  'Vazarin',  // D shape
  'Naramon',  // Dash -
  'Zenurik',  // equal =
  'Unairu',   // R shape
  'Penjaga',  // Y shape
  'Umbra'     // Ω shape
];
```

### Limites de validation

```javascript
// Maximum de stats par Riven
const MAX_STATS = 4;

// Minimum requis pour validation
- Nom d'arme requis
- Au moins une stat requise
```

## 🔧 Options de développement

### Mode debug

Pour activer plus de logs, modifiez `nouveau-tab.js` :

```javascript
// Activer tous les logs Tesseract
tesseractWorker = await Tesseract.createWorker('eng', 1, {
  logger: (m) => {
    console.log('[Tesseract]', m);  // Log tout
  }
});
```

### Désactiver le cache

Pour forcer le rechargement des modèles Tesseract :

1. Ouvrez DevTools (F12)
2. Application > Storage > Clear storage
3. Rechargez l'extension

### Performance monitoring

Ajouter des timestamps :

```javascript
// Dans handleNewRivenImg()
const startTime = performance.now();
const result = await tesseractWorker.recognize(dataUrl);
const endTime = performance.now();
console.log(`OCR took ${endTime - startTime}ms`);
```

## 📦 Déploiement

### Installation Locale de Tesseract.js

**Actuel : Local** (requis pour les extensions Chrome)
```html
<script src='libs/tesseract.min.js'></script>
```

Les fichiers Tesseract.js sont copiés automatiquement lors de `npm install` grâce au script `postinstall` dans `package.json`
1. Copiez les fichiers de `node_modules/tesseract.js/dist/`
2. Mettez-les dans un dossier `lib/`
3. Changez le script dans `sidepanel.html` :
```html
<script src='lib/tesseract.min.js'></script>
```

### Build pour production

Si vous voulez créer un package :

```bash
# Créer un fichier .zip de l'extension
zip -r riven-market.zip . -x "node_modules/*" ".*" "*.md" "test-*.html"
```

## ⚙️ Variables d'environnement

Pour le moment, aucune variable d'environnement n'est requise. Toutes les configurations sont en dur dans le code.

### Future : Configuration externe

Pour supporter différents environnements, vous pourriez créer un `config.js` :

```javascript
const CONFIG = {
  development: {
    tesseract: {
      language: 'eng',
      oem: 1,
      debug: true
    },
    api: {
      baseUrl: 'https://api.warframe.market/v2/'
    }
  },
  production: {
    tesseract: {
      language: 'eng',
      oem: 1,
      debug: false
    },
    api: {
      baseUrl: 'https://api.warframe.market/v2/'
    }
  }
};

export default CONFIG[process.env.NODE_ENV || 'development'];
```

## 🔄 Auto-refresh Token

Configuration dans `scripts/api.js` :

```javascript
// Token expire après X secondes (défini par l'API)
// Auto-refresh déclenché si expiresAt < Date.now()
const BUFFER_TIME = 60 * 1000; // 1 minute avant expiration
```

## 🎯 Recommandations de configuration

### Pour développement
- Debug logs activés
- CDN pour Tesseract
- Cache désactivé
- Mode développeur Chrome

### Pour production
- Debug logs désactivés
- Tesseract en local
- Cache activé
- Extension empaquetée

### Pour performance
- OEM mode 1 (LSTM only)
- Worker réutilisable
- Images optimisées (<2MB)
- Cache navigateur activé
