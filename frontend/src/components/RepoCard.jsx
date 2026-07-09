import LanguageBadge from './LanguageBadge'
import { formatNumber } from '../format'

export default function RepoCard({ repo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/60 hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center gap-3">
        <img
          src={repo.avatar_url}
          alt={repo.owner}
          className="h-10 w-10 rounded-full border border-border"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">
            <span className="text-text-secondary">{repo.owner}/</span>
            {repo.name}
          </p>
          <LanguageBadge language={repo.language} />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
        {repo.description || 'No description provided.'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <StarIcon /> {formatNumber(repo.stars_total)}
        </span>
        <span className="inline-flex items-center gap-1 text-accent">
          <ArrowUpIcon /> {formatNumber(repo.stars_period)} today
        </span>
        <span className="inline-flex items-center gap-1">
          <ForkIcon /> {formatNumber(repo.forks)}
        </span>
      </div>
    </button>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

function ForkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      <path d="M8 14.25a.75.75 0 0 1-.75-.75V4.56L3.7 8.03a.75.75 0 0 1-1.1-1.02l4.65-5a.75.75 0 0 1 1.1 0l4.65 5a.75.75 0 1 1-1.1 1.02L8.75 4.56v8.94a.75.75 0 0 1-.75.75Z" />
    </svg>
  )
}
