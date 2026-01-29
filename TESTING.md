# Guide de test - OCR Riven

## 🧪 Tests disponibles

### 1. Test complet de l'extension

#### Installation
1. Chargez l'extension dans Chrome
2. Connectez-vous avec Warframe Market
3. Allez dans l'onglet "New"

#### Test de l'upload
1. **Drag & Drop** : Glissez une image dans la zone de dépôt
2. **Click & Select** : Cliquez sur la zone ou le bouton pour sélectionner un fichier
3. **Format validation** : Essayez avec PNG, JPG, et un format non supporté

#### Test de l'OCR
1. **Initialisation** : Vérifiez que le statut "Initializing OCR..." s'affiche
2. **Progression** : Observez la barre de progression (0-100%)
3. **Résultats** : Vérifiez que le texte détecté et le niveau de confiance s'affichent

#### Test du parser
1. Cliquez sur "Analyze Riven Data"
2. Vérifiez que l'alerte affiche les informations extraites
3. Consultez les logs de la console pour les données structurées

### 2. Test OCR isolé (`test-ocr.html`)

Ouvrez `test-ocr.html` dans votre navigateur pour tester uniquement l'OCR.

#### Avantages
- Pas besoin de charger l'extension complète
- Test rapide de différentes images
- Logs détaillés dans la console

#### Utilisation
1. Ouvrez `test-ocr.html` dans Chrome
2. Attendez l'initialisation de Tesseract
3. Uploadez une image
4. Observez les résultats

### 3. Test Parser isolé (`test-parser.html`)

Ouvrez `test-parser.html` dans votre navigateur pour tester uniquement le parser.

#### Avantages
- Test du parser sans OCR
- Exemples préconfigurés
- Validation immédiate
- Affichage JSON brut

#### Utilisation
1. Ouvrez `test-parser.html` dans Chrome
2. Cliquez sur un exemple ou collez votre texte
3. Cliquez sur "Analyser"
4. Vérifiez les résultats formatés et le JSON brut

#### Exemples inclus
- **Exemple 1 - Tonkor** : 3 stats (2 positives, 1 négative)
- **Exemple 2 - Rubico** : 3 stats (2 positives, 1 négative)
- **Exemple 3 - Acceltra** : 4 stats (3 positives, 1 négative)

## 📸 Captures d'écran de test recommandées

### Caractéristiques idéales
- **Résolution** : 1920x1080 ou supérieure
- **Format** : PNG (meilleur que JPG pour le texte)
- **Contraste** : Interface Warframe en mode clair si possible
- **Langue** : Anglais (pour cohérence avec les modèles)
- **Cadrage** : Centré sur le Riven mod

### Zones à capturer
```
┌─────────────────────────────────┐
│  [Nom de l'arme] Riven          │
│                                  │
│  +120.5% Critical Chance         │
│  +85.3% Multishot               │
│  -30.2% Zoom                    │
│                                  │
│  [Icône polarité]               │
│  Mastery Rank 8                 │
│  Rolled 3 times                 │
└─────────────────────────────────┘
```

### Éléments à éviter
- ❌ Effets de mouvement ou flou
- ❌ Texte tronqué en bordure
- ❌ Superposition d'UI (inventaire, chat, etc.)
- ❌ Faible luminosité
- ❌ Compression JPG excessive

## 🔍 Vérification des résultats

### Niveaux de confiance

| Confiance | Couleur | Signification |
|-----------|---------|---------------|
| 80-100% | 🟢 Vert | Excellente reconnaissance |
| 60-79% | 🟡 Jaune | Reconnaissance acceptable |
| 0-59% | 🔴 Rouge | Reconnaissance faible |

### Validation des données

Le parser vérifie :
- ✅ Présence du nom de l'arme
- ✅ Au moins une stat détectée
- ✅ Maximum 4 stats (limite Warframe)

### Logs de débogage

Ouvrez la console (F12) pour voir :
```javascript
// Initialisation
'Tesseract worker initialized successfully'

// OCR en cours
{ status: 'recognizing text', progress: 0.75 }

// Résultat OCR
'OCR result:' { data: { text: '...', confidence: 85 } }

// Parsing
'Parsed Riven data:' { weaponName: 'Tonkor', stats: [...] }

// Validation
'Validation result:' { isValid: true, errors: [] }
```

## 🐛 Scénarios de test

### Test 1 : Image parfaite
- Capture d'écran nette en 1920x1080
- Tous les éléments visibles
- Langue anglaise
- **Résultat attendu** : Confiance >80%, toutes les données extraites

### Test 2 : Image moyenne
- Résolution 1280x720
- Légère compression JPG
- **Résultat attendu** : Confiance 60-80%, données principales extraites

### Test 3 : Image difficile
- Faible résolution
- Flou ou mouvement
- **Résultat attendu** : Confiance <60%, données partielles

### Test 4 : Formats non supportés
- Fichiers GIF, BMP, WEBP
- **Résultat attendu** : Message d'erreur approprié

### Test 5 : Rivens complexes
- 4 stats (maximum)
- Stats avec valeurs décimales
- Noms d'armes composés (ex: "Kuva Bramma")
- **Résultat attendu** : Toutes les stats détectées

## 📊 Métriques de performance

### Temps d'exécution attendus

| Étape | Temps | Notes |
|-------|-------|-------|
| Initialisation worker | 2-5s | Une seule fois au chargement |
| OCR (image 1920x1080) | 3-8s | Dépend de la complexité |
| Parsing | <100ms | Quasi instantané |
| Affichage résultats | <50ms | Immédiat |

### Utilisation mémoire

- Worker Tesseract : ~50-100 MB
- Image en mémoire : ~5-20 MB
- Total : ~60-150 MB (acceptable pour une extension)

## 🔧 Dépannage des tests

### Problème : OCR ne démarre pas
**Solutions** :
1. Vérifiez la connexion internet (CDN Tesseract)
2. Ouvrez F12 et regardez les erreurs
3. Vérifiez la Content Security Policy dans `manifest.json`
4. Rafraîchissez l'extension

### Problème : Confiance très faible
**Solutions** :
1. Améliorez la qualité de l'image source
2. Utilisez PNG au lieu de JPG
3. Augmentez la résolution
4. Assurez-vous que le texte est en anglais

### Problème : Parser ne trouve rien
**Solutions** :
1. Vérifiez le texte OCR brut dans le textarea
2. Testez le texte dans `test-parser.html`
3. Adaptez les regex dans `riven-parser.js` si nécessaire
4. Vérifiez que le format correspond aux standards Warframe

### Problème : Lenteur excessive
**Solutions** :
1. Réduisez la taille de l'image avant upload
2. Vérifiez que le worker n'est initialisé qu'une fois
3. Assurez-vous qu'il n'y a pas de fuite mémoire
4. Testez avec `test-ocr.html` pour isoler le problème

## ✅ Checklist de test finale

Avant de considérer l'intégration comme complète :

- [ ] L'extension se charge sans erreur
- [ ] L'upload d'image fonctionne (drag & drop et click)
- [ ] Le worker Tesseract s'initialise correctement
- [ ] La progression OCR s'affiche
- [ ] Le texte détecté est visible
- [ ] Le niveau de confiance est affiché
- [ ] Le bouton "Analyze" fonctionne
- [ ] Les données sont parsées correctement
- [ ] Les logs console sont clairs et utiles
- [ ] Le bouton "Remove" réinitialise l'interface
- [ ] `test-ocr.html` fonctionne indépendamment
- [ ] `test-parser.html` fonctionne indépendamment
- [ ] La documentation est à jour
