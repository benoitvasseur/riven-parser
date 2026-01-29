# Bibliothèques tierces

Ce dossier contient les bibliothèques JavaScript externes utilisées par l'extension.

## Tesseract.js

Les fichiers Tesseract.js sont copiés localement depuis `node_modules` pour respecter la Content Security Policy (CSP) de Chrome.

Les extensions Chrome n'autorisent pas le chargement de scripts depuis des CDN externes pour des raisons de sécurité.

### Fichiers

- `tesseract.min.js` : Bibliothèque principale Tesseract.js
- `worker.min.js` : Worker pour le traitement OCR

### Mise à jour

Ces fichiers sont automatiquement copiés après `npm install` via le script `postinstall` dans `package.json`.

Pour mettre à jour manuellement :

```bash
npm run postinstall
```

Ou manuellement :

```bash
cp node_modules/tesseract.js/dist/tesseract.min.js libs/
cp node_modules/tesseract.js/dist/worker.min.js libs/
```
