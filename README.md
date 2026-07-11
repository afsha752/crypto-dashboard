# 🪙 Crypto Dashboard

A full-stack cryptocurrency dashboard with real-time prices, user authentication, a personal portfolio tracker, and live news — built from scratch as a hands-on learning project.

## Live Demo
- **Frontend**: https://crypto-dashboard-afsha1.vercel.app/
- **Backend API**: https://crypto-dashboard-backend-03es.onrender.com

## Features

- **Authentication** — Secure signup/login with encrypted passwords (bcrypt) and JWT-based sessions
- **Live Prices** — Real-time cryptocurrency prices for the top 20 coins by market cap (CoinGecko API)
- **Search** — Instantly filter coins by name
- **Favorites** — Star coins to save them, synced to your account in a real database (not just localStorage)
- **Portfolio Tracker** — Add coins you own with quantity, see live calculated value and total portfolio worth
- **Charts** — Click any coin to view its 7-day price history as an interactive line chart
- **News** — Latest crypto news headlines with images

## Tech Stack

**Frontend:**
- React (Hooks: useState, useEffect)
- Vite
- Recharts (charting)
- Deployed on Vercel

**Backend:**
- Node.js + Express
- MongoDB Atlas (database)
- Mongoose (ODM)
- JWT + bcrypt (authentication)
- Deployed on Render

**External APIs:**
- CoinGecko (prices & charts)
- RSS2JSON + CoinTelegraph RSS (news)

## Architecture

- React Frontend (Vercel) sends requests using fetch()
- Express Backend (Render) receives requests and talks to the database using Mongoose
- MongoDB Atlas stores all the data (users, favorites, portfolio holdings)

## Running Locally

**Frontend:**
```bash
git clone https://github.com/afsha752/crypto-dashboard.git
cd crypto-dashboard
npm install
npm run dev
```

**Backend:**
```bash
git clone https://github.com/afsha752/crypto-dashboard-backend.git
cd crypto-dashboard-backend
npm install
# Create a .env file with MONGO_URI, JWT_SECRET, and PORT
npm run dev
```

## What I Learned

Building this project took me from a basic React app to a genuine full-stack application. Key things I learned:
- Managing state and side effects with React Hooks
- Integrating and consuming public REST APIs
- Building a backend server with Express and structuring routes/models
- Implementing secure authentication (password hashing, JWT tokens, protected routes)
- Designing a MongoDB schema and connecting it via Mongoose
- Deploying a frontend (Vercel) and backend (Render) separately, and connecting them
- Debugging real-world issues: DNS/connection errors, CORS, environment variable configuration, and third-party API changes
