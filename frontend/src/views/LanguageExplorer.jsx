import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { getStats, getLanguages, getTrending } from '../api'
import { languageColor } from '../languageColors'
import RepoCard from '../components/RepoCard'
import SkeletonCard from '../components/SkeletonCard'
import RepoDetailModal from '../components/RepoDetailModal'

export default function LanguageExplorer() {
  const [stats, setStats] = useState(null)
  const [languages, setLanguages] = useState([])
  const [language, setLanguage] = useState('all')
  const [filteredRepos, setFilteredRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState(null)

  useEffect(() => {
    Promise.all([getStats(), getLanguages()])
      .then(([statsData, langData]) => {
        setStats(statsData)
        setLanguages(langData)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false
    setListLoading(true)
    getTrending('weekly', language)
      .then((data) => {
        if (!cancelled) setFilteredRepos(data)
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [language])

  const barData = (stats?.top_languages_weekly || []).slice(0, 10)
  const pieData = stats?.language_distribution || []

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text-primary">Language Explorer</h1>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Top 10 languages this week</h2>
          {loading && <div className="skeleton h-72 w-full rounded-lg bg-border/40" />}
          {!loading && barData.length === 0 && (
            <p className="py-10 text-center text-sm text-text-secondary">Not enough weekly data yet.</p>
          )}
          {!loading && barData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid stroke="#30363d" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#8b949e" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="language" type="category" stroke="#8b949e" fontSize={12} width={90} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                  labelStyle={{ color: '#e6edf3' }}
                  cursor={{ fill: 'rgba(63,185,80,0.08)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.language} fill={languageColor(entry.language)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Today's language distribution</h2>
          {loading && <div className="skeleton h-72 w-full rounded-lg bg-border/40" />}
          {!loading && pieData.length === 0 && (
            <p className="py-10 text-center text-sm text-text-secondary">Not enough daily data yet.</p>
          )}
          {!loading && pieData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="language" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.language} fill={languageColor(entry.language)} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">
          {language === 'all' ? 'Trending this week' : `${language} repos trending this week`}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          {!listLoading && filteredRepos.length === 0 && (
            <p className="col-span-full py-8 text-center text-text-secondary">No repositories found for this language.</p>
          )}
          {!listLoading &&
            filteredRepos.map((repo) => (
              <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} onClick={() => setSelectedRepo(repo)} />
            ))}
        </div>
      </div>

      {selectedRepo && <RepoDetailModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />}
    </div>
  )
}
