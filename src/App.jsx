import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

function App() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('all')
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  const [selectedCoin, setSelectedCoin] = useState(null)
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  // Fetch coin prices (this was missing!)
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

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Fetch chart data whenever a coin is selected
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

  // Fetch news once (only one news fetch now, using rss2json)
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

  const toggleFavorite = (coinId) => {
    if (favorites.includes(coinId)) {
      setFavorites(favorites.filter((id) => id !== coinId))
    } else {
      setFavorites([...favorites, coinId])
    }
  }

  const baseCoins = view === 'favorites'
    ? coins.filter((coin) => favorites.includes(coin.id))
    : coins

  const filteredCoins = baseCoins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>🪙 Crypto Dashboard</h1>
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
        </div>
      </header>

      <main>
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
                <img src={article.thumbnail} alt="" className="news-image" />
                <div>
                  <p className="news-title">{article.title}</p>
                  <p className="news-source">CoinTelegraph</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {view !== 'news' && (
          <>
            {loading && <p>Loading prices...</p>}
            {error && <p>{error}</p>}

            {selectedCoin && (
              <div className="chart-panel">
                <div className="chart-header">
                  <h2>{selectedCoin} - 7 Day Price</h2>
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

            {!loading && !error && (
              <ul className="coin-list">
                {filteredCoins.map((coin) => (
                  <li
                    key={coin.id}
                    className="coin-item"
                    onClick={() => setSelectedCoin(coin.id)}
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
                    <span>{coin.name}</span>
                    <span>${coin.current_price.toLocaleString()}</span>
                  </li>
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