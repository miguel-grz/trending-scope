import asyncio

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

PERIODS = ["daily", "weekly", "monthly"]


def start_scheduler(async_job) -> BackgroundScheduler:
    """Runs async_job() every 2 hours in the background."""
    scheduler = BackgroundScheduler()

    def run_job():
        asyncio.run(async_job())

    scheduler.add_job(run_job, IntervalTrigger(hours=2), id="scrape_trending", replace_existing=True)
    scheduler.start()
    return scheduler
