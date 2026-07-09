import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>🪙 Crypto Dashboard</h1>
      </header>

      <main>
        {loading && <p>Loading prices...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <ul className="coin-list">
            {coins.map((coin) => (
              <li key={coin.id} className="coin-item">
                <img src={coin.image} alt={coin.name} width="24" />
                <span>{coin.name}</span>
                <span>${coin.current_price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default App