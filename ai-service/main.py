# main.py
#
# Run with: uvicorn main:app --host 0.0.0.0 --port 8001
#
# IMPORTANT — deployment note: this service must NOT be exposed to the
# public internet. It should sit on an internal network / private port
# that only the Node backend can reach (e.g. same Docker network, or
# firewalled to the backend's IP). The X-Internal-Api-Key header check
# is defense in depth, not a substitute for network isolation.

from fastapi import FastAPI

from app.routes.analyze import router as analyze_router

app = FastAPI(title="AI Proctoring Analysis Service", version="1.0.0")

app.include_router(analyze_router)


@app.get("/health")
async def health():
    return {"status": "healthy"}
