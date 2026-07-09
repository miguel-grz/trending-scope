import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import crud
from .database import init_db
from .scheduler import PERIODS, start_scheduler
from .scraper import scrape_trending

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trendingscope")

scheduler_ref = {}


async def scrape_all_periods():
    for period in PERIODS:
        try:
            repos = await scrape_trending(period)
            crud.store_scrape_results(period, repos)
            logger.info("Scraped %d repos for period=%s", len(repos), period)
        except Exception:
            logger.exception("Failed to scrape period=%s", period)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Seed the 3 periods immediately so the app has data on first run.
    await scrape_all_periods()
    scheduler_ref["scheduler"] = start_scheduler(scrape_all_periods)
    yield
    scheduler_ref["scheduler"].shutdown(wait=False)


app = FastAPI(title="TrendingScope API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"name": "TrendingScope API", "status": "ok"}


@app.get("/trending")
async def trending(period: str = Query("daily"), language: str = Query("all")):
    if period not in PERIODS:
        raise HTTPException(400, f"period must be one of {PERIODS}")
    return crud.get_trending(period, language)


@app.get("/repo/{owner}/{name}/history")
async def repo_history(owner: str, name: str):
    result = crud.get_repo_history(owner, name)
    if result is None:
        raise HTTPException(404, "Repository not found")
    return result


@app.get("/languages")
async def languages():
    return crud.get_languages()


@app.get("/stats")
async def stats():
    return crud.get_stats()


@app.get("/leaderboard")
async def leaderboard():
    return crud.get_leaderboard()
