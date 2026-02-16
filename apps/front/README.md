# 🛣️ Routes

## Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | User login |
| `/auth/register` | User registration |

## Protected Routes (Requires Authentication)

| Route | Description |
|-------|-------------|
| `/chat` | Main chat dashboard |
| `/chat/addservers` | Create servers |
| `/chat/prive` | Private/direct messages |
| `/chat/[serverId]` | Specific server view |
| `/chat/[serverId]/addchannel` | Create channel in server|
| `/chat/[serverId]/[channelId]` | Channel chat interface |

# 📁 Project Structure

```
app/
├── auth/
│   ├── login/          # Login page
│   └── register/       # Registration page
├── chat/
│   ├── page.tsx        # Main chat interface
│   ├── navbar/         # Chat navigation bar
│   ├── addservers/     # Create servers
│   ├── prive/          # Private messages
│   └── [serverId]/     # Dynamic server routes
│       ├── page.tsx    # Server overview
│       ├── addchannel/ # Create new channel
│       └── [channelId]/# Dynamic channel chat view
├── components/
│   └── Hero.tsx        # Landing page hero component
├── config/
│   └── env.ts          # Environment configuration
└── lib/
    └── auth-client.ts  # Authentication client setup
```

# 🎨 Styling

The application uses:
- **Tailwind CSS** - Utility-first CSS (if configured)

# 🔧 Configuration

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=
```

## Authentication

Authentication is handled through the Better Auth client configured in `lib/auth-client.ts`. The client manages:
- Session tokens
- User state
- Protected route access

# 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth Client
- **Real-time**: Socket.IO Client

# 🔐 Authentication Flow

1. User visits `/auth/register` to create account
2. User logs in at `/auth/login`
3. Auth token stored and managed by `auth-client.ts`
4. Authenticated users access `/chat` and nested routes

# 🗂️ Key Features by Route

## `/chat` - Main Dashboard
- List of user's servers
- Quick access to private messages
- Server creation button

## `/chat/[serverId]` - Server View
- Channel list sidebar
- Server members list
- Channel navigation

## `/chat/[serverId]/[channelId]` - Channel Chat
- Real-time message feed
- Message input
- Member list

# 🧪 Testing

```bash
pnpm run test
pnpm run test:watch
```
