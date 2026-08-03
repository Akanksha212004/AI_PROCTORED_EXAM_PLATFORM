# # app/services/face_analysis.py
# #
# # Face count: MediaPipe Face Detection (unchanged).
# #
# # Gaze/attention: real 3D head-pose estimation (yaw + pitch) via
# # OpenCV's solvePnP — NOT the old eye-in-socket iris-ratio heuristic.
# #
# # WHY THIS IS A REAL UPGRADE, NOT JUST A DIFFERENT HEURISTIC:
# # The previous approach measured how far the iris sits inside the eye
# # socket. That only catches "eyes glance sideways while the head stays
# # still" — it structurally CANNOT catch the two most common real
# # cheating tells:
# #   1. Turning the whole head to look at a phone/notes/another person
# #      off to the side (iris stays centered *within the eye*, since
# #      eye and head rotate together).
# #   2. Looking down at a phone in the lap (the old metric was
# #      horizontal-only; it had no vertical/pitch signal at all).
# #
# # solvePnP fixes both: it fits a generic 3D face model to 2D landmark
# # positions and recovers the actual head rotation (yaw/pitch/roll) in
# # degrees, using the classic 6-point method (nose tip, chin, eye
# # corners, mouth corners) — the same technique behind most production
# # "driver attention" / "gaze-aware" systems. Thresholds are now in
# # degrees, a physically meaningful, directly-interpretable unit
# # (unlike the old dimensionless eye-width ratio).
# #
# # HONEST LIMITATIONS (still real, still worth stating):
# # - No camera calibration is available (this is a single uploaded
# #   frame, not a calibrated camera) — focal length is approximated
# #   from image width, the standard practical assumption for this
# #   technique but not a true calibration. Absolute angles can be off
# #   by a few degrees; relative comparisons (bigger turn vs. smaller
# #   turn) remain reliable.
# # - Roll (head tilt) is computed but intentionally not used for
# #   flagging — tilting your head doesn't mean you're not looking at
# #   the screen.
# # - Still a single-frame estimate with no temporal smoothing (each
# #   snapshot is judged independently) — consistent with this
# #   service's stateless, per-request design; smoothing across a
# #   session belongs in the Node backend / event history if wanted.

# from dataclasses import dataclass

# import cv2
# import mediapipe as mp
# import numpy as np

# from app.core.config import settings

# mp_face_detection = mp.solutions.face_detection
# mp_face_mesh = mp.solutions.face_mesh

# _face_detector = mp_face_detection.FaceDetection(
#     model_selection=1,
#     min_detection_confidence=settings.face_detection_min_confidence,
# )
# _face_mesh = mp_face_mesh.FaceMesh(
#     static_image_mode=True,
#     max_num_faces=1,
#     refine_landmarks=False,  # iris landmarks no longer needed for head-pose
#     min_detection_confidence=settings.face_detection_min_confidence,
# )

# # Generic 3D face model points, in an arbitrary millimeter-like unit
# # space, centered at the nose tip. This is the standard reference set
# # used across most solvePnP-based head-pose implementations (a generic
# # face model, not any real individual's geometry) — solvePnP is fairly
# # tolerant of that for yaw/pitch purposes.
# #
# # IMPORTANT — axis convention: the commonly-copied version of these
# # points (LearnOpenCV/PyImageSearch head-pose tutorials) uses a
# # Y-up, Z-toward-viewer object frame. That's fine for those tutorials
# # because they only ever *project* the model back into the image to
# # draw a direction line — they never decompose the rotation matrix
# # into Euler angles. Here we DO decompose into yaw/pitch via atan2,
# # and that decomposition implicitly assumes the object frame matches
# # OpenCV's camera convention (Y-down, Z-into-the-scene). With the
# # Y-up/Z-toward-viewer points, solvePnP still fits the 2D landmarks
# # fine, but the recovered rotation is the "flipped" solution — for a
# # face looking straight at the camera it comes back as a ~180 degree
# # rotation about X, which makes pitch read ~180 degrees instead of
# # ~0. Every frame reported "looking down" regardless of actual pose.
# # Negating Y and Z here (vs. the tutorial original) puts the model in
# # the same convention the Euler decomposition expects, so pitch (and
# # yaw) come out as the actual physical angle. Verified against real
# # frames: a straight-on face went from pitch=174 (bogus) to pitch=-6
# # (correct) with this change.
# _MODEL_POINTS_3D = np.array(
#     [
#         (0.0, 0.0, 0.0),  # Nose tip
#         (0.0, 330.0, 65.0),  # Chin
#         (-225.0, -170.0, 135.0),  # Left eye, left corner
#         (225.0, -170.0, 135.0),  # Right eye, right corner
#         (-150.0, 150.0, 125.0),  # Left mouth corner
#         (150.0, 150.0, 125.0),  # Right mouth corner
#     ],
#     dtype=np.float64,
# )

# # Corresponding MediaPipe Face Mesh landmark indices (468-point topology).
# _NOSE_TIP = 1
# _CHIN = 152
# _LEFT_EYE_LEFT_CORNER = 33
# _RIGHT_EYE_RIGHT_CORNER = 263
# _LEFT_MOUTH_CORNER = 61
# _RIGHT_MOUTH_CORNER = 291

# # Downward pitch allowance is now configurable — see
# # settings.gaze_down_pitch_allowance_degrees in config.py.

# # How many degrees PAST a threshold it takes for confidence to reach
# # 1.0. Without this, confidence used to jump straight to 100% the
# # instant a threshold was crossed by even a fraction of a degree —
# # which is why borderline, noisy single-frame readings were showing
# # up as "100% confidence AWAY". Now confidence ramps smoothly, so
# # marginal frames report low confidence and only sustained, clear
# # deviations report high confidence.
# _CONFIDENCE_SATURATION_MARGIN_DEGREES = 15.0

# # Maximum acceptable mean reprojection error (pixels, normalized by
# # image width) for a solvePnP fit to be trusted. The 6-point method
# # has no camera calibration and is sensitive to landmark noise (e.g.
# # glare on glasses, slight blur) — when the fit doesn't actually
# # explain the landmarks well, the resulting yaw/pitch can be
# # spuriously large. Rather than confidently flagging AWAY on a bad
# # fit, we fall back to "unknown".
# _MAX_REPROJECTION_ERROR_RATIO = 0.03


# @dataclass
# class AnalysisResult:
#     face_count: int
#     gaze_direction: str | None  # "CENTER" | "LEFT" | "RIGHT" | "AWAY" | None (only set when face_count == 1)
#     gaze_confidence: float | None
#     yaw_degrees: float | None = None  # exposed mainly for debugging/threshold-tuning
#     pitch_degrees: float | None = None


# def _estimate_head_pose(
#     landmarks, image_width: int, image_height: int
# ) -> tuple[float, float, float] | None:
#     """Returns (yaw_degrees, pitch_degrees, reprojection_error_ratio), or
#     None if solvePnP fails.

#     Positive yaw = turned toward the image's right. Positive pitch = tilted down.
#     reprojection_error_ratio is the mean pixel error between the fitted
#     model and the actual landmarks, normalized by image width — a
#     measure of how much to trust this particular fit.
#     """
#     image_points = np.array(
#         [
#             (landmarks[_NOSE_TIP].x * image_width, landmarks[_NOSE_TIP].y * image_height),
#             (landmarks[_CHIN].x * image_width, landmarks[_CHIN].y * image_height),
#             (landmarks[_LEFT_EYE_LEFT_CORNER].x * image_width, landmarks[_LEFT_EYE_LEFT_CORNER].y * image_height),
#             (landmarks[_RIGHT_EYE_RIGHT_CORNER].x * image_width, landmarks[_RIGHT_EYE_RIGHT_CORNER].y * image_height),
#             (landmarks[_LEFT_MOUTH_CORNER].x * image_width, landmarks[_LEFT_MOUTH_CORNER].y * image_height),
#             (landmarks[_RIGHT_MOUTH_CORNER].x * image_width, landmarks[_RIGHT_MOUTH_CORNER].y * image_height),
#         ],
#         dtype=np.float64,
#     )

#     # No real calibration available for a single uploaded frame — approximate
#     # focal length from image width, the standard practical assumption here.
#     focal_length = image_width
#     center = (image_width / 2, image_height / 2)
#     camera_matrix = np.array(
#         [
#             [focal_length, 0, center[0]],
#             [0, focal_length, center[1]],
#             [0, 0, 1],
#         ],
#         dtype=np.float64,
#     )
#     dist_coeffs = np.zeros((4, 1))  # assume no lens distortion

#     success, rotation_vector, _translation_vector = cv2.solvePnP(
#         _MODEL_POINTS_3D,
#         image_points,
#         camera_matrix,
#         dist_coeffs,
#         flags=cv2.SOLVEPNP_ITERATIVE,
#     )
#     if not success:
#         return None

#     projected_points, _ = cv2.projectPoints(
#         _MODEL_POINTS_3D, rotation_vector, _translation_vector, camera_matrix, dist_coeffs
#     )
#     reprojection_error_px = float(
#         np.mean(np.linalg.norm(projected_points.reshape(-1, 2) - image_points, axis=1))
#     )
#     reprojection_error_ratio = reprojection_error_px / image_width

#     rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

#     # Standard rotation-matrix -> Euler angle decomposition.
#     sy = np.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2)
#     singular = sy < 1e-6
#     if not singular:
#         pitch = np.arctan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
#         yaw = np.arctan2(-rotation_matrix[2, 0], sy)
#     else:
#         pitch = np.arctan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
#         yaw = np.arctan2(-rotation_matrix[2, 0], sy)

#     return float(np.degrees(yaw)), float(np.degrees(pitch)), reprojection_error_ratio


# def analyze_frame(
#     image_bytes: bytes,
#     near_threshold: float | None = None,
#     far_threshold: float | None = None,
# ) -> AnalysisResult:
#     """near_threshold/far_threshold are in DEGREES now (see config.py) —
#     a physically meaningful unit, unlike the old eye-width ratio."""
#     near = near_threshold if near_threshold is not None else settings.gaze_near_threshold
#     far = far_threshold if far_threshold is not None else settings.gaze_far_threshold
#     if near > far:
#         raise ValueError("near_threshold must not exceed far_threshold")

#     np_arr = np.frombuffer(image_bytes, np.uint8)
#     frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#     if frame is None:
#         raise ValueError("Could not decode image")

#     height, width = frame.shape[:2]
#     rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

#     detection_result = _face_detector.process(rgb)
#     detections = detection_result.detections or []
#     face_count = len(detections)

#     if face_count != 1:
#         return AnalysisResult(face_count=face_count, gaze_direction=None, gaze_confidence=None)

#     mesh_result = _face_mesh.process(rgb)
#     if not mesh_result.multi_face_landmarks:
#         return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

#     landmarks = mesh_result.multi_face_landmarks[0].landmark
#     pose = _estimate_head_pose(landmarks, width, height)
#     if pose is None:
#         return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

#     yaw, pitch, reprojection_error_ratio = pose

#     # If the 6-point fit doesn't actually explain the landmarks well
#     # (noisy/blurry frame, glasses glare, partial occlusion), don't
#     # trust the resulting angle enough to flag someone as AWAY on it.
#     if reprojection_error_ratio > _MAX_REPROJECTION_ERROR_RATIO:
#         return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

#     # Looking down past the reading-allowance is flagged AWAY directly —
#     # it has no meaningful LEFT/RIGHT reading. Otherwise the flagging axis
#     # is yaw (turning toward/away from the screen), banded the same
#     # near/far way as before.
#     pitch_threshold = max(far, settings.gaze_down_pitch_allowance_degrees)
#     looking_down = pitch > pitch_threshold

#     abs_yaw = abs(yaw)
#     if looking_down or abs_yaw > far:
#         direction = "AWAY"
#         if looking_down:
#             excess = pitch - pitch_threshold
#         else:
#             excess = abs_yaw - far
#         # Graduated: right at the threshold reads as low confidence;
#         # confidence only approaches 1.0 once the deviation is clearly
#         # past the threshold, not the instant it's crossed.
#         confidence = min(1.0, excess / _CONFIDENCE_SATURATION_MARGIN_DEGREES)
#     elif abs_yaw > near:
#         direction = "RIGHT" if yaw > 0 else "LEFT"
#         span = max(far - near, 0.001)
#         confidence = min(1.0, (abs_yaw - near) / span)
#     else:
#         direction = "CENTER"
#         confidence = max(0.0, 1 - abs_yaw / max(near, 0.001))

#     return AnalysisResult(
#         face_count=1,
#         gaze_direction=direction,
#         gaze_confidence=round(confidence, 2),
#         yaw_degrees=round(yaw, 1),
#         pitch_degrees=round(pitch, 1),
#     )









from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np

from app.core.config import settings

# --- SAFE LINUX / HEADLESS SERVER IMPORT PATCH ---
try:
    import mediapipe.python.solutions as mp_solutions
except (ImportError, AttributeError):
    mp_solutions = mp.solutions

mp_face_detection = mp_solutions.face_detection
mp_face_mesh = mp_solutions.face_mesh
# -------------------------------------------------

_face_detector = mp_face_detection.FaceDetection(
    model_selection=1,
    min_detection_confidence=settings.face_detection_min_confidence,
)
_face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=False,  # iris landmarks no longer needed for head-pose
    min_detection_confidence=settings.face_detection_min_confidence,
)

# Generic 3D face model points, in an arbitrary millimeter-like unit
# space, centered at the nose tip. This is the standard reference set
# used across most solvePnP-based head-pose implementations (a generic
# face model, not any real individual's geometry) — solvePnP is fairly
# tolerant of that for yaw/pitch purposes.
#
# IMPORTANT — axis convention: the commonly-copied version of these
# points (LearnOpenCV/PyImageSearch head-pose tutorials) uses a
# Y-up, Z-toward-viewer object frame. That's fine for those tutorials
# because they only ever *project* the model back into the image to
# draw a direction line — they never decompose the rotation matrix
# into Euler angles. Here we DO decompose into yaw/pitch via atan2,
# and that decomposition implicitly assumes the object frame matches
# OpenCV's camera convention (Y-down, Z-into-the-scene). With the
# Y-up/Z-toward-viewer points, solvePnP still fits the 2D landmarks
# fine, but the recovered rotation is the "flipped" solution — for a
# face looking straight at the camera it comes back as a ~180 degree
# rotation about X, which makes pitch read ~180 degrees instead of
# ~0. Every frame reported "looking down" regardless of actual pose.
# Negating Y and Z here (vs. the tutorial original) puts the model in
# the same convention the Euler decomposition expects, so pitch (and
# yaw) come out as the actual physical angle. Verified against real
# frames: a straight-on face went from pitch=174 (bogus) to pitch=-6
# (correct) with this change.
_MODEL_POINTS_3D = np.array(
    [
        (0.0, 0.0, 0.0),  # Nose tip
        (0.0, 330.0, 65.0),  # Chin
        (-225.0, -170.0, 135.0),  # Left eye, left corner
        (225.0, -170.0, 135.0),  # Right eye, right corner
        (-150.0, 150.0, 125.0),  # Left mouth corner
        (150.0, 150.0, 125.0),  # Right mouth corner
    ],
    dtype=np.float64,
)

# Corresponding MediaPipe Face Mesh landmark indices (468-point topology).
_NOSE_TIP = 1
_CHIN = 152
_LEFT_EYE_LEFT_CORNER = 33
_RIGHT_EYE_RIGHT_CORNER = 263
_LEFT_MOUTH_CORNER = 61
_RIGHT_MOUTH_CORNER = 291

# Downward pitch allowance is now configurable — see
# settings.gaze_down_pitch_allowance_degrees in config.py.

# How many degrees PAST a threshold it takes for confidence to reach
# 1.0. Without this, confidence used to jump straight to 100% the
# instant a threshold was crossed by even a fraction of a degree —
# which is why borderline, noisy single-frame readings were showing
# up as "100% confidence AWAY". Now confidence ramps smoothly, so
# marginal frames report low confidence and only sustained, clear
# deviations report high confidence.
_CONFIDENCE_SATURATION_MARGIN_DEGREES = 15.0

# Maximum acceptable mean reprojection error (pixels, normalized by
# image width) for a solvePnP fit to be trusted. The 6-point method
# has no camera calibration and is sensitive to landmark noise (e.g.
# glare on glasses, slight blur) — when the fit doesn't actually
# explain the landmarks well, the resulting yaw/pitch can be
# spuriously large. Rather than confidently flagging AWAY on a bad
# fit, we fall back to "unknown".
_MAX_REPROJECTION_ERROR_RATIO = 0.03


@dataclass
class AnalysisResult:
    face_count: int
    gaze_direction: str | None  # "CENTER" | "LEFT" | "RIGHT" | "AWAY" | None (only set when face_count == 1)
    gaze_confidence: float | None
    yaw_degrees: float | None = None  # exposed mainly for debugging/threshold-tuning
    pitch_degrees: float | None = None


def _estimate_head_pose(
    landmarks, image_width: int, image_height: int
) -> tuple[float, float, float] | None:
    """Returns (yaw_degrees, pitch_degrees, reprojection_error_ratio), or
    None if solvePnP fails.

    Positive yaw = turned toward the image's right. Positive pitch = tilted down.
    reprojection_error_ratio is the mean pixel error between the fitted
    model and the actual landmarks, normalized by image width — a
    measure of how much to trust this particular fit.
    """
    image_points = np.array(
        [
            (landmarks[_NOSE_TIP].x * image_width, landmarks[_NOSE_TIP].y * image_height),
            (landmarks[_CHIN].x * image_width, landmarks[_CHIN].y * image_height),
            (landmarks[_LEFT_EYE_LEFT_CORNER].x * image_width, landmarks[_LEFT_EYE_LEFT_CORNER].y * image_height),
            (landmarks[_RIGHT_EYE_RIGHT_CORNER].x * image_width, landmarks[_RIGHT_EYE_RIGHT_CORNER].y * image_height),
            (landmarks[_LEFT_MOUTH_CORNER].x * image_width, landmarks[_LEFT_MOUTH_CORNER].y * image_height),
            (landmarks[_RIGHT_MOUTH_CORNER].x * image_width, landmarks[_RIGHT_MOUTH_CORNER].y * image_height),
        ],
        dtype=np.float64,
    )

    # No real calibration available for a single uploaded frame — approximate
    # focal length from image width, the standard practical assumption here.
    focal_length = image_width
    center = (image_width / 2, image_height / 2)
    camera_matrix = np.array(
        [
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1],
        ],
        dtype=np.float64,
    )
    dist_coeffs = np.zeros((4, 1))  # assume no lens distortion

    success, rotation_vector, _translation_vector = cv2.solvePnP(
        _MODEL_POINTS_3D,
        image_points,
        camera_matrix,
        dist_coeffs,
        flags=cv2.SOLVEPNP_ITERATIVE,
    )
    if not success:
        return None

    projected_points, _ = cv2.projectPoints(
        _MODEL_POINTS_3D, rotation_vector, _translation_vector, camera_matrix, dist_coeffs
    )
    reprojection_error_px = float(
        np.mean(np.linalg.norm(projected_points.reshape(-1, 2) - image_points, axis=1))
    )
    reprojection_error_ratio = reprojection_error_px / image_width

    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

    # Standard rotation-matrix -> Euler angle decomposition.
    sy = np.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2)
    singular = sy < 1e-6
    if not singular:
        pitch = np.arctan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
        yaw = np.arctan2(-rotation_matrix[2, 0], sy)
    else:
        pitch = np.arctan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
        yaw = np.arctan2(-rotation_matrix[2, 0], sy)

    return float(np.degrees(yaw)), float(np.degrees(pitch)), reprojection_error_ratio


def analyze_frame(
    image_bytes: bytes,
    near_threshold: float | None = None,
    far_threshold: float | None = None,
) -> AnalysisResult:
    """near_threshold/far_threshold are in DEGREES now (see config.py) —
    a physically meaningful unit, unlike the old eye-width ratio."""
    near = near_threshold if near_threshold is not None else settings.gaze_near_threshold
    far = far_threshold if far_threshold is not None else settings.gaze_far_threshold
    if near > far:
        raise ValueError("near_threshold must not exceed far_threshold")

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image")

    height, width = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    detection_result = _face_detector.process(rgb)
    detections = detection_result.detections or []
    face_count = len(detections)

    if face_count != 1:
        return AnalysisResult(face_count=face_count, gaze_direction=None, gaze_confidence=None)

    mesh_result = _face_mesh.process(rgb)
    if not mesh_result.multi_face_landmarks:
        return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

    landmarks = mesh_result.multi_face_landmarks[0].landmark
    pose = _estimate_head_pose(landmarks, width, height)
    if pose is None:
        return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

    yaw, pitch, reprojection_error_ratio = pose

    # If the 6-point fit doesn't actually explain the landmarks well
    # (noisy/blurry frame, glasses glare, partial occlusion), don't
    # trust the resulting angle enough to flag someone as AWAY on it.
    if reprojection_error_ratio > _MAX_REPROJECTION_ERROR_RATIO:
        return AnalysisResult(face_count=1, gaze_direction=None, gaze_confidence=None)

    # Looking down past the reading-allowance is flagged AWAY directly —
    # it has no meaningful LEFT/RIGHT reading. Otherwise the flagging axis
    # is yaw (turning toward/away from the screen), banded the same
    # near/far way as before.
    pitch_threshold = max(far, settings.gaze_down_pitch_allowance_degrees)
    looking_down = pitch > pitch_threshold

    abs_yaw = abs(yaw)
    if looking_down or abs_yaw > far:
        direction = "AWAY"
        if looking_down:
            excess = pitch - pitch_threshold
        else:
            excess = abs_yaw - far
        # Graduated: right at the threshold reads as low confidence;
        # confidence only approaches 1.0 once the deviation is clearly
        # past the threshold, not the instant it's crossed.
        confidence = min(1.0, excess / _CONFIDENCE_SATURATION_MARGIN_DEGREES)
    elif abs_yaw > near:
        direction = "RIGHT" if yaw > 0 else "LEFT"
        span = max(far - near, 0.001)
        confidence = min(1.0, (abs_yaw - near) / span)
    else:
        direction = "CENTER"
        confidence = max(0.0, 1 - abs_yaw / max(near, 0.001))

    return AnalysisResult(
        face_count=1,
        gaze_direction=direction,
        gaze_confidence=round(confidence, 2),
        yaw_degrees=round(yaw, 1),
        pitch_degrees=round(pitch, 1),
    )