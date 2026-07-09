import re

import httpx
from bs4 import BeautifulSoup

TRENDING_URL = "https://github.com/trending"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def _parse_count(text: str) -> int:
    """Parse strings like '12,345', '1,234 stars today', '2.1k' into an int."""
    if not text:
        return 0
    text = text.strip().replace(",", "")
    match = re.search(r"[\d.]+[kKmM]?", text)
    if not match:
        return 0
    value = match.group(0)
    multiplier = 1
    if value[-1] in "kK":
        multiplier = 1_000
        value = value[:-1]
    elif value[-1] in "mM":
        multiplier = 1_000_000
        value = value[:-1]
    try:
        return int(float(value) * multiplier)
    except ValueError:
        return 0


async def scrape_trending(period: str) -> list[dict]:
    """Scrape https://github.com/trending?since=<period> and return a list of repo dicts."""
    params = {"since": period}
    async with httpx.AsyncClient(headers=HEADERS, timeout=20, follow_redirects=True) as client:
        response = await client.get(TRENDING_URL, params=params)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    articles = soup.select("article.Box-row")

    results = []
    for rank, article in enumerate(articles, start=1):
        heading = article.select_one("h2 a")
        if not heading or not heading.get("href"):
            continue

        href = heading["href"].strip("/")
        parts = href.split("/")
        if len(parts) < 2:
            continue
        owner, name = parts[0], parts[1]

        desc_tag = article.select_one("p")
        description = desc_tag.get_text(strip=True) if desc_tag else ""

        lang_tag = article.select_one("[itemprop='programmingLanguage']")
        language = lang_tag.get_text(strip=True) if lang_tag else "Unknown"

        star_link = article.select_one(f"a[href='/{owner}/{name}/stargazers']")
        stars_total = _parse_count(star_link.get_text()) if star_link else 0

        fork_link = article.select_one(f"a[href='/{owner}/{name}/forks']")
        forks = _parse_count(fork_link.get_text()) if fork_link else 0

        period_span = article.select_one("span.d-inline-block.float-sm-right")
        stars_period = _parse_count(period_span.get_text()) if period_span else 0

        results.append(
            {
                "owner": owner,
                "name": name,
                "description": description,
                "language": language or "Unknown",
                "stars_total": stars_total,
                "stars_period": stars_period,
                "forks": forks,
                "rank": rank,
                "url": f"https://github.com/{owner}/{name}",
                "avatar_url": f"https://github.com/{owner}.png",
            }
        )

    return results
