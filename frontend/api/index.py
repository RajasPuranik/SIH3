import sys
import os
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Add api folder to python path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app as fastapi_app
    app = fastapi_app
    
    from app.core.database import init_db
    import logging
    logger = logging.getLogger("packlabs")

    try:
        init_db()
        logger.info("Database initialized synchronously for Vercel")
    except Exception as e:
        logger.error(f"Failed to init db: {e}")

except Exception as e:
    err_msg = str(e)
    err_trace = traceback.format_exc()
    
    app = FastAPI()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"])
    async def catch_all(request: Request, path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal Server Error during cold boot initialization",
                "error": err_msg,
                "traceback": err_trace
            }
        )
