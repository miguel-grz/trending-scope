import datetime as dt

from .database import get_conn


def _now() -> str:
    return dt.datetime.utcnow().isoformat(timespec="seconds")


def _today() -> str:
    return dt.datetime.utcnow().date().isoformat()


def upsert_repo(conn, owner, name, description, url, avatar_url) -> int:
    row = conn.execute("SELECT id FROM repos WHERE owner=? AND name=?", (owner, name)).fetchone()
    if row:
        repo_id = row["id"]
        conn.execute(
            "UPDATE repos SET description=?, url=?, avatar_url=? WHERE id=?",
            (description, url, avatar_url, repo_id),
        )
        return repo_id

    cur = conn.execute(
        "INSERT INTO repos (owner, name, description, url, avatar_url, first_seen) VALUES (?, ?, ?, ?, ?, ?)",
        (owner, name, description, url, avatar_url, _today()),
    )
    return cur.lastrowid


def insert_snapshot(conn, repo_id, period, language, stars_total, stars_period, forks, rank, batch_time):
    conn.execute(
        """INSERT INTO snapshots
           (repo_id, period, language, stars_total, stars_period, forks, rank, trending_date, scraped_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (repo_id, period, language, stars_total, stars_period, forks, rank, batch_time[:10], batch_time),
    )


def store_scrape_results(period: str, repos: list[dict]) -> None:
    """All repos from one scrape share the same scraped_at timestamp, so a single
    scrape run can always be identified precisely (MAX(scraped_at)) even if the
    scraper happens to run more than once within the same calendar day."""
    batch_time = _now()
    with get_conn() as conn:
        for r in repos:
            repo_id = upsert_repo(conn, r["owner"], r["name"], r["description"], r["url"], r["avatar_url"])
            insert_snapshot(
                conn,
                repo_id,
                period,
                r["language"],
                r["stars_total"],
                r["stars_period"],
                r["forks"],
                r["rank"],
                batch_time,
            )


def get_trending(period: str, language: str = "all") -> list[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT MAX(scraped_at) as t FROM snapshots WHERE period=?", (period,)).fetchone()
        latest_scrape = row["t"]
        if not latest_scrape:
            return []

        query = """
            SELECT r.owner, r.name, r.description, r.url, r.avatar_url, r.first_seen,
                   s.language, s.stars_total, s.stars_period, s.forks, s.rank, s.trending_date
            FROM snapshots s
            JOIN repos r ON r.id = s.repo_id
            WHERE s.period=? AND s.scraped_at=?
        """
        params = [period, latest_scrape]
        if language and language.lower() != "all":
            query += " AND LOWER(s.language)=LOWER(?)"
            params.append(language)
        query += " ORDER BY s.rank ASC"

        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def get_repo_history(owner: str, name: str):
    with get_conn() as conn:
        repo = conn.execute("SELECT * FROM repos WHERE owner=? AND name=?", (owner, name)).fetchone()
        if not repo:
            return None

        # One row per calendar day: if the scraper ran more than once on the
        # same day, keep only the most recent snapshot for that day.
        rows = conn.execute(
            """
            SELECT trending_date, stars_total, stars_period, forks, language, rank
            FROM snapshots
            WHERE id IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY trending_date ORDER BY scraped_at DESC
                    ) as rn
                    FROM snapshots WHERE repo_id=? AND period='daily'
                ) WHERE rn = 1
            )
            ORDER BY trending_date ASC
            """,
            (repo["id"],),
        ).fetchall()
        history = [dict(r) for r in rows]

        dates = sorted({h["trending_date"] for h in history})
        streak = 0
        if dates:
            date_set = set(dates)
            cursor = dt.date.fromisoformat(dates[-1])
            while cursor.isoformat() in date_set:
                streak += 1
                cursor -= dt.timedelta(days=1)

        return {
            "repo": dict(repo),
            "history": history,
            "consecutive_days": streak,
            "total_days_tracked": len(dates),
        }


def get_languages() -> list[str]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT DISTINCT language FROM snapshots WHERE language IS NOT NULL AND language != '' ORDER BY language ASC"
        ).fetchall()
        return [r["language"] for r in rows]


def get_stats() -> dict:
    with get_conn() as conn:
        most_repeated = conn.execute(
            """SELECT r.owner, r.name, r.url, COUNT(DISTINCT s.trending_date) as days_count
               FROM snapshots s JOIN repos r ON r.id = s.repo_id
               WHERE s.period='daily'
               GROUP BY s.repo_id ORDER BY days_count DESC LIMIT 10"""
        ).fetchall()

        latest_daily_scrape = conn.execute(
            "SELECT MAX(scraped_at) as t FROM snapshots WHERE period='daily'"
        ).fetchone()["t"]
        latest_weekly_scrape = conn.execute(
            "SELECT MAX(scraped_at) as t FROM snapshots WHERE period='weekly'"
        ).fetchone()["t"]

        daily_lang_dist = []
        avg_stars_today = 0
        latest_date = None
        if latest_daily_scrape:
            latest_date = latest_daily_scrape[:10]
            daily_lang_dist = conn.execute(
                """SELECT language, COUNT(*) as count FROM snapshots
                   WHERE period='daily' AND scraped_at=?
                   GROUP BY language ORDER BY count DESC""",
                (latest_daily_scrape,),
            ).fetchall()
            avg_row = conn.execute(
                "SELECT AVG(stars_period) as avg_stars FROM snapshots WHERE period='daily' AND scraped_at=?",
                (latest_daily_scrape,),
            ).fetchone()
            avg_stars_today = round(avg_row["avg_stars"] or 0, 1)

        weekly_lang_dist = []
        if latest_weekly_scrape:
            weekly_lang_dist = conn.execute(
                """SELECT language, COUNT(*) as count FROM snapshots
                   WHERE period='weekly' AND scraped_at=?
                   GROUP BY language ORDER BY count DESC LIMIT 10""",
                (latest_weekly_scrape,),
            ).fetchall()

        return {
            "most_repeated_repos": [dict(r) for r in most_repeated],
            "language_distribution": [dict(r) for r in daily_lang_dist],
            "top_languages_weekly": [dict(r) for r in weekly_lang_dist],
            "avg_stars_today": avg_stars_today,
            "latest_date": latest_date,
        }


def get_leaderboard() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT r.owner, r.name, r.url,
                      (SELECT language FROM snapshots WHERE repo_id=r.id ORDER BY scraped_at DESC LIMIT 1) as language,
                      COUNT(DISTINCT s.trending_date) as days_in_trending,
                      MAX(s.stars_period) as peak_stars
               FROM snapshots s JOIN repos r ON r.id = s.repo_id
               WHERE s.period='daily'
               GROUP BY s.repo_id
               ORDER BY days_in_trending DESC, peak_stars DESC
               LIMIT 100"""
        ).fetchall()
        return [dict(r) for r in rows]
