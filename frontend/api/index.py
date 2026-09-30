import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Add api folder to python path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app as fastapi_app

# Vercel needs the app object to be named 'app'
app = fastapi_app

# Vercel Serverless doesn't run FastAPI lifespan events.
# Initialize DB explicitly on cold start.
from app.core.database import init_db
import logging
logger = logging.getLogger("packsmart")

try:
    init_db()
    logger.info("Database initialized synchronously for Vercel")
except Exception as e:
    logger.error(f"Failed to init db: {e}")
