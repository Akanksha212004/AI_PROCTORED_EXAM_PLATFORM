# app/services/face_analysis.py
#
# Face count: MediaPipe Face Detection.
#
# Gaze direction: two-tier offset heuristic (eye-landmark center vs.
# face-box center, as a fraction of face-box width) — not true 3D
# gaze/head-pose estimation, but a real, working signal:
#   small offset  -> CENTER
#   medium offset -> LEFT / RIGHT (informational — a real but mild turn)
#   large offset  -> AWAY (flaggable — very likely not looking at the screen)
#
# Thresholds are passed in per-request by the caller (near_threshold /
# far_threshold), since "how sensitive" is exam-config business logic
# that belongs in the Node backend, not here. This service stays a
# stateless CV utility with sane defaults from settings.

from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np

from app.core.config import settings

mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh

_face_detector = mp_face_detection.FaceDetection(
    model_selection=1,
    min_detection_confidence=settings.face_detection_min_confidence,
)
_face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=False,
    min_detection_confidence=settings.face_detection_min_confidence,
)

_EYE_LANDMARK_INDICES = [33, 133, 263, 362]


@dataclass
class AnalysisResult:
    face_count: int
    gaze_direction: str | None  # "CENTER" | "LEFT" | "RIGHT" | "AWAY" | None (only set when face_count == 1)
    gaze_confidence: float | None


def analyze_frame(
    image_bytes: bytes,
    near_threshold: float | None = None,
    far_threshold: float | None = None,
) -> AnalysisResult:
    near = near_threshold if near_threshold is not None else settings.gaze_near_threshold
    far = far_threshold if far_threshold is not None else settings.gaze_far_threshold
    if near > far:
        raise ValueError("near_threshold must not exceed far_threshold")

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image")

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    detection_result = _face_detector.process(rgb)
    detections = detection_result.detections or []
    face_count = len(detections)

    if face_count != 1:
        return AnalysisResult(face_count=face_count, gaze_direction=None, gaze_confidence=None)

    box = detections[0].location_data.relative_bounding_box
    box_center_x = box.xmin + box.width / 2

    mesh_result = _face_mesh.process(rgb)
    if not mesh_result.multi_face_landmarks:
        return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

    landmarks = mesh_result.multi_face_landmarks[0].landmark
    eye_xs = [landmarks[i].x for i in _EYE_LANDMARK_INDICES]
    eye_center_x = sum(eye_xs) / len(eye_xs)

    offset = (eye_center_x - box_center_x) / max(box.width, 0.01)
    offset = -offset
    abs_offset = abs(offset)

    if abs_offset > far:
        direction = "AWAY"
        confidence = min(1.0, abs_offset / far)
    elif abs_offset > near:
        direction = "RIGHT" if offset > 0 else "LEFT"
        # Scale confidence across the LEFT/RIGHT band (near..far) rather
        # than the old *2 heuristic, so it stays meaningful now that the
        # band has two edges instead of one.
        span = max(far - near, 0.001)
        confidence = min(1.0, (abs_offset - near) / span)
    else:
        direction = "CENTER"
        confidence = max(0.0, 1 - abs_offset / max(near, 0.001))

    return AnalysisResult(face_count=1, gaze_direction=direction, gaze_confidence=round(confidence, 2))