# 🎬 Streamify Backend API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens"/>
  <img src="https://img.shields.io/badge/Cloudinary-Media-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Postman-Tested-orange?style=for-the-badge&logo=postman"/>
</p>

<p align="center">
A production-style backend inspired by modern video streaming platforms like YouTube.
Built with Node.js, Express.js, MongoDB, JWT Authentication, Cloudinary, and RESTful APIs.
</p>

---

# 📖 Overview

**Streamify** is a backend project developed to practice real-world backend development concepts and scalable REST API design.

The project includes authentication, video management, playlists, comments, likes, subscriptions, dashboard analytics, search functionality, media uploads, and secure JWT-based authorization.

The primary goal of this project is to understand how production backend systems are structured and how multiple modules communicate together.

---

# 🚀 Features

## 👤 Authentication

- User Registration
- User Login
- User Logout
- Refresh Access Token
- Change Password
- Get Current User
- JWT Authentication
- Secure HTTP-only Cookies

---

## 👥 User Management

- Update Account Details
- Update Avatar
- Update Cover Image
- User Channel Profile
- Watch History

---

## 🎥 Video Management

- Upload Video
- Upload Thumbnail
- Get Single Video
- Get All Videos
- Get Uploaded Videos
- Update Video
- Delete Video
- Publish / Unpublish Video
- Increase View Count

---

## ❤️ Like System

- Like / Unlike Videos
- Toggle Like
- Like Count

---

## 💬 Comment System

- Create Comment
- Get Video Comments
- Update Comment
- Delete Comment

---

## 📁 Playlist System

- Create Playlist
- Update Playlist
- Delete Playlist
- Add Video to Playlist
- Remove Video from Playlist
- Get Playlist

---

## 📺 Channel

- Channel Profile
- Subscriber Count
- Subscription Features

---

## 📊 Dashboard

Dashboard provides:

- Total Uploaded Videos
- Total Views
- Total Likes
- Total Subscribers
- Top Performing Videos
- Recently Uploaded Videos

---

## 🔍 Search

Search videos using:

- Title
- Description
- Pagination
- Case-insensitive Search
- Sorting

---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Hashing | bcrypt |
| File Upload | Multer |
| Cloud Storage | Cloudinary |
| Cookies | cookie-parser |
| Environment | dotenv |
| API Testing | Postman |

---

# 📂 Project Structure

```
src
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── constants/
├── app.js
└── index.js
```

---

# 🔐 Authentication Flow

```text
User Login
      │
      ▼
Access Token + Refresh Token
      │
      ▼
HTTP Only Cookies
      │
      ▼
Protected Routes
```

---

# 🧪 API Testing

All API endpoints have been tested using **Postman**.

The Postman collection includes:

- Authentication APIs
- User APIs
- Video APIs
- Playlist APIs
- Comment APIs
- Like APIs
- Search APIs
- Dashboard APIs

> The Postman collection will be added to the repository.

---

# ⚙️ Environment Variables

Create a `.env` file.

```env
PORT=

MONGODB_URI=

CORS_ORIGIN=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/Sohaib-Arshid/Streamify.git
```

Move inside the project

```bash
cd Streamify
```

Install dependencies

```bash
npm install
```

Start Development Server

```bash
npm run dev
```

---

# 📮 API Modules

| Module | Status |
|---------|--------|
| Authentication | ✅ |
| Users | ✅ |
| Videos | ✅ |
| Comments | ✅ |
| Likes | ✅ |
| Playlists | ✅ |
| Dashboard | ✅ |
| Search | ✅ |
| Channel | ✅ |

---

# 📈 Learning Outcomes

This project helped me practice:

- REST API Development
- Authentication using JWT
- MongoDB Aggregation Pipelines
- Mongoose Relationships
- Pagination
- Search APIs
- Middleware Architecture
- Cloudinary Integration
- File Upload Handling
- Error Handling
- Secure Backend Development
- MVC Architecture
- Backend Project Structure

---

# 🚀 Upcoming Improvements

- Docker Support
- Docker Compose
- Backend Deployment
- API Documentation (Swagger)
- React Frontend Integration
- CI/CD Pipeline

---

# 👨‍💻 Author

## Sohaib Arshid

fullstack Developer 

GitHub:
https://github.com/Sohaib-Arshid

---

## ⭐ If you found this project useful, consider giving it a star.
