# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Create a new user account |
| `POST` | `/auth/login` | Authenticate and get tokens |
| `POST` | `/auth/logout` | Invalidate tokens |
| `GET` | `/me` | Get current user information |

## Servers (Communities/Guilds)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/servers` | Create a new server |
| `GET` | `/servers` | List user's servers |
| `GET` | `/servers/{id}` | Get server details |
| `PUT` | `/servers/{id}` | Update server |
| `DELETE` | `/servers/{id}` | Delete server |
| `POST` | `/servers/{id}/join` | Join a server |
| `DELETE` | `/servers/{id}/leave` | Leave a server |
| `GET` | `/servers/{id}/members` | List server members |
| `PUT` | `/servers/{id}/members/{userId}` | Update member role |

## Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/servers/{serverId}/channels` | Create a channel |
| `GET` | `/servers/{serverId}/channels` | List server channels |
| `GET` | `/channels/{id}` | Get channel details |
| `PUT` | `/channels/{id}` | Update channel |
| `DELETE` | `/channels/{id}` | Delete channel |
| `POST` | `/channels/{id}/join` | Join a channel |
| `DELETE` | `/channels/{id}/leave` | Leave a channel |

## Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/channels/{id}/messages` | Send a message |
| `GET` | `/channels/{id}/messages` | Get channel message history |
| `DELETE` | `/messages/{id}` | Delete message |

# 🔌 WebSocket Events

The application uses Socket.IO for real-time communication. Connect to the WebSocket server and listen for these events:

- `joinRoom` - join channel
- `leaveRoom` - leave channel
- `typing` - when typing
- `stopTyping` - when stop typing
- `chatToServer` - for new message
- `messageUpdated` - for update message
- `messageDelete` - for delete message

# 🏗️ Project Structure
```
src/
├── auth/           # Authentication logic and guards
├── channel/        # Channel CRUD operations
├── chat/           # WebSocket gateway for real-time messaging
├── member/         # Server member management
├── member-channel/ # Channel member management
├── messages/       # Message CRUD operations
├── prisma/         # Database client and schema
├── servers/        # Servers CRUD operations
└── user/           # User CRUD operations