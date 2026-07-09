import { languageColor } from '../languageColors'

export default function LanguageBadge({ language }) {
  if (!language) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: languageColor(language) }}
      />
      {language}
    </span>
  )
}
