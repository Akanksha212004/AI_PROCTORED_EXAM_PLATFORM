# import os
# from dotenv import load_dotenv
# from pydantic_settings import BaseSettings

# load_dotenv()

# class Settings(BaseSettings):
#     internal_api_key: str = os.environ.get("AI_SERVICE_INTERNAL_KEY", "")
#     port: int = int(os.environ.get("PORT", "8001"))

#     # Detection thresholds
#     face_detection_min_confidence: float = 0.5

#     # Gaze offset thresholds, as a fraction of face-box width.
#     # These are MEDIUM-sensitivity defaults, used when the caller
#     # (Node backend) doesn't pass per-exam overrides.
#     #   |offset| <= near_threshold           -> CENTER
#     #   near_threshold < |offset| <= far     -> LEFT / RIGHT
#     #   |offset| > far_threshold             -> AWAY
#     gaze_near_threshold: float = 0.08
#     gaze_far_threshold: float = 0.16


# settings = Settings()






import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    internal_api_key: str = os.environ.get("AI_SERVICE_INTERNAL_KEY", "")
    port: int = int(os.environ.get("PORT", "8001"))

    # Detection thresholds
    face_detection_min_confidence: float = 0.5

    # Gaze offset thresholds, as a fraction of EYE width (per-eye
    # iris-position heuristic — see face_analysis.py). NOT face-box
    # width anymore; these numbers changed scale when the gaze metric
    # switched from face-box-relative to eye-width-relative.
    # These are MEDIUM-sensitivity defaults, used when the caller
    # (Node backend) doesn't pass per-exam overrides.
    #   |offset| <= near_threshold           -> CENTER
    #   near_threshold < |offset| <= far     -> LEFT / RIGHT
    #   |offset| > far_threshold             -> AWAY
    # STARTING-POINT values, not yet calibrated against real test data.
    gaze_near_threshold: float = 0.15
    gaze_far_threshold: float = 0.30


settings = Settings()