import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { getRepoHistory } from '../api'
import { languageColor } from '../languageColors'
import { formatNumber, formatDate } from '../format'

export default function RepoDetailModal({ repo, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getRepoHistory(repo.owner, repo.name)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load repository history.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [repo.owner, repo.name])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const chartData = (data?.history || []).map((h) => ({
    date: formatDate(h.trending_date),
    stars: h.stars_period,
  }))

  const isNew = data?.repo?.first_seen && data.repo.first_seen === todayISO()

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 sm:pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={repo.avatar_url} alt={repo.owner} className="h-12 w-12 rounded-full border border-border" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                <span className="text-text-secondary">{repo.owner}/</span>
                {repo.name}
              </h2>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent hover:underline"
              >
                View on GitHub ↗
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm text-text-secondary">{repo.description || 'No description provided.'}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs"
            style={{ color: languageColor(repo.language) }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
            {repo.language}
          </span>
          {isNew && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              New in trending
            </span>
          )}
          {data && (
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">
              {data.consecutive_days} consecutive day{data.consecutive_days === 1 ? '' : 's'} trending
            </span>
          )}
          {data?.repo?.first_seen && (
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">
              First seen {formatDate(data.repo.first_seen)}
            </span>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Stars gained per day</h3>
          {loading && <div className="skeleton h-52 w-full rounded-lg bg-border/40" />}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !error && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#30363d" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8b949e" fontSize={12} />
                <YAxis stroke="#8b949e" fontSize={12} tickFormatter={formatNumber} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                  labelStyle={{ color: '#e6edf3' }}
                  formatter={(value) => [formatNumber(value), 'Stars gained']}
                />
                <Line type="monotone" dataKey="stars" stroke="#3fb950" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          {!loading && !error && chartData.length === 0 && (
            <p className="text-sm text-text-secondary">Not enough history yet — check back after the next scrape.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
