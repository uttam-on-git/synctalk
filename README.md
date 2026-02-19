# SyncTalk Frontend

Frontend client for SyncTalk chat.

## Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO client

## Core Features
- Registration and login flow
- JWT-based session handling
- Realtime room and message updates
- Room list with unread message badges
- Temporary room countdown display
- Join private room by invite code
- Creator controls for room privacy
- Creator-only invite code visibility
- Typing indicators and online users
- Message edit/delete UI for message owner
- AI room summary and smart reply suggestions

## Prerequisites
- Node.js 18+
- Running backend at `http://localhost:3001`

## Environment Variables
Create `D:\assignments\synctalk\.env`:

```env
VITE_BACKEND_API_URL="http://localhost:3001"
```

## Local Setup
1. Install dependencies
```bash
npm install
```

2. Start frontend
```bash
npm run dev
```

App runs on `http://localhost:5173`.

## Scripts
- `npm run dev` start dev server
- `npm run build` build production bundle
- `npm run lint` run linter
- `npm run format` format files with Prettier
- `npm run preview` preview production build

## Important Pages
- `/` landing page
- `/register` register user
- `/login` login user
- `/chat` main chat workspace

## Notes
- If token is invalid/expired, app redirects to login.
- Frontend expects backend socket and REST APIs on `VITE_BACKEND_API_URL`.
