# app/services/face_analysis.py
#
# Face count: MediaPipe Face Detection (fast, robust, this is what
# most production face-presence systems use under the hood).
#
# Gaze direction: same LEFT/RIGHT/CENTER/AWAY heuristic as the earlier
# client-side version (eye-landmark center vs. face-box center offset)
# — moved server-side, but still documented as a heuristic, not true
# 3D gaze estimation. MediaPipe Face Mesh (468 landmarks) supplies the
# eye landmark points.

from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np

from app.core.config import settings

mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh

# Loaded once at import time — MediaPipe graphs are expensive to
# initialize, so we reuse these across requests rather than
# recreating them per-frame.
_face_detector = mp_face_detection.FaceDetection(
    model_selection=1,  # full-range model — better for varied webcam distances
    min_detection_confidence=settings.face_detection_min_confidence,
)
_face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=False,
    min_detection_confidence=settings.face_detection_min_confidence,
)

# Left eye: outer corner 33, inner corner 133. Right eye: outer 263, inner 362.
_EYE_LANDMARK_INDICES = [33, 133, 263, 362]


@dataclass
class AnalysisResult:
    face_count: int
    gaze_direction: str | None  # "CENTER" | "LEFT" | "RIGHT" | "AWAY" | None (only set when face_count == 1)
    gaze_confidence: float | None


def analyze_frame(image_bytes: bytes) -> AnalysisResult:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image")

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w = frame.shape[:2]

    detection_result = _face_detector.process(rgb)
    detections = detection_result.detections or []
    face_count = len(detections)

    if face_count != 1:
        return AnalysisResult(face_count=face_count, gaze_direction=None, gaze_confidence=None)

    # Exactly one face — compute the gaze heuristic.
    box = detections[0].location_data.relative_bounding_box
    box_center_x = box.xmin + box.width / 2

    mesh_result = _face_mesh.process(rgb)
    if not mesh_result.multi_face_landmarks:
        # Detector saw a face but mesh couldn't lock landmarks (motion
        # blur, extreme angle) — report presence without a gaze reading
        # rather than guessing.
        return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

    landmarks = mesh_result.multi_face_landmarks[0].landmark
    eye_xs = [landmarks[i].x for i in _EYE_LANDMARK_INDICES]
    eye_center_x = sum(eye_xs) / len(eye_xs)

    offset = (eye_center_x - box_center_x) / max(box.width, 0.01)

    if abs(offset) > settings.gaze_offset_threshold:
        direction = "RIGHT" if offset > 0 else "LEFT"
        confidence = min(1.0, abs(offset) * 2)
    else:
        direction = "CENTER"
        confidence = max(0.0, 1 - abs(offset) * 2)

    return AnalysisResult(face_count=1, gaze_direction=direction, gaze_confidence=round(confidence, 2))
