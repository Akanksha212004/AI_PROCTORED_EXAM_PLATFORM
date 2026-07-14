# app/core/config.py
#
# This service is INTERNAL — it must never be directly reachable from
# the browser. Only the Node backend calls it, authenticated with a
# shared secret. Deploy it on a private network / internal port, and
# additionally keep this header check as defense in depth.

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    internal_api_key: str = os.environ.get("AI_SERVICE_INTERNAL_KEY", "")
    port: int = int(os.environ.get("PORT", "8001"))

    # Detection thresholds
    face_detection_min_confidence: float = 0.5
    gaze_offset_threshold: float = 0.18  # same heuristic threshold as before, now computed server-side


settings = Settings()
