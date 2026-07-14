# AI Proctoring Analysis Service

Internal-only Python microservice. Node backend sends webcam frames
here; this returns face count + a heuristic gaze direction. Never
expose this port publicly.

## Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env, set AI_SERVICE_INTERNAL_KEY to a long random value
# (same value must be set as AI_SERVICE_INTERNAL_KEY in the Node backend's .env)
```

## Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Test it directly (optional sanity check)

```bash
curl -X POST http://localhost:8001/analyze \
  -H "X-Internal-Api-Key: <same value as .env>" \
  -F "file=@/path/to/some/photo.jpg"
```

Expected response:
```json
{ "faceCount": 1, "gazeDirection": "CENTER", "gazeConfidence": 0.92 }
```

## Why MediaPipe instead of face-api.js

- Runs server-side — the browser can no longer disable/tamper with
  detection logic (there isn't any client-side detection logic left).
- MediaPipe is Google's actively-maintained, production-grade face
  detection/mesh library — more robust than the browser TF.js models
  used before.
- Frees the student's device from running any ML inference at all.

## Known limitations (unchanged from before, still honest about them)

- Gaze direction is still a heuristic (eye-landmark offset from face
  center), not true 3D gaze/head-pose estimation.
- A virtual/fake webcam feed (e.g. OBS Virtual Cam looping a photo)
  isn't detected — that's a liveness-detection problem, out of scope
  here.
