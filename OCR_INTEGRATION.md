# Intégration OCR avec Tesseract.js

## Vue d'ensemble

Ce projet utilise Tesseract.js pour effectuer la reconnaissance optique de caractères (OCR) sur les captures d'écran de Riven mod de Warframe.

## Architecture

### Fichiers modifiés

1. **sidepanel.html**
   - Ajout du script CDN Tesseract.js
   - Ajout d'une section pour afficher les résultats OCR
   - Interface utilisateur pour le processus de reconnaissance

2. **scripts/new-tab.js**
   - Initialisation du worker Tesseract
   - Fonction `initTesseractWorker()` pour créer un worker réutilisable
   - Fonction `handleNewRivenImg()` pour traiter les images uploadées
   - Fonctions d'affichage des résultats OCR

3. **styles/sidepanel.css**
   - Styles pour la section de résultats OCR
   - Animations et feedback visuel

4. **manifest.json**
   - Ajout de la Content Security Policy pour autoriser Tesseract.js et WASM

## Utilisation

### Flux de travail

1. L'utilisateur upload une image via drag & drop ou sélection de fichier
2. L'image est affichée en preview
3. Tesseract.js analyse automatiquement l'image
4. Les résultats sont affichés avec :
   - Le niveau de confiance de la reconnaissance
   - Le texte détecté dans un textarea éditable
   - Un bouton pour analyser les données Riven

### Worker Tesseract

Le worker est initialisé au chargement de l'onglet "Nouveau" et reste en mémoire pour des performances optimales lors d'analyses multiples.

```javascript
tesseractWorker = await Tesseract.createWorker('eng', 1, {
  logger: (m) => {
    if (m.status === 'recognizing text') {
      updateOCRProgress(m.progress);
    }
  }
});
```

### Reconnaissance

```javascript
const result = await tesseractWorker.recognize(dataUrl);
console.log(result.data.text);
console.log(result.data.confidence);
```

## Configuration

### Langue

Actuellement configuré pour l'anglais (`'eng'`). Pour ajouter d'autres langues :

```javascript
tesseractWorker = await Tesseract.createWorker(['eng', 'fra'], 1);
```

### Progression

Le logger intégré permet de suivre la progression de l'analyse :

- `status`: État actuel (loading, recognizing, etc.)
- `progress`: Valeur entre 0 et 1

## Améliorations futures

### Parser de données Riven

La fonction `analyzeRivenData()` est prête à être implémentée pour extraire :

- Nom de l'arme
- Stats positives et négatives
- Polarité
- Niveau de maîtrise requis
- Nombre de rolls

### Prétraitement d'image

Pour améliorer la précision, on peut ajouter :

- Augmentation du contraste
- Conversion en niveaux de gris
- Réduction du bruit
- Détection et correction de l'orientation

### Cache des résultats

Stocker les résultats OCR dans Chrome Storage pour éviter de retraiter les mêmes images.

## Ressources

- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js)
- [API Documentation](https://github.com/naptha/tesseract.js/blob/master/docs/api.md)
