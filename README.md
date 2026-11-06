# FSD
Real-time bidding and auction platform with fraud detection.

## Deploy the web client to Vercel

The Vite client lives in `client_new/client`. Import this repository into Vercel and set the project **Root Directory** to `client_new/client`. Vercel detects Vite automatically; the build command is `npm run build` and the output directory is `dist`.

Set these Vercel environment variables before deploying:

- `VITE_API_URL` — the deployed backend API base URL, including `/api` (for example, `https://your-backend.example.com/api`).
- `VITE_SOCKET_URL` — the deployed backend origin used by Socket.IO (for example, `https://your-backend.example.com`).

The client includes a Vercel rewrite so React Router routes work when opened directly. The Express and Socket.IO backend in `server` must run on a host that supports a persistent Node.js server and WebSocket connections; Vercel hosts the static client here. Configure the backend's `MONGO_URI`, `JWT_SECRET`, and Cloudinary settings as environment variables on that host. Do not put production secrets in the repository. Set the backend CORS allowlist to the Vercel site's origin before launch.

On the backend host, set `CLIENT_ORIGIN` to the exact Vercel site origin (without a trailing slash); comma-separate additional allowed origins if needed. The backend's `.env` file is for local development only. Copy `server/.env.example` for local setup and keep real credentials in the hosting provider's environment settings.

If any real credentials have been committed in `.env` files, rotate them; removing a file from the latest revision does not remove it from Git history.
