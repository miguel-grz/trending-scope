// GitHub linguist colors for the most common trending languages.
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Lua: '#000080',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
  Julia: '#a270ba',
  R: '#198CE7',
  Nix: '#7e7eff',
  Dockerfile: '#384d54',
  MDX: '#fcb32c',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
  Unknown: '#8b949e',
}

// Deterministic fallback color for languages not in the table above.
function hashColor(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 55%)`
}

export function languageColor(language) {
  if (!language) return LANGUAGE_COLORS.Unknown
  return LANGUAGE_COLORS[language] || hashColor(language)
}
