export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full bg-border" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded bg-border" />
          <div className="skeleton h-3 w-1/3 rounded bg-border" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full rounded bg-border" />
        <div className="skeleton h-3 w-4/5 rounded bg-border" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="skeleton h-3 w-12 rounded bg-border" />
        <div className="skeleton h-3 w-12 rounded bg-border" />
        <div className="skeleton h-3 w-12 rounded bg-border" />
      </div>
    </div>
  )
}
