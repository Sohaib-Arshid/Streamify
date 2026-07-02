# 🎬 Streamify

A backend REST API for a video-sharing platform — built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, featuring JWT authentication, Cloudinary-powered media storage, playlists, comments, likes, and channel analytics.

> Repository: [github.com/Sohaib-Arshid/Streamify](https://github.com/Sohaib-Arshid/Streamify)

---

## 📖 Description

Streamify is the backend for a YouTube-style video platform. Users can register, upload videos, organize them into playlists, like and comment on content, search across the catalog, and view aggregate statistics for their own channel. Authentication is handled with short-lived access tokens and long-lived refresh tokens delivered as `httpOnly` cookies, and all media (avatars, cover images, video files, thumbnails) is offloaded to Cloudinary rather than stored on the API server.

This README documents the project exactly as implemented in the current source — see [`API_DOCUMENTATION.docx`](#-full-documentation-set) for the complete endpoint reference, including a few known inconsistencies worth being aware of before you build a client against it.

---

## ✨ Features

- **Authentication** — Register, login, logout, and JWT access/refresh token rotation
- **User Profiles** — Avatar & cover image uploads, account detail updates, password change
- **Channel Pages** — Public channel profile with subscriber counts (aggregation-based)
- **Video Management** — Upload, list, search, update, delete, and publish/unpublish videos
- **Watch History & View Counting** — Per-user watch history with one-time-per-user view increments
- **Playlists** — Create, update, delete playlists; add/remove videos
- **Comments** — Create, list (paginated), update, and delete comments per video
- **Likes** — Toggle like/unlike on videos with a live like count
- **Search** — Case-insensitive keyword search across video titles and descriptions
- **Dashboard** — Aggregate channel statistics: views, likes, subscribers, top & recent videos

> ⚠️ Note: The `Subscription` model exists and is used to *read* subscriber counts, but there is currently no Subscribe/Unsubscribe endpoint in the codebase — see the Architecture documentation for details.

---

## 🛠️ Technologies Used

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| File Uploads | Multer (local temp storage) |
| Media Hosting | Cloudinary |
| Pagination Plugin | mongoose-aggregate-paginate-v2 |
| API Testing | Postman |

---

## 🏗️ Architecture Overview

Streamify follows a layered structure:

```
Client → Express App (CORS, body parsing, cookies) → Router → Middleware (Auth / Multer) → Controller → Mongoose Model → MongoDB
                                                                                              ↳ Cloudinary (media)
```

For the full breakdown — request lifecycle, JWT flow, Multer/Cloudinary flow, and module-by-module wiring — see **`ARCHITECTURE.docx`** in the documentation set.

---

## 📁 Folder Structure

```
src/
├── app.js                    # Express app, middleware, route mounting
├── index.js                  # Entry point — env config, DB connect, server start
├── constans.js               # DB_NAME constant
├── db/index.js                # Mongoose connection logic
├── controllers/                # Business logic per feature
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── playlist.controller.js
│   ├── comment.controller.js
│   ├── dashboard.controller.js
│   └── search.controller.js
├── models/                     # Mongoose schemas
│   ├── user.models.js
│   ├── video.models.js
│   ├── playlist.models.js
│   ├── comment.models.js
│   ├── like.models.js
│   └── subscription.models.js
├── middlewares/
│   ├── auth.middleware.js      # verifyJWT
│   └── multer.middlewares.js   # File upload config
├── routes/
│   ├── user.routes.js          # Also wires Comment + Like endpoints
│   ├── video.routes.js
│   ├── playlist.routes.js
│   ├── dashboard.routes.js
│   └── search.routes.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js
└── postman/
    └── streamify.postman_collection.json
```

---

## 🚀 Installation Guide

> ℹ️ The source provided for this documentation did not include a `package.json`. Generate one and install the dependencies actually imported across the codebase:

```bash
git clone https://github.com/Sohaib-Arshid/Streamify.git
cd Streamify
npm init -y
npm install express cors cookie-parser dotenv mongoose mongoose-aggregate-paginate-v2 bcrypt jsonwebtoken multer cloudinary
mkdir -p public/temp
```

Add `"type": "module"` to `package.json` — every source file uses ES-module `import`/`export` syntax.

---

## 🔐 Environment Variables

Create a `.env` file at the project root:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Full explanations for each variable (and a note about a dotenv path quirk in `index.js`) are in **`SETUP_GUIDE.docx`**.

---

## ▶️ Running the Project

```bash
node src/index.js
# or, with a "dev": "node src/index.js" script in package.json
npm run dev
```

Verify it's running:

```bash
curl http://localhost:3000/api/v1/health
# → { "status": "OK", "message": "Server is running" }
```

---

## 📡 API Overview

All routes are prefixed with `/api/v1`.

| Module | Base Path | Description |
|---|---|---|
| Auth & Users | `/api/v1/users` | Register, login, logout, tokens, profile, watch history, comments, likes |
| Videos | `/api/v1/videos` | Upload, list, search, update, delete, publish toggle |
| Playlists | `/api/v1/playlists` | Playlist CRUD, add/remove video |
| Dashboard | `/api/v1/dashboard` | Channel analytics |
| Search | `/api/v1/search` | Keyword video search |
| Health | `/api/v1/health` | Liveness check |

👉 For every endpoint's method, auth requirement, request/response shape, and validation rules, see **`API_DOCUMENTATION.docx`**.

---
Postman

    "name": "streamify",
    "_collection_link": "https://go.postman.co/collection/52978744-89c32e09-fc57-4557-b414-7213bf380117?source=collection_link"

## 🖼️ Project Screenshots

_Add screenshots of your API responses (Postman), or a connected frontend, here:_

```
docs/screenshots/
├── postman-collection.png
├── register-response.png
└── dashboard-stats.png
```

---

## 📬 Postman Collection

A ready-to-import collection is included at [`src/postman/streamify.postman_collection.json`](./src/postman/streamify.postman_collection.json), covering user, video, playlist, comment, dashboard, and search requests.

Set up a Postman environment with a `server` variable pointing at `http://localhost:3000/api/v1`, then run **register → login** first (Postman will persist the auth cookies automatically for later requests).

---

## ☁️ Deployment

Streamify has no platform-specific deployment config (no Dockerfile/render.yaml/Procfile in source), so it deploys like any standard Node/Express app:

```bash
npm install
node src/index.js
```

Set all environment variables from the section above in your hosting platform's secrets manager, ensure MongoDB Atlas network access allows your host's IPs, and serve over HTTPS (required for the `secure` cookies used at login). Full checklist in **`DEPLOYMENT_GUIDE.docx`**.

---

## 🗺️ Future Improvements

- Add a Subscribe/Unsubscribe endpoint (the `Subscription` schema already exists but has no controller/route)
- Add a global Express error-handling middleware so `ApiError` reaches clients as structured JSON
- Fix the compound-uniqueness bugs on `Like` and `Subscription` schemas (see `DATABASE_SCHEMA.docx`)
- Add automated tests (no test suite is currently present)
- Add request validation middleware (e.g. `zod`/`joi`) instead of manual `if` checks per controller
- Add rate limiting on authentication endpoints

---

## 🤝 Contributing

This is currently a personal/learning project. Issues and pull requests are welcome — please open an issue describing the change before submitting a PR.

---

## 📄 License

No license file is currently included in the repository. Add a `LICENSE` file (e.g. MIT) to clarify usage terms for others.

---

## 👤 Author

**Sohaib Arshid**
- GitHub: [@Sohaib-Arshid](https://github.com/Sohaib-Arshid)
- Portfolio: [sohaib-arshid-developer-portfolio.vercel.app](https://sohaib-arshid-developer-portfolio.vercel.app)
- LinkedIn: [sohaib-arshid-008172418](https://linkedin.com/in/sohaib-arshid-008172418)

---

## 📚 Full Documentation Set

This README is one of seven documents generated for this project. The rest go deeper on specific areas:

| Document | Contents |
|---|---|
| `API_DOCUMENTATION.docx` | Every endpoint: method, auth, params, body, validation, responses, errors |
| `ARCHITECTURE.docx` | MVC structure, request lifecycle, JWT/Multer/Cloudinary flows, error handling |
| `DATABASE_SCHEMA.docx` | All 6 MongoDB collections, fields, relationships, ER overview, known schema bugs |
| `SETUP_GUIDE.docx` | Full local setup walkthrough with troubleshooting |
| `DEPLOYMENT_GUIDE.docx` | Production configuration, security checklist, deployment steps |
| `PROJECT_WORKFLOW.docx` | Step-by-step flow for every feature (registration → upload → engagement) |
