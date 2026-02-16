![Logo](./apps/front/public/logoTalkme.png)

# 💬 TalkMe — Plateforme de chat en ligne

Ce site web est un projet réalisée dans le cadre de nos études de **pré-MSc**.
Durant deux semaines, nous avons développé une plateforme permettant de discuter via dans différents serveurs/channels cia une interface simple
---

## 📑 Sommaire

* [Fonctionnalités](#-fonctionnalités)
* [Architecture](#-architecture)
* [Technologies utilisées](#-technologies-utilisées)
* [Installation](#-installation)
* [Utilisation](#-utilisation)
* [Contributeurs](#-contributeurs)

---

## ⚙️ Fonctionnalités

- Créer un compte permettant de sidentifier et garder un historique de nos conversations.s
- Créer des serveur afin de trier les conversations.
- Créer des channels afin de discuter de différents thèmes dans un même serveur.
- Ajouter des membres aux channels.
- Discuter avec ses membres.
---

## 🏗️ Architecture

```
/apps
├───/back
│   ├── src/
│   │   ├── auth/
│   │   ├── channel/
│   │   ├── chat/
│   │   ├── generated/
│   │   ├── member/
│   │   ├── member-channel/
│   │   ├── messages/
│   │   ├── prisma/
│   │   ├── servers/
│   │   ├── user/
│   │   └── main.ts
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── package-lock.json
│
└───/front
    ├── app/
    │   ├── auth/
    │   │   ├── login/
    │   │   └── register/
    │   ├── chat/
    │   │   ├── [serverId]/
    │   │   │   ├── [channelId]/
    │   │   │   └── addchannel/
    │   │   ├── addservers/
    │   │   └── navbar/
    │   ├── components/
    │   ├── config/
    │   ├── lib/
    │   └── page.tsx
    ├── public/
    ├── next.config.ts
    └── tsconfig.json
```

---

## 🧰 Technologies utilisées

### 🎨 Frontend

* React
* NextJs
* TailwindCSS
* socket.io-client

### ⚙️ Backend

* NestJs
* PostgreSQL
* Better Auth
* socket.io
* prisma

### 🧪 Outils

* Supabase
* TurboRepo
* Postman

---

## 🧩 Installation

### 1️⃣ Cloner le dépôt et installer les dependance

```bash
git clone https://github.com/EpitechMscProPromo2028/T-JSF-600-MPL_11.git
cd T-JSF-600-MPL_11
pnpm i
```

### 2️⃣ créer la db et les table 
```bash
cd packages/type
pnpx prisma generate
pnpx db push
```

### 3️⃣ Lancer le projet

```bash
turbo dev
```

### 5️⃣ Configurer les variables d’environnement

Créez un fichier `.env` à la racine du dossier **database** et ajoutez :

```env
DATABASE_URL=
```
Créez un fichier `.env` à la racine du dossier **back** et ajoutez :

```env
LOCAL_FRONT_URL=
NETWORK_FRONT_URL=
PORT=
DATABASE_URL=
```
Créez un fichier `.env.local` à la racine du dossier **front** et ajoutez :

```env
NEXT_PUBLIC_API_HTTP=
```

➡️ Remplissez les champs selon votre configuration locale.

---


## 🚀 Utilisation

Une fois les serveurs lancés :

* Frontend : [http://localhost:3000](http://localhost:3000)
* Backend : [http://localhost:3001](http://localhost:3001)

---

## 👥 Contributeurs

| Nom               | Rôle        | Contact                                                     |
| ----------------- | ----------- | ----------------------------------------------------------- |
| **Tiffy Bastien** | Développeur | [bastien.tiffy@epitech.eu](mailto:bastien.tiffy@epitech.eu) |
| **Delly Cyril**   | Développeur | [cyril.delly@epitech.eu](mailto:cyril.delly@epitech.eu)     |
| **Galian Victor**   | Développeur | [victor.galian@epitech.eu](mailto:victor.galian@epitech.eu)     |
| **Bousquet Louis**   | Développeur | [Louis.Bousquet@epitech.eu](mailto:Louis.Bousquet@epitech.eu)     |

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.