# Les délices de Stess — version Vercel

Cette archive contient une version autonome du site, prête à être importée dans Vercel.

## Déploiement avec Vercel

1. Décompressez l’archive.
2. Dans Vercel, choisissez **Add New Project** puis **Import Third-Party Git Repository** ou importez le dossier dans votre dépôt Git.
3. Gardez les réglages détectés :
   - Framework : **Vite**
   - Build command : `npm run build`
   - Output directory : `dist`
4. Lancez le déploiement.

Le fichier `vercel.json` est déjà configuré pour que les routes de l’application React fonctionnent après actualisation.

## Développement local

```bash
npm install
npm run dev
```

La commande de vérification TypeScript est :

```bash
npm run typecheck
```