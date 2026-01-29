# Correction du problème CSP (Content Security Policy)

## Problème

L'extension Chrome affichait l'erreur suivante :
```
'content_security_policy.extension_pages': Insecure CSP value "https://cdn.jsdelivr.net" in directive 'script-src'.
Could not load manifest.
```

## Cause

Chrome Manifest V3 n'autorise pas le chargement de scripts depuis des CDN externes (comme `https://cdn.jsdelivr.net`) pour des raisons de sécurité.

## Solution

Les fichiers Tesseract.js ont été copiés localement dans l'extension.

### Modifications effectuées

1. **Création du dossier `libs/`**
   - Ajout de `tesseract.min.js`
   - Ajout de `worker.min.js`

2. **Mise à jour de `manifest.json`**
   - Suppression de `https://cdn.jsdelivr.net` de la CSP
   - Ajout de `web_accessible_resources` pour les fichiers du dossier `libs/`
   - CSP finale : `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'`

3. **Mise à jour de `sidepanel.html`**
   - Remplacement de `https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js`
   - Par `libs/tesseract.min.js`

4. **Mise à jour de `test-ocr.html`**
   - Même changement que pour `sidepanel.html`

5. **Mise à jour de `scripts/new-tab.js`**
   - Configuration du `workerPath` pour pointer vers `libs/worker.min.js`
   - Configuration du `langPath` pour utiliser le CDN officiel des données de langue

6. **Mise à jour de `package.json`**
   - Ajout d'un script `postinstall` pour copier automatiquement les fichiers Tesseract.js après `npm install`

### Fichiers modifiés

- ✅ `manifest.json`
- ✅ `sidepanel.html`
- ✅ `test-ocr.html`
- ✅ `scripts/new-tab.js`
- ✅ `package.json`

### Nouveaux fichiers

- 📁 `libs/tesseract.min.js`
- 📁 `libs/worker.min.js`
- 📄 `libs/README.md`

## Test

Pour tester l'extension :

1. Ouvrez Chrome
2. Allez dans `chrome://extensions/`
3. Activez le "Mode développeur"
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier du projet

L'extension devrait maintenant se charger sans erreur CSP.

## Notes importantes

- Le `'wasm-unsafe-eval'` est nécessaire pour que Tesseract.js fonctionne (il utilise WebAssembly)
- Les données de langue (traineddata) sont toujours chargées depuis le CDN officiel Tesseract, ce qui est autorisé car ce ne sont pas des scripts exécutables
- Les fichiers dans `libs/` doivent être versionnés dans Git car ils font partie de l'extension
