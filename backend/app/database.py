import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "trendingscope.db"


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS repos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                url TEXT,
                avatar_url TEXT,
                first_seen TEXT NOT NULL,
                UNIQUE(owner, name)
            );

            CREATE TABLE IF NOT EXISTS snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
                period TEXT NOT NULL,
                language TEXT,
                stars_total INTEGER NOT NULL DEFAULT 0,
                stars_period INTEGER NOT NULL DEFAULT 0,
                forks INTEGER NOT NULL DEFAULT 0,
                rank INTEGER,
                trending_date TEXT NOT NULL,
                scraped_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_snapshots_repo ON snapshots(repo_id);
            CREATE INDEX IF NOT EXISTS idx_snapshots_period_date ON snapshots(period, trending_date);
            """
        )
