import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api'
import LanguageBadge from '../components/LanguageBadge'
import { formatNumber } from '../format'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getLeaderboard()
      .then(setRows)
      .catch(() => setError('Could not load the leaderboard.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold text-text-primary">All-time Leaderboard</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Repositories ranked by how many distinct days they've appeared in GitHub's daily trending list.
      </p>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-text-secondary">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Repository</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Days trending</th>
              <th className="px-4 py-3 font-medium">Peak stars/day</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={5}>
                    <div className="skeleton h-4 w-full rounded bg-border" />
                  </td>
                </tr>
              ))}

            {!loading && rows.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                  No leaderboard data yet.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row, i) => (
                <tr key={`${row.owner}/${row.name}`} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 text-text-secondary">{i + 1}</td>
                  <td className="px-4 py-3">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-text-primary hover:text-accent hover:underline"
                    >
                      <span className="text-text-secondary">{row.owner}/</span>
                      {row.name}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <LanguageBadge language={row.language} />
                  </td>
                  <td className="px-4 py-3 text-text-primary">{row.days_in_trending}</td>
                  <td className="px-4 py-3 text-accent">+{formatNumber(row.peak_stars)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
