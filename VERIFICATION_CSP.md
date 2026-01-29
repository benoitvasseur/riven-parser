# ✅ Vérification de la correction CSP

Ce document vous guide pour vérifier que le problème CSP a bien été résolu.

## Étape 1 : Vérifier les fichiers

Assurez-vous que ces fichiers existent :

```bash
ls -la libs/
```

Vous devriez voir :
- ✅ `tesseract.min.js`
- ✅ `worker.min.js`
- ✅ `README.md`

## Étape 2 : Recharger l'extension dans Chrome

1. Ouvrez Chrome
2. Allez dans `chrome://extensions/`
3. Activez le **Mode développeur** (en haut à droite)
4. Si l'extension était déjà chargée, cliquez sur l'icône de rechargement ↻
5. Sinon, cliquez sur **"Charger l'extension non empaquetée"** et sélectionnez le dossier du projet

## Étape 3 : Vérifier qu'il n'y a pas d'erreur

Sur la page `chrome://extensions/`, vérifiez que :

- ✅ L'extension "Riven Market" apparaît
- ✅ Il n'y a **aucune erreur** affichée en rouge
- ✅ Le statut est "Activé"

## Étape 4 : Tester l'OCR

1. Cliquez sur l'icône de l'extension dans la barre d'outils Chrome
2. Ouvrez le panneau latéral
3. Connectez-vous (si nécessaire)
4. Allez dans l'onglet "Nouveau"
5. Uploadez une image de Riven

Si tout fonctionne correctement :
- ✅ L'image s'affiche en prévisualisation
- ✅ Le processus OCR démarre automatiquement
- ✅ Le texte détecté apparaît dans la zone de résultats

## Étape 5 : Vérifier la console

Ouvrez la console du panneau latéral (F12 ou clic droit > Inspecter) et vérifiez :

- ✅ Pas d'erreur CSP
- ✅ Message "Initializing Tesseract worker..." apparaît
- ✅ Message "Tesseract worker initialized successfully" apparaît

## En cas de problème

### Erreur "Cannot find module 'libs/tesseract.min.js'"

Exécutez :
```bash
npm run postinstall
```

### Erreur CSP persistante

Vérifiez que le `manifest.json` ne contient **pas** `https://cdn.jsdelivr.net` :

```bash
grep cdn.jsdelivr.net manifest.json
```

Cette commande ne devrait rien retourner.

### L'OCR ne fonctionne pas

1. Ouvrez la console (F12)
2. Cherchez les erreurs Tesseract
3. Vérifiez que le worker est bien chargé

### Besoin d'aide supplémentaire

Consultez :
- `CSP_FIX.md` - Documentation complète des modifications
- `libs/README.md` - Information sur les bibliothèques
- `CONFIG.md` - Configuration générale
