# TlsEvent - Application d'événements à Toulouse

Une application mobile pour découvrir et organiser des événements dans la ville de Toulouse, inspirée par Meetup mais complètement gratuite et focalisée sur la ville rose.

## Fonctionnalités principales

- **Découverte d'événements** - Parcourez des événements locaux à Toulouse
- **Filtrage** - Filtrez les événements par catégorie ou recherchez par mot-clé
- **Création d'événements** - Créez et partagez vos propres événements
- **Profil utilisateur** - Suivez les événements auxquels vous participez et ceux que vous organisez

## Captures d'écran

- Page d'accueil avec événements recommandés et filtrage par catégorie
- Page de détails d'événement avec possibilité de s'inscrire et localisation
- Fonction de recherche et d'exploration des événements
- Interface de création d'événement
- Profil utilisateur

## Technologies utilisées

- React Native / Expo
- TypeScript
- React Navigation
- Expo Vector Icons et Linear Gradient
- React Native Paper
- Firebase (Firestore, Authentication, Storage)

## Installation et lancement

### Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)

### Étapes d'installation

1. Clonez ce dépôt :
   ```
   git clone <repository-url>
   cd TlsEventApp
   ```

2. Installez les dépendances :
   ```
   npm install
   # ou
   yarn install
   ```

3. Configurez Firebase :
   - Créez un projet Firebase sur [Firebase Console](https://console.firebase.google.com/)
   - Ajoutez une application Android et/ou iOS à votre projet Firebase
   - Suivez les instructions pour obtenir le fichier `google-services.json` (Android) et/ou `GoogleService-Info.plist` (iOS)
   - Placez ces fichiers dans les répertoires appropriés de votre projet (`android/app` pour `google-services.json` et `ios/Runner` pour `GoogleService-Info.plist`)
   - Configurez Firestore, Authentication et Storage dans la console Firebase

4. Lancez l'application :
   ```
   npm start
   # ou
   yarn start
   ```

5. Scannez le QR code avec l'application Expo Go sur votre appareil mobile ou utilisez un émulateur.

## Utilisation

- **Accueil** : Découvrez les événements à la une et filtrez par catégorie
- **Explorer** : Recherchez des événements par mot clé ou par catégorie
- **Créer** : Créez un nouvel événement en remplissant les informations requises
- **Profil** : Consultez vos événements et vos participations

## Développement futur

- Intégration d'une carte pour visualiser les événements géographiquement
- Système de notification pour les rappels d'événements
- Fonctionnalités sociales pour inviter des amis

## Auteurs

- [Votre nom] - Développement initial
