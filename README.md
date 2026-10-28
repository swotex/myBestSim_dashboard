# myBestSim Dashboard

Application web de type **tableau de bord** : visualisation de données sous forme de graphiques, import de fichiers CSV et export possible des résultats en PDF.

> Projet réalisé dans le cadre d'un test technique pour un stage.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Structure du projet](#structure-du-projet)
- [Choix techniques](#choix-techniques)
- [Pistes d'amélioration](#pistes-damélioration)
- [Auteur](#auteur)

## Fonctionnalités

- Tableau de bord avec **graphiques interactifs** (Unovis)
- **Import de données CSV** (PapaParse)
- **Export du dashboard en PDF** (html2canvas-pro + jsPDF)
- Interface moderne et accessible, basée sur des composants **shadcn-vue**
- Typage avec **TypeScript**
- Build et déploiement automatisés via **GitHub Actions et GitHub Pages**

## Stack technique

| Domaine | Technologie |
| --- | --- |
| Framework | [Vue 3](https://vuejs.org/) |
| Langage | [TypeScript](https://www.typescriptlang.org/) |
| Bundler | [Vite](https://vite.dev/) |
| Style | [Tailwind CSS 4](https://tailwindcss.com/) |
| Composants UI | [Shadcn Vue](https://www.shadcn-vue.com/) |
| Icônes | [Lucide](https://lucide.dev/) |
| Graphiques | [Unovis](https://unovis.dev/) (charts shadcn) |
| Parsing CSV | [PapaParse](https://www.papaparse.com/) |
| Export PDF | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas-pro](https://github.com/yorickshan/html2canvas-pro) |
| CI | GitHub Actions |

## Prérequis

- **Node.js** `^22.18.0` ou `>= 24.12.0`
- **npm**

## Installation et lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/swotex/myBestSim_dashboard.git
cd myBestSim_dashboard

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

### Build de production

```bash
npm run build-only     # vérification des types + build
```

Les fichiers générés se trouvent dans le dossier `dist/`.

## Structure du projet

```
myBestSim_dashboard/
├── public/                   # Fichiers statiques (favicon)
├── src/
│   ├── main.ts               # Point d'entrée
│   ├── App.vue               # Page principale
│   ├── assets/
│   │   └── main.css          # Styles globaux (Tailwind)
│   ├── components/
│   │   ├── CsvImport.vue     # Zone de dépôt de fichiers CSV
│   │   ├── KpiGrid.vue       # Indicateurs clés (nb de cartes, prix moyen, …)
│   │   ├── BarCard.vue       # Graphique en barres (Unovis)
│   │   ├── ProviderTable.vue # Tableau comparatif des fournisseurs
│   │   ├── ProductTable.vue  # Catalogue : recherche, filtres et tris
│   │   ├── TripFinder.vue    # Recommande une carte selon le pays et la durée du séjour
│   │   └── ui/               # Composants shadcn-vue
│   ├── composables/          # Les états partagés et stats calculées
│   ├── lib/                  # Parsing CSV (PapaParse), et Utilitaires
├── components.json           # Configuration shadcn-vue
├── index.html                # Point d'entrée HTML
├── vite.config.ts            # Configuration Vite (alias `@`, base GitHub Pages)
├── tsconfig*.json            # Configuration TypeScript
└── package.json
```

## Choix techniques

- **Vue 3 + Vite** : démarrage rapide, rechargement à chaud et bon support de TypeScript.
- **Tailwind CSS 4 + shadcn-vue** : composants accessibles et personnalisables, sans alourdir l'application avec une bibliothèque UI imposante.
- **Unovis** : bibliothèque de graphiques légère et pensée pour Vue.
- **Traitement côté client** : le CSV est lu directement dans le navigateur avec PapaParse, sans backend.

## Pistes d'amélioration

- Ajout de tests unitaires (Vitest) et de tests de composants
- Persistance des données importées (localStorage / IndexedDB)
- Mode sombre

## Auteur

**swotex** — [github.com/swotex](https://github.com/swotex)
