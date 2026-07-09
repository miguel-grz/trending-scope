import { useState } from 'react'
import Header from './components/Header'
import MainFeed from './views/MainFeed'
import LanguageExplorer from './views/LanguageExplorer'
import Leaderboard from './views/Leaderboard'

function App() {
  const [view, setView] = useState('feed')
  const [period, setPeriod] = useState('daily')

  return (
    <div className="min-h-screen bg-canvas">
      <Header view={view} onViewChange={setView} period={period} onPeriodChange={setPeriod} />
      <main>
        {view === 'feed' && <MainFeed period={period} />}
        {view === 'explorer' && <LanguageExplorer />}
        {view === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  )
}

export default App
