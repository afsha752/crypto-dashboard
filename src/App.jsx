import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Login from './Login'
import Signup from './Signup'
import './App.css'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail'))
  const [authView, setAuthView] = useState('login')

  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('all')
  const [favorites, setFavorites] = useState([])

  const [selectedCoin, setSelectedCoin] = useState(null)
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  const [holdings, setHoldings] = useState([])
const [holdingInput, setHoldingInput] = useState('')

  const handleLogin = (newToken, email) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('userEmail', email)
    setToken(newToken)
    setUserEmail(email)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setToken(null)
    setUserEmail(null)
    setFavorites([])
  }

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1')
      .then((response) => response.json())
      .then((data) => {
        setCoins(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load prices. Try again later.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
  if (!token) return

  const loadFavorites = () => {
    fetch('https://crypto-dashboard-backend-03es.onrender.com/api/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch(() => {
        setTimeout(loadFavorites, 3000)
      })
  }

  loadFavorites()
}, [token])

 useEffect(() => {
  if (!token) return

  const loadHoldings = () => {
    fetch('https://crypto-dashboard-backend-03es.onrender.com/api/portfolio', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHoldings(data))
      .catch(() => {
        setTimeout(loadHoldings, 3000)
      })
  }

  loadHoldings()
}, [token])

  useEffect(() => {
    if (!selectedCoin) return

    setChartLoading(true)
    fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=7`)
      .then((response) => response.json())
      .then((data) => {
        const formatted = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: price,
        }))
        setChartData(formatted)
        setChartLoading(false)
      })
      .catch(() => {
        setChartLoading(false)
      })
  }, [selectedCoin])

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss')
      .then((response) => response.json())
      .then((data) => {
        setNews(data.items.slice(0, 15))
        setNewsLoading(false)
      })
      .catch(() => {
        setNewsError('Failed to load news.')
        setNewsLoading(false)
      })
  }, [])

  const toggleFavorite = async (coinId) => {
    const isFavorited = favorites.includes(coinId)

    if (isFavorited) {
      setFavorites(favorites.filter((id) => id !== coinId))
      await fetch(`https://crypto-dashboard-backend-03es.onrender.com/api/favorites/${coinId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } else {
      setFavorites([...favorites, coinId])
      await fetch('http://localhost:5000/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coinId }),
      })
    }
  }
  const addHolding = async (coinId, quantity) => {
  await fetch('https://crypto-dashboard-backend-03es.onrender.com/api/portfolio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ coinId, quantity: parseFloat(quantity) }),
  })

  setHoldings((prev) => {
    const existing = prev.find((h) => h.coinId === coinId)
    if (existing) {
      return prev.map((h) => (h.coinId === coinId ? { ...h, quantity: parseFloat(quantity) } : h))
    }
    return [...prev, { coinId, quantity: parseFloat(quantity) }]
  })
}

const removeHolding = async (coinId) => {
  setHoldings(holdings.filter((h) => h.coinId !== coinId))
  await fetch(`https://crypto-dashboard-backend-03es.onrender.com/api/portfolio/${coinId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

  const baseCoins = view === 'favorites'
    ? coins.filter((coin) => favorites.includes(coin.id))
    : coins

  const filteredCoins = baseCoins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!token) {
    return authView === 'login' ? (
      <Login onLogin={handleLogin} switchToSignup={() => setAuthView('signup')} />
    ) : (
      <Signup switchToLogin={() => setAuthView('login')} />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>🪙 Crypto Dashboard</h1>
          <div className="user-info">
            <span>{userEmail}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="tabs">
          <button
            className={view === 'all' ? 'tab active' : 'tab'}
            onClick={() => setView('all')}
          >
            All Coins
          </button>
          <button
            className={view === 'favorites' ? 'tab active' : 'tab'}
            onClick={() => setView('favorites')}
          >
           ⭐ Favorites
          </button>
          <button
            className={view === 'news' ? 'tab active' : 'tab'}
            onClick={() => setView('news')}
          >
           📰 News
          </button>
          <button
  className={view === 'portfolio' ? 'tab active' : 'tab'}
  onClick={() => setView('portfolio')}
>
  💼 Portfolio
</button>
        </div>
      </header>

      <main>
       {view === 'portfolio' && (
  <div className="portfolio-view">
    <p className="portfolio-total">Total Portfolio Value</p>
<div className="portfolio-total-value">
  $
  {holdings
    .reduce((total, holding) => {
      const coin = coins.find((c) => c.id === holding.coinId)
      const value = coin ? coin.current_price * holding.quantity : 0
      return total + value
    }, 0)
    .toLocaleString(undefined, { maximumFractionDigits: 2 })}
</div>

    <div className="portfolio-add">
      <select
        value={holdingInput}
        onChange={(e) => setHoldingInput(e.target.value)}
      >
        <option value="">Select a coin...</option>
        {coins.map((coin) => (
          <option key={coin.id} value={coin.id}>{coin.name}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Quantity"
        id="quantity-input"
        step="any"
      />
      <button
        onClick={() => {
          const qty = document.getElementById('quantity-input').value
          if (holdingInput && qty) {
            addHolding(holdingInput, qty)
            setHoldingInput('')
            document.getElementById('quantity-input').value = ''
          }
        }}
      >
        Add
      </button>
    </div>

    <ul className="holdings-list">
      {holdings.map((holding) => {
        const coin = coins.find((c) => c.id === holding.coinId)
        if (!coin) return null
        const value = coin.current_price * holding.quantity

        return (
          <li key={holding.coinId} className="holding-item">
            <img src={coin.image} alt={coin.name} width="24" />
           <span className="coin-name">{coin.name}</span>
<span className="holding-quantity">{holding.quantity} {coin.symbol.toUpperCase()}</span>
<span className="holding-value">${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
<button className="remove-holding" onClick={() => removeHolding(holding.coinId)}>✕</button>
          </li>
        )
      })}
    </ul>

    {holdings.length === 0 && <p>No holdings yet. Add a coin above to get started.</p>}
  </div>
)}
        {view === 'news' && (
          <div className="news-list">
            {newsLoading && <p>Loading news...</p>}
            {newsError && <p>{newsError}</p>}
            {!newsLoading && !newsError && news.map((article) => (
              <a
                key={article.guid}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-item"
              >
                {article.thumbnail ? (
                  <img src={article.thumbnail} alt="" className="news-image" />
                ) : (
                  <div className="news-image-placeholder">📰</div>
                )}
                <div>
                  <p className="news-title">{article.title}</p>
                  <p className="news-source">CoinTelegraph</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {view !== 'news' && view !== 'portfolio' && (
          <>
            {loading && <p>Loading prices...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
              <ul className="coin-list">
                {filteredCoins.map((coin) => (
                  <div key={coin.id}>
                    <li
                      className="coin-item"
                      onClick={() => setSelectedCoin(selectedCoin === coin.id ? null : coin.id)}
                    >
                      <button
                        className="star-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(coin.id)
                        }}
                      >
                       {favorites.includes(coin.id) ? '⭐' : '☆'}
                      </button>
                      <img src={coin.image} alt={coin.name} width="24" />
                      <span className="coin-name">{coin.name}</span>
                      <span className="coin-price">${coin.current_price.toLocaleString()}</span>
                      <span className={coin.price_change_percentage_24h >= 0 ? 'price-up' : 'price-down'}>
                      {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </li>

                    {selectedCoin === coin.id && (
                      <div className="chart-panel">
                        <div className="chart-header">
                          <h2>{coin.name} - 7 Day Price</h2>
                         <button onClick={() => setSelectedCoin(null)}>✕ Close</button>
                        </div>
                        {chartLoading && <p>Loading chart...</p>}
                        {!chartLoading && (
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                              <XAxis dataKey="date" stroke="#888" />
                              <YAxis stroke="#888" domain={['auto', 'auto']} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1a1d29', border: 'none' }}
                                labelStyle={{ color: '#fff' }}
                              />
                              <Line type="monotone" dataKey="price" stroke="#2dd4bf" dot={false} strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </ul>
            )}

            {!loading && !error && filteredCoins.length === 0 && view === 'favorites' && (
              <p>You haven't favorited any coins yet. Click a ☆ to add one.</p>
            )}

            {!loading && !error && filteredCoins.length === 0 && view === 'all' && (
              <p>No coins match your search.</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App