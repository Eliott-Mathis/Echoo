# Copilot Instructions for Echoo

This project is a simplified real-time chat platform inspired by Discord, built for rapid development and future scalability.

## Architecture Overview

- **Frontend:** React (Vite, TypeScript, Tailwind CSS)
- **Backend:** Fastify (Node.js)
- **Auth:** JWT (JSON Web Token)
- **Realtime:** Socket.io
- **Database:** PostgreSQL, ORM: Prisma

## Key Features

- User registration and login
- Channel creation and management
- Real-time messaging in channels
- Member management per channel

## Developer Workflows

- **Frontend:**
  - Start: `npm run dev` (Vite)
  - Build: `npm run build`
  - Lint/format: `npm run lint` / `npm run format`
- **Backend:**
  - Start: `npm run dev` (nodemon or ts-node)
  - Build: `npm run build`
  - Test: `npm test` (if tests present)
- **Database:**
  - Migrate: `npx prisma migrate dev`
  - Use PostgreSQL for all environments

## Project Conventions

- Keep code and logic simple; prefer readability and speed over premature optimization
- Use clear folder separation: `/frontend`, `/backend`, `/prisma` (migrations/models)
- API endpoints should be RESTful and return JSON
- Use Socket.io namespaces/rooms for channel-based messaging
- JWT tokens are required for all authenticated routes and socket connections
- Use environment variables for secrets and DB config

## Integration Points

- Frontend communicates with backend via REST (auth, CRUD) and Socket.io (messaging)
- Backend validates JWT on both HTTP and WebSocket connections
- Database models: Users, Channels, Messages, ChannelMembers

## Example Patterns

- **Channel join:**
  - Frontend emits `joinChannel` via Socket.io with channel ID and JWT
  - Backend validates JWT, adds user to Socket.io room, emits `channelJoined`
- **Message send:**
  - Frontend emits `sendMessage` with content, channel ID, JWT
  - Backend validates, saves to DB, broadcasts to channel room

## References

- See `/README.md` for high-level goals and setup
- Use `/prisma` for DB schema and migrations
- Place new features in clearly named folders/files

---

**For AI agents:**

- Prioritize working code and rapid iteration
- Follow the above conventions for new features
- Reference this file and README.md for project context
