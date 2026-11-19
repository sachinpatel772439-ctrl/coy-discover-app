
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000'

function App() {
  const [activeTab, setActiveTab] = useState('Discover')
  const [remaining, setRemaining] = useState([])
  const [matches, setMatches] = useState([])
  const [newMatch, setNewMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)

  // Load feed and matches from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [feedResponse, matchesResponse] = await Promise.all([
          fetch(`${API_URL}/feed`),
          fetch(`${API_URL}/matches`)
        ])

        if (!feedResponse.ok || !matchesResponse.ok) {
          throw new Error('Unable to load data from backend')
        }

        const feedData = await feedResponse.json()
        const matchesData = await matchesResponse.json()

        setRemaining(feedData)
        setMatches(matchesData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Save Like or Pass to backend
  const handleTouchStart = (e) => {
  setTouchStartX(e.touches[0].clientX)
  setIsDragging(true)
}

const handleTouchMove = (e) => {
  if (!isDragging) return

  const currentX = e.touches[0].clientX
  setDragX(currentX - touchStartX)
}

const handleTouchEnd = () => {
  setIsDragging(false)

  if (dragX > 100) {
    setDragX(0)
    handleSwipe(true)
  } else if (dragX < -100) {
    setDragX(0)
    handleSwipe(false)
  } else {
    setDragX(0)
  }
}
  const handleSwipe = async (liked) => {
    const currentProfile = remaining[0]

    if (!currentProfile) return

    try {
      const response = await fetch(`${API_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileId: currentProfile.id,
          action: liked ? 'like' : 'pass'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Swipe failed')
      }

      // Remove swiped profile from feed
      setRemaining(prev => prev.filter(
        profile => profile.id !== currentProfile.id
      ))

      // Update matches only when mutual like happens
      if (result.matched && result.match) {
        setMatches(prev => {
          if (prev.some(item => item.id === result.match.id)) {
            return prev
          }
          return [...prev, result.match]
        })

        setNewMatch(result.match)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const currentProfile = remaining[0]

  return (
    <div className="app-container">
      <header className="top-header">
        <h1>coy<span>.</span></h1>
        <p>Discover meaningful connections</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'Home' ? 'active' : ''}
          onClick={() => setActiveTab('Home')}
        >
          Home
        </button>

        <button
          className={activeTab === 'Discover' ? 'active' : ''}
          onClick={() => setActiveTab('Discover')}
        >
          Discover
        </button>

        <button
          className={activeTab === 'Matches' ? 'active' : ''}
          onClick={() => setActiveTab('Matches')}
        >
          Matches ({matches.length})
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'Home' && (
          <div className="home-placeholder">
            <h2>Welcome to Coy</h2>
            <p>Your Home tab is coming soon.</p>
          </div>
        )}

        {activeTab === 'Discover' && (
          <section className="discover-section">
            <div className="section-heading">
              <h2>Discover</h2>
              <p>Find someone who matches your vibe.</p>
            </div>

            {loading ? (
              <div className="empty-state">
                <h2>Loading profiles...</h2>
              </div>
            ) : error ? (
              <div className="empty-state">
                <h2>Unable to load profiles</h2>
                <p>{error}</p>
              </div>
            ) : currentProfile ? (
              <div
               className={`profile-card ${isDragging ? 'is-dragging' : ''}`}
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={handleTouchEnd}  
               style={{
                transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
               }}
              >
               {dragX > 40 && (
                <div className="swipe-feedback like-feedback">
                  LIKE ❤️
                </div>
               )}

               {dragX < -40 && (
                 <div className="swipe-feedback pass-feedback">
                   PASS ✕
                 </div>
               )}
                
                <div className="profile-image">
                  <img
                    src={currentProfile.photo}
                    alt={currentProfile.name}
                  />

                  <div className="profile-info">
                    <h2>
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    <p>📍 {currentProfile.city}</p>
                  </div>
                </div>

                <div className="profile-details">
                  <p>{currentProfile.bio}</p>

                  <div className="interests">
                    {currentProfile.interests.map(interest => (
                      <span key={interest}>{interest}</span>
                    ))}
                  </div>
                </div>

                <div className="swipe-buttons">
                  <button
                    className="pass-button"
                    onClick={() => handleSwipe(false)}
                    aria-label="Pass profile"
                  >
                    ✕
                  </button>

                  <button
                    className="like-button"
                    onClick={() => handleSwipe(true)}
                    aria-label="Like profile"
                  >
                    ♥
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h2>🎉 All caught up!</h2>
                <p>No more profiles to discover right now.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'Matches' && (
          <section className="matches-section">
            <h2>Your Matches ❤️</h2>

            {matches.length === 0 ? (
              <p className="empty-matches">
                No matches yet. Keep discovering!
              </p>
            ) : (
              <div className="matches-list">
                {matches.map(match => (
                  <div className="match-item" key={match.id}>
                    <img src={match.photo} alt={match.name} />
                    <div>
                      <h3>{match.name}, {match.age}</h3>
                      <p>{match.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {newMatch && (
        <div className="match-overlay">
          <div className="match-popup">
            <h2>It's a Match! ❤️</h2>
            <img src={newMatch.photo} alt={newMatch.name} />
            <p>You and {newMatch.name} liked each other!</p>
            <button onClick={() => setNewMatch(null)}>
              Continue Discovering
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
