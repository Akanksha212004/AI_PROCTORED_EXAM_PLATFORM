# app/services/object_detection.py
#
# Mobile-device-in-frame detection, via MediaPipe Tasks' ObjectDetector
# (EfficientDet-Lite0, trained on COCO). COCO's "cell phone" class
# covers a phone held up to the camera or resting on the desk in view
# — a common proctoring signal alongside face-count and gaze.
#
# MODEL FILE — NOT BUNDLED IN THIS REPO:
# The .tflite model is a ~4-6MB binary blob fetched from Google's
# model repo, not something to commit to source control. Download it
# once before starting the service:
#
#   mkdir -p app/models
#   curl -L -o app/models/efficientdet_lite0.tflite \
#     https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite
#
# Path is configurable via OBJECT_DETECTION_MODEL_PATH in .env (see
# config.py). If the file isn't present, detection degrades to
# "not detected" rather than crashing /analyze — a missing model
# shouldn't take down face-count/gaze checks that don't need it.

from dataclasses import dataclass
import logging
import os

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

from app.core.config import settings

logger = logging.getLogger(__name__)

# COCO label(s) that count as "a mobile device is visible". Just
# "cell phone" for now; COCO doesn't distinguish phone vs. small
# tablet, so this is deliberately the one class that reliably maps to
# "someone is holding/consulting a handheld device".
_MOBILE_DEVICE_LABELS = {"cell phone"}

_detector: mp_vision.ObjectDetector | None = None
_detector_init_attempted = False


def _get_detector() -> mp_vision.ObjectDetector | None:
    """Lazily loads the detector. Returns None (and stays None) if the
    model file isn't available, so callers can degrade gracefully
    instead of every request raising."""
    global _detector, _detector_init_attempted
    if _detector_init_attempted:
        return _detector
    _detector_init_attempted = True
    try:
        # Plain os.path.abspath — NOT _resolve_model_path. That helper's
        # leading-slash mangling ("/C:/Users/...") exists only to satisfy
        # MediaPipe's own C++ resource loader when passing model_asset_path.
        # We don't do that anymore (see below); we open the file ourselves
        # with regular Python open(), which wants a normal Windows path
        # ("C:\Users\..." or "C:/Users/...") and errors on a mangled one
        # (OSError: Invalid argument) — that was the bug in the previous fix.
        resolved_path = os.path.abspath(settings.object_detection_model_path)
        # model_asset_path is intentionally NOT used here. MediaPipe
        # Tasks' internal C++ resource loader mishandles Windows absolute
        # paths even after the "/C:/..." leading-slash workaround (it still
        # treats them as relative and prepends its own site-packages dir,
        # producing an unopenable mangled path). Reading the file ourselves
        # and passing raw bytes via model_asset_buffer sidesteps that path
        # resolution entirely and works identically on Windows/Linux/Mac.
        with open(resolved_path, "rb") as f:
            model_bytes = f.read()
        base_options = mp_tasks.BaseOptions(model_asset_buffer=model_bytes)
        options = mp_vision.ObjectDetectorOptions(
            base_options=base_options,
            max_results=5,
            score_threshold=settings.mobile_device_min_confidence,
            running_mode=mp_vision.RunningMode.IMAGE,
            category_allowlist=list(_MOBILE_DEVICE_LABELS),
        )
        _detector = mp_vision.ObjectDetector.create_from_options(options)
    except Exception:
        # Missing/corrupt model file, unsupported delegate, etc. Every
        # request will report "no mobile device detected" until this
        # is fixed and the service is restarted (this init only runs
        # once, on first request) — logged loudly so it isn't mistaken
        # for "no phone was ever in frame".
        logger.warning(
            "Mobile-device detector failed to load from '%s' (resolved: '%s') — "
            "mobile phone detection will report 'not detected' for every "
            "request until this is fixed. Did you download the model file? "
            "See the comment at the top of object_detection.py for the command.",
            settings.object_detection_model_path,
            resolved_path,
            exc_info=True,
        )
        _detector = None
    return _detector


@dataclass
class MobileDeviceResult:
    detected: bool
    confidence: float | None = None
    bounding_box: dict | None = None  # {"x", "y", "width", "height"} in pixels


def detect_mobile_device(image_bytes: bytes) -> MobileDeviceResult:
    detector = _get_detector()
    if detector is None:
        return MobileDeviceResult(detected=False)

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image")

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = detector.detect(mp_image)

    best_score = 0.0
    best_box = None
    for detection in result.detections:
        for category in detection.categories:
            if category.category_name in _MOBILE_DEVICE_LABELS and category.score > best_score:
                best_score = category.score
                bbox = detection.bounding_box
                best_box = {
                    "x": bbox.origin_x,
                    "y": bbox.origin_y,
                    "width": bbox.width,
                    "height": bbox.height,
                }

    if best_box is None:
        return MobileDeviceResult(detected=False)

    return MobileDeviceResult(detected=True, confidence=round(best_score, 2), bounding_box=best_box)