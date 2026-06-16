# CoachCam Pro
Pose tracking with AI coaching grounded in your actual training plan via RAG.

## How it works
1. Upload your training plan to backend/data/
2. The webcam tracks your joint angles in real-time (all in browser)
3. Click "Get Coaching" — the AI compares your angles to your training plan
4. Feedback references your specific targets, not generic fitness advice

## Stack
- Frontend: React + Vite + MediaPipe Tasks Vision
- Backend: Flask + OpenAI-compatible API + RAG (reads your training plan)

## Quick start
1. Add your training plan as a .md file to backend/data/
2. cd backend && pip install -r requirements.txt && cp .env.example .env && python app.py
3. cd frontend && npm install && npm run dev
