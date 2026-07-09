# 🪙 Crypto Dashboard

A React-based cryptocurrency dashboard built as a hands-on learning project. Tracks live prices, lets you search and favorite coins, view 7-day price charts, and browse crypto news — all in real time.

## Features

- **Live Prices** — Real-time cryptocurrency prices for the top 20 coins by market cap, pulled from the CoinGecko API
- **Search** — Instantly filter coins by name
- **Favorites** — Star coins to save them, persisted using localStorage (survives page refresh)
- **Charts** — Click any coin to view its 7-day price history as an interactive line chart
- **News** — Latest crypto news headlines with images, linking to full articles

## Tech Stack

- React (with Hooks: useState, useEffect)
- Vite (build tool)
- Recharts (charting library)
- CoinGecko API (price data)
- RSS2JSON + CoinTelegraph RSS (news data)
- Plain CSS

## Running Locally

\`\`\`bash
git clone https://github.com/afsha752/crypto-dashboard.git
cd crypto-dashboard
npm install
npm run dev
\`\`\`

Then open `http://localhost:5173` in your browser.

## What I Learned

Building this project helped me understand React fundamentals — component state, side effects with useEffect, working with real external APIs, conditional rendering, and structuring a multi-feature single-page app from scratch.