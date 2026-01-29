# Guide de démarrage rapide - OCR Riven

## 🚀 Installation

1. **Ouvrez Chrome** et allez à `chrome://extensions/`
2. **Activez le "Mode développeur"** (coin supérieur droit)
3. **Cliquez sur "Charger l'extension non empaquetée"**
4. **Sélectionnez** le dossier `riven-market`
5. **Rafraîchissez l'extension** après chaque modification du code

## 📝 Utilisation de l'OCR

### Étape 1 : Connexion
1. Cliquez sur l'icône de l'extension dans Chrome
2. Connectez-vous avec votre compte Warframe Market

### Étape 2 : Upload d'image
1. Allez dans l'onglet "New"
2. Glissez-déposez une capture d'écran de Riven ou cliquez pour sélectionner un fichier
3. L'OCR démarre automatiquement

### Étape 3 : Analyse
1. Attendez que l'OCR se termine (progression affichée)
2. Vérifiez le niveau de confiance et le texte détecté
3. Cliquez sur "Analyze Riven Data" pour extraire les informations structurées

## 🧪 Tests disponibles

### Test OCR seul
Ouvrez `test-ocr.html` dans votre navigateur pour tester l'OCR sans l'extension complète.

### Test Parser seul
Ouvrez `test-parser.html` dans votre navigateur pour tester l'extraction de données sans OCR.

## 🔧 Fichiers modifiés

- `sidepanel.html` : Ajout du script Tesseract et de l'interface OCR
- `scripts/new-tab.js` : Intégration de Tesseract et gestion de l'OCR
- `scripts/riven-parser.js` : **NOUVEAU** - Parser de données Riven
- `styles/sidepanel.css` : Styles pour la section OCR
- `manifest.json` : Content Security Policy mise à jour

## 📚 Documentation détaillée

Consultez les fichiers suivants pour plus d'informations :

- `README.md` : Documentation complète du projet
- `OCR_INTEGRATION.md` : Détails techniques de l'intégration Tesseract.js
- `api-doc.yml` : Documentation de l'API Warframe Market

## ⚠️ Dépannage

### L'OCR ne démarre pas
- Vérifiez la console du navigateur (F12) pour les erreurs
- Assurez-vous que le CDN Tesseract.js est accessible
- Vérifiez que la Content Security Policy est correcte dans `manifest.json`

### Faible précision de l'OCR
- Assurez-vous que la capture d'écran est nette et de bonne qualité
- Évitez les images avec trop de bruit ou de flou
- Le texte doit être clairement visible et contrasté

### Le parser ne trouve pas les données
- Vérifiez le texte OCR brut dans le textarea
- Le format doit correspondre aux modèles Warframe standards
- Utilisez `test-parser.html` pour tester différents formats de texte

## 🎯 Prochaines étapes

1. **Améliorer la précision** : Ajouter un prétraitement d'image
2. **Sauvegarder les Rivens** : Stocker les données analysées
3. **Recherche de marché** : Intégrer avec l'API Warframe Market
4. **Comparaison de prix** : Afficher les prix du marché pour des Rivens similaires

## 💡 Conseils

- Prenez des captures d'écran en plein écran pour de meilleurs résultats
- Assurez-vous que l'interface de Warframe est en anglais
- L'OCR fonctionne mieux avec des images de haute résolution
- Le worker Tesseract est réutilisé pour de meilleures performances

## 📞 Support

Pour plus d'aide, consultez :
- [Documentation Tesseract.js](https://tesseract.projectnaptha.com/)
- [API Warframe Market](https://warframe.market/api)
- Les logs de la console navigateur (F12)
