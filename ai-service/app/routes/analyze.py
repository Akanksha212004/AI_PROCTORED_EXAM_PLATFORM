# app/routes/analyze.py

import wave

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from app.core.config import settings
from app.services.face_analysis import analyze_frame
from app.services.audio_analysis import analyze_audio_clip

router = APIRouter()


def verify_internal_key(x_internal_api_key: str = Header(default="")) -> None:
    if not settings.internal_api_key or x_internal_api_key != settings.internal_api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing internal API key")


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    near_threshold: float | None = Form(default=None),
    far_threshold: float | None = Form(default=None),
    x_internal_api_key: str = Header(default=""),
):
    verify_internal_key(x_internal_api_key)

    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Unsupported image type")

    image_bytes = await file.read()
    if len(image_bytes) > 3 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large")

    try:
        result = analyze_frame(image_bytes, near_threshold=near_threshold, far_threshold=far_threshold)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "faceCount": result.face_count,
        "gazeDirection": result.gaze_direction,
        "gazeConfidence": result.gaze_confidence,
    }


@router.post("/analyze-audio")
async def analyze_audio(
    file: UploadFile = File(...),
    x_internal_api_key: str = Header(default=""),
):
    verify_internal_key(x_internal_api_key)

    if file.content_type not in ("audio/wav", "audio/wave", "audio/x-wav"):
        raise HTTPException(status_code=400, detail="Unsupported audio type — expected WAV")

    audio_bytes = await file.read()
    if len(audio_bytes) > 4 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio clip too large")

    try:
        result = analyze_audio_clip(audio_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except wave.Error as exc:
        raise HTTPException(status_code=400, detail=f"Could not read WAV audio: {exc}") from exc

    return {
        "voicedFrameRatio": result.voiced_frame_ratio,
        "isSpeechDetected": result.is_speech_detected,
    }