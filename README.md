# TlsEvent - Application d'événements à Toulouse

Une application mobile complète pour découvrir et organiser des événements dans la ville de Toulouse, inspirée par Meetup mais complètement gratuite et focalisée sur la ville rose.

## Architecture du projet

Ce projet est composé de deux parties principales :

- **client_app/** : Application mobile React Native/Expo
- **server/** : API backend Node.js/TypeScript

## Fonctionnalités principales

### Application mobile
- **Découverte d'événements** - Parcourez des événements locaux à Toulouse avec une interface moderne
- **Événements à la une** - Section dédiée aux événements populaires et à venir
- **Filtrage avancé** - Filtrez les événements par catégorie avec l'option "Tous"
- **Navigation intuitive** - Navigation par onglets avec écrans dédiés
- **Profil utilisateur** - Gestion complète du profil avec paramètres et déconnexion
- **Notifications** - Système de notifications intégré
- **Interface responsive** - Design adaptatif avec SafeAreaView et Linear Gradients

### Backend (en développement)
- **API RESTful** - Endpoints pour la gestion des événements et utilisateurs
- **Authentification** - Système d'authentification sécurisé
- **Middleware** - Gestion des requêtes et de la sécurité
- **Configuration** - Variables d'environnement et configuration modulaire

## Structure de l'application

### Client (React Native/Expo)
```
client_app/
├── App.tsx                 # Point d'entrée principal avec SafeAreaProvider
├── index.ts               # Enregistrement du composant racine
├── src/
│   ├── components/        # Composants réutilisables (Logo, etc.)
│   ├── contexts/          # Contextes React (état global)
│   ├── data/             # Données statiques et mockées
│   ├── hooks/            # Hooks personnalisés
│   ├── navigation/       # Configuration de React Navigation
│   ├── screens/          # Écrans principaux (HomeScreen, ProfileScreen)
│   ├── services/         # Services API et utilitaires
│   └── utils/            # Fonctions utilitaires
└── assets/               # Images, icônes et ressources statiques
```

### Serveur (Node.js/TypeScript)
```
server/
├── src/
│   ├── index.ts          # Point d'entrée du serveur
│   ├── config/           # Configuration de la base de données et environnement
│   ├── controllers/      # Contrôleurs pour les routes API
│   └── middleware/       # Middleware Express personnalisés
└── ENV_SETUP.md         # Guide de configuration des variables d'environnement
```

## Technologies utilisées

### Frontend
- **React Native** avec **Expo** - Framework de développement mobile
- **TypeScript** - Typage statique
- **React Navigation** - Navigation entre écrans
- **Expo Vector Icons** - Bibliothèque d'icônes (MaterialIcons)
- **Expo Linear Gradient** - Dégradés pour l'interface
- **React Native Safe Area Context** - Gestion des zones sûres
- **Expo Status Bar** - Contrôle de la barre de statut

### Backend
- **Node.js** avec **TypeScript**
- **Express.js** - Framework web
- **Variables d'environnement** - Configuration sécurisée

## Installation et lancement

### Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation du client mobile

1. Naviguez vers le dossier client :
   ```bash
   cd client_app
   ```

2. Installez les dépendances :
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Lancez l'application :
   ```bash
   npm start
   # ou
   yarn start
   # ou
   expo start
   ```

4. Scannez le QR code avec l'application Expo Go sur votre appareil mobile ou utilisez un émulateur.

### Installation du serveur

1. Naviguez vers le dossier serveur :
   ```bash
   cd server
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Copiez `.env.local` vers `.env`
   - Consultez [ENV_SETUP.md](server/ENV_SETUP.md) pour plus de détails

4. Lancez le serveur :
   ```bash
   npm start
   # ou
   npm run dev # pour le mode développement
   ```

## Écrans principaux

### HomeScreen
- **Header** avec logo TlsEvent et bouton de notifications
- **Section découverte** avec titre et sous-titre personnalisés
- **Événements à la une** - Carrousel horizontal d'événements populaires
- **Filtrage par catégories** - Navigation par catégories avec option "Tous"
- **Liste d'événements** - Affichage des événements filtrés

### ProfileScreen
- **Header** avec titre et bouton paramètres
- **Profil utilisateur** - Informations et avatar
- **Gestion des événements** - Événements créés et participations
- **Paramètres** - Configuration et préférences
- **Déconnexion** - Option de déconnexion sécurisée

## Configuration

### Variables d'environnement (Client)
- `.env.local` - Configuration locale du client

### Variables d'environnement (Serveur)
- `.env` - Configuration de production
- `.env.local` - Configuration de développement
- Consultez [ENV_SETUP.md](server/ENV_SETUP.md) pour la configuration complète

## Développement

### Structure des composants
L'application suit une architecture modulaire avec :
- **Composants réutilisables** dans `/components`
- **Hooks personnalisés** pour la logique métier
- **Services** pour les appels API
- **Contextes** pour l'état global

### Navigation
Navigation configurée avec React Navigation incluant :
- Navigation par onglets
- Écrans modaux
- Gestion de l'état de navigation

## Développement futur

### Fonctionnalités prévues
- **Backend complet** - Finalisation de l'API REST
- **Authentification** - Connexion et inscription utilisateurs
- **Base de données** - Stockage persistant des événements
- **Géolocalisation** - Carte interactive des événements
- **Notifications push** - Rappels et alertes
- **Fonctionnalités sociales** - Invitations et partage
- **Mode hors ligne** - Synchronisation des données
- **Tests** - Tests unitaires et d'intégration

### Améliorations techniques
- **Optimisation des performances** - Lazy loading et mise en cache
- **Accessibilité** - Support complet des lecteurs d'écran
- **Internationalisation** - Support multilingue
- **Analytics** - Suivi d'utilisation et métriques

## Scripts disponibles

### Client
- `npm start` - Lance l'application en mode développement
- `npm run android` - Lance sur émulateur Android
- `npm run ios` - Lance sur émulateur iOS
- `npm run web` - Lance la version web

### Serveur
- `npm start` - Lance le serveur en production
- `npm run dev` - Lance le serveur en mode développement
- `npm run build` - Compile TypeScript

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Auteurs

- [Votre nom] - Développement initial

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.