

## Installation

À la racine du projet front, lancer :

```bash
pnpm create playwright
```

Pendant l’installation, choisir :

- TypeScript → oui (recommandé)
- Dossier de tests → `tests`
- GitHub Actions → oui (recommandé)
- Installer les navigateurs → **oui**

Cette commande :
- installe Playwright
- télécharge Chromium, Firefox et WebKit
- crée la configuration de base

---

##Linux (Ubuntu / Debian)

Sur Linux, il faut installer les dépendances système (une seule fois) :

```bash
sudo pnpm exec playwright install-deps
```

---

## Vérifier l’installation

```bash
pnpm exec playwright --version
```

Si une version s’affiche, Playwright est prêt.

---

## 🧪 pour Lancer les tests

### Tous les tests
```bash
pnpm exec playwright test
```

### Avec navigateur visible
```bash
pnpm exec playwright test --headed
```

### Un seul navigateur (Chromium)
```bash
pnpm exec playwright test --project=chromium
```

### Un seul fichier
```bash
pnpm exec playwright test tests/register.spec.ts
```

---

## Mode UI

```bash
pnpm exec playwright test --ui
```
