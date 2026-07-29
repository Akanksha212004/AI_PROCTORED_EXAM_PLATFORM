import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    internal_api_key: str = os.environ.get("AI_SERVICE_INTERNAL_KEY", "")
    port: int = int(os.environ.get("PORT", "8001"))

    # Detection thresholds
    face_detection_min_confidence: float = 0.5

    # Gaze offset thresholds, in DEGREES of head yaw (see
    # face_analysis.py — real solvePnP head-pose estimation, not the
    # old eye-width-ratio heuristic, so these are a physically
    # meaningful unit now).
    # These are MEDIUM-sensitivity defaults, used when the caller
    # (Node backend) doesn't pass per-exam overrides.
    #   |yaw| <= near_threshold           -> CENTER
    #   near_threshold < |yaw| <= far     -> LEFT / RIGHT
    #   |yaw| > far_threshold             -> AWAY
    # (Pitch/looking-down uses a separate fixed allowance — see
    # _DOWN_PITCH_ALLOWANCE_DEGREES in face_analysis.py.)
    gaze_near_threshold: float = 16.0
    gaze_far_threshold: float = 32.0
    # Downward pitch allowance, in degrees — reading on-screen exam
    # text naturally involves some downward tilt, and this varies a
    # lot by webcam placement (a low-mounted laptop cam reads a bigger
    # "natural" pitch than an external cam at eye level). Raise this
    # in .env (GAZE_DOWN_PITCH_ALLOWANCE_DEGREES=45) if AWAY is firing
    # on normal screen-reading posture for your setup.
    gaze_down_pitch_allowance_degrees: float = 35.0

    # --- Mobile device (phone) detection ---
    # Path to the EfficientDet-Lite0 .tflite model — see
    # app/services/object_detection.py for the one-time download step.
    object_detection_model_path: str = os.environ.get(
        "OBJECT_DETECTION_MODEL_PATH", "app/models/efficientdet_lite0.tflite"
    )
    # Minimum COCO "cell phone" class score to count as detected.
    mobile_device_min_confidence: float = 0.5

    # --- Audio (Voice Activity Detection) ---
    # webrtcvad aggressiveness: 0 (least aggressive filtering of
    # non-speech, more false positives from noise) to 3 (most
    # aggressive, may miss quiet/soft speech). 2 is a reasonable
    # middle ground for a proctoring use case.
    audio_vad_aggressiveness: int = 2
    # Fraction of 30ms frames in a clip that must be classified as
    # speech for the clip to count as "voice activity detected".
    # A single stray voiced frame (cough, chair creak) shouldn't flag;
    # sustained voiced frames across the clip should.
    audio_voiced_frame_ratio_threshold: float = 0.5


settings = Settings()

print(
    f"[config] Loaded from {os.path.abspath('.env')} "
    f"(exists={os.path.exists('.env')}): "
    f"GAZE_DOWN_PITCH_ALLOWANCE_DEGREES={settings.gaze_down_pitch_allowance_degrees}, "
    f"MOBILE_DEVICE_MIN_CONFIDENCE={settings.mobile_device_min_confidence}"
)