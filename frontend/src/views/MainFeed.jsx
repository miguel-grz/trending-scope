import { useEffect, useState } from 'react'
import { getTrending, getLanguages } from '../api'
import RepoCard from '../components/RepoCard'
import SkeletonCard from '../components/SkeletonCard'
import RepoDetailModal from '../components/RepoDetailModal'

export default function MainFeed({ period }) {
  const [repos, setRepos] = useState([])
  const [languages, setLanguages] = useState([])
  const [language, setLanguage] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)

  useEffect(() => {
    getLanguages()
      .then(setLanguages)
      .catch(() => setLanguages([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getTrending(period, language)
      .then((data) => {
        if (!cancelled) setRepos(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load trending repositories. Is the backend running?')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [period, language])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text-primary">Trending on GitHub</h1>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading &&
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && !error && repos.length === 0 && (
          <p className="col-span-full py-12 text-center text-text-secondary">
            No trending repositories found for this filter yet.
          </p>
        )}

        {!loading &&
          repos.map((repo) => (
            <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} onClick={() => setSelectedRepo(repo)} />
          ))}
      </div>

      {selectedRepo && <RepoDetailModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />}
    </div>
  )
}
