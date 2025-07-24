# 🎬 Movie Search Backend Assessment

## Overview
This is a lightweight, backend-powered movie search app using Node.js and the OMDb API. It was built for a backend internship technical assessment at DEPT®.

## 🧩 Features
- **Search movies** via OMDb API (`s=…`)
- **🎯 "More Info" details** — fetches full movie info using `i=…`
- **Recent search history** (last 5 per session) ✔️
- **In-memory caching** (5 min TTL) for performance
- **Input sanitization** — prevents injection & malformed inputs
- **Robust error handling** — covers API and network failures
- **Rate limiting** (30 req/min per IP) to prevent abuse
- **Frontend** built with HTML + Tailwind, separated from backend logic

## 🛠️ Tech Stack
- Node.js & Express
- Axios for HTTP requests
- `node-cache` for simple caching
- `dotenv` for environment variables
- Tailwind CSS (via CDN) on frontend
- Jest + Supertest for testing

## 🧠 Architecture & Reasoning
- **Separated layers** — frontend (`public/`) and backend (`src/`) are modular and clean
- **`server.js`** starts the Express app from `src/app.js`, enabling clean testability
- **Caching & sanitization** in `movieService.js` ensures efficient and safe API usage
- **Rate limiting** applied at `/search` endpoint for security
- **Session-like recent searches** stored in-memory — lightweight and efficient
- **Testing** thoroughly covers `/search` endpoint, error cases, and mock scenarios

## 🚀 Getting Started
**Clone the repo** and install dependencies:
- git clone <repo-url>
- cd movie-search-api
- npm install
- **Add your .env file** with OMDB_API_KEY=your_api_key_here
- **Run tests:**
- npm test
- **Start the server:** 
- npm run dev
- **Visit:**
- http://localhost:3000
