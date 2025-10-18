from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional, List
import sqlite3
import json
import os
from datetime import datetime, timedelta
import requests
import base64
import cv2
import numpy as np
import mediapipe as mp
from dotenv import load_dotenv
import logging
import re
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="FocusBoost AI API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Configuration
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
QUOTE_API = os.getenv("QUOTE_API", "zenquotes")

# MediaPipe setup
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_face_detection = mp.solutions.face_detection

# Detection thresholds
DETECTION_CONFIG = {
    "eye_aspect_ratio_threshold": 0.25,
    "head_pose_threshold": 30,  # degrees
    "yawn_threshold": 0.5,
    "no_face_timeout": 3,  # seconds
    "distraction_cooldown": 2  # seconds between detections
}

# Database setup
def init_db():
    conn = sqlite3.connect('focus_sessions.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            duration INTEGER NOT NULL,
            distractions INTEGER NOT NULL,
            date TEXT NOT NULL,
            details TEXT,
            user_id TEXT DEFAULT 'default'
        )
    ''')
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Pydantic models with validation
class SessionStart(BaseModel):
    topic: str
    user_id: Optional[str] = "default"

class SessionEnd(BaseModel):
    duration: int  # minutes
    distractions: int
    topic: str
    details: Optional[dict] = None
    
    @field_validator('duration')
    @classmethod
    def validate_duration(cls, v):
        if v < 0 or v > 1440:  # Max 24 hours
            raise ValueError('Duration must be between 0 and 1440 minutes')
        return v
    
    @field_validator('distractions')
    @classmethod
    def validate_distractions(cls, v):
        if v < 0:
            raise ValueError('Distractions cannot be negative')
        return v

class FocusDetection(BaseModel):
    frame_data: str  # base64 encoded image
    session_id: Optional[str] = None
    
    @field_validator('frame_data')
    @classmethod
    def validate_frame_data(cls, v):
        # Basic base64 validation
        if not re.match(r'^[A-Za-z0-9+/]*={0,2}$', v):
            raise ValueError('Invalid base64 format')
        if len(v) > 10 * 1024 * 1024:  # 10MB limit
            raise ValueError('Image too large (max 10MB)')
        return v

class DetectionResult(BaseModel):
    focused: bool
    reason: Optional[str] = None
    confidence: Optional[float] = None

# Focus detection class
class FocusDetector:
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.face_detection = mp_face_detection.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.5
        )
        self.last_distraction_time = 0
        
    def calculate_ear(self, landmarks, eye_indices):
        """Calculate Eye Aspect Ratio"""
        eye_points = np.array([(landmarks[i].x, landmarks[i].y) for i in eye_indices])
        
        # Calculate distances
        A = np.linalg.norm(eye_points[1] - eye_points[5])
        B = np.linalg.norm(eye_points[2] - eye_points[4])
        C = np.linalg.norm(eye_points[0] - eye_points[3])
        
        ear = (A + B) / (2.0 * C)
        return ear
    
    def detect_focus(self, frame_data: str) -> DetectionResult:
        """Detect if user is focused based on frame data"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(frame_data)
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return DetectionResult(focused=False, reason="invalid_image")
            
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            height, width, _ = image.shape
            
            # Face detection
            face_results = self.face_detection.process(rgb_image)
            
            if not face_results.detections:
                return DetectionResult(focused=False, reason="no_face")
            
            # Face mesh for detailed analysis
            mesh_results = self.face_mesh.process(rgb_image)
            
            if not mesh_results.multi_face_landmarks:
                return DetectionResult(focused=False, reason="no_face")
            
            landmarks = mesh_results.multi_face_landmarks[0].landmark
            
            # Eye aspect ratio calculation (simplified)
            left_eye_indices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
            right_eye_indices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
            
            left_ear = self.calculate_ear(landmarks, left_eye_indices)
            right_ear = self.calculate_ear(landmarks, right_eye_indices)
            avg_ear = (left_ear + right_ear) / 2.0
            
            # Check for eyes closed
            if avg_ear < DETECTION_CONFIG["eye_aspect_ratio_threshold"]:
                return DetectionResult(focused=False, reason="eyes_closed", confidence=avg_ear)
            
            # Simple head pose estimation (simplified)
            nose_tip = landmarks[1]
            left_eye = landmarks[33]
            right_eye = landmarks[362]
            
            # Calculate head rotation
            eye_distance = abs(left_eye.x - right_eye.x)
            nose_offset = abs(nose_tip.x - (left_eye.x + right_eye.x) / 2)
            
            if nose_offset > eye_distance * 0.3:
                return DetectionResult(focused=False, reason="head_turned", confidence=nose_offset)
            
            # Mouth aspect ratio for yawning detection
            mouth_indices = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
            mouth_points = np.array([(landmarks[i].x, landmarks[i].y) for i in mouth_indices])
            mouth_width = np.linalg.norm(mouth_points[0] - mouth_points[6])
            mouth_height = np.linalg.norm(mouth_points[3] - mouth_points[9])
            mar = mouth_height / mouth_width
            
            if mar > DETECTION_CONFIG["yawn_threshold"]:
                return DetectionResult(focused=False, reason="yawning", confidence=mar)
            
            return DetectionResult(focused=True, confidence=avg_ear)
            
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return DetectionResult(focused=False, reason="detection_error")

# Initialize detector
detector = FocusDetector()

# Mock detection for testing
def mock_detection() -> DetectionResult:
    """Mock detection for testing without camera"""
    import random
    reasons = ["eyes_closed", "head_turned", "yawning", "phone_away"]
    if random.random() < 0.1:  # 10% chance of distraction
        return DetectionResult(focused=False, reason=random.choice(reasons))
    return DetectionResult(focused=True)

# API Routes
@app.post("/start-session")
@limiter.limit("10/minute")
async def start_session(request: Request, session: SessionStart):
    """Start a new focus session"""
    try:
        logger.info(f"Received start-session request: {session}")
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        logger.info(f"Started session: {session_id} for topic: {session.topic}")
        return {"session_id": session_id, "status": "started"}
    except Exception as e:
        logger.error(f"Error in start-session: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/stop-session")
@limiter.limit("10/minute")
async def stop_session(request: Request, session: SessionEnd):
    """Stop and save a focus session"""
    conn = sqlite3.connect('focus_sessions.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO sessions (topic, duration, distractions, date, details)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        session.topic,
        session.duration,
        session.distractions,
        datetime.now().isoformat(),
        json.dumps(session.details) if session.details else None
    ))
    
    conn.commit()
    conn.close()
    
    logger.info(f"Session ended: {session.duration}min, {session.distractions} distractions")
    return {"status": "saved", "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"}

@app.post("/detect-focus", response_model=DetectionResult)
@limiter.limit("30/minute")
async def detect_focus(request: Request, detection: FocusDetection):
    """Detect focus state from frame data"""
    if MOCK_MODE:
        return mock_detection()
    
    return detector.detect_focus(detection.frame_data)

@app.get("/get-progress")
async def get_progress(range_type: str = "day"):
    """Get progress data for charts"""
    conn = sqlite3.connect('focus_sessions.db')
    cursor = conn.cursor()
    
    if range_type == "day":
        # Last 7 days
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT DATE(date) as session_date, 
                   SUM(duration) as total_minutes,
                   COUNT(*) as session_count,
                   SUM(distractions) as total_distractions
            FROM sessions 
            WHERE DATE(date) >= ?
            GROUP BY DATE(date)
            ORDER BY session_date
        ''', (start_date,))
    elif range_type == "week":
        # Last 12 weeks
        start_date = (datetime.now() - timedelta(weeks=12)).strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT strftime('%Y-W%W', date) as week,
                   SUM(duration) as total_minutes,
                   COUNT(*) as session_count,
                   SUM(distractions) as total_distractions
            FROM sessions 
            WHERE DATE(date) >= ?
            GROUP BY strftime('%Y-W%W', date)
            ORDER BY week
        ''', (start_date,))
    else:  # month
        # Last 12 months
        start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT strftime('%Y-%m', date) as month,
                   SUM(duration) as total_minutes,
                   COUNT(*) as session_count,
                   SUM(distractions) as total_distractions
            FROM sessions 
            WHERE DATE(date) >= ?
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month
        ''', (start_date,))
    
    results = cursor.fetchall()
    conn.close()
    
    return {
        "range": range_type,
        "data": [
            {
                "period": row[0],
                "total_minutes": row[1] or 0,
                "session_count": row[2] or 0,
                "total_distractions": row[3] or 0
            }
            for row in results
        ]
    }

@app.get("/get-quote")
async def get_quote():
    """Get a motivational quote"""
    if MOCK_MODE or QUOTE_API == "mock":
        quotes = [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
            "The way to get started is to quit talking and begin doing. - Walt Disney"
        ]
        import random
        return {"quote": random.choice(quotes), "author": "Motivational"}
    
    try:
        if QUOTE_API == "zenquotes":
            response = requests.get("https://zenquotes.io/api/random")
            if response.status_code == 200:
                data = response.json()[0]
                return {"quote": data['q'], "author": data['a']}
    except Exception as e:
        logger.error(f"Quote API error: {e}")
    
    # Fallback
    return {"quote": "Stay focused and achieve your goals!", "author": "FocusBoost AI"}

@app.get("/get-video")
async def get_video(topic: str = "study"):
    """Get a motivational YouTube short"""
    if MOCK_MODE or not YOUTUBE_API_KEY:
        # Mock video URLs
        mock_videos = {
            "study": "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "coding": "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "art": "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "fitness": "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "other": "https://www.youtube.com/shorts/dQw4w9WgXcQ"
        }
        return {"video_url": mock_videos.get(topic, mock_videos["study"])}
    
    try:
        # YouTube Data API v3 search
        search_query = f"{topic} motivation short"
        url = f"https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": search_query,
            "type": "video",
            "videoDuration": "short",
            "maxResults": 1,
            "key": YOUTUBE_API_KEY
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data['items']:
                video_id = data['items'][0]['id']['videoId']
                return {"video_url": f"https://www.youtube.com/shorts/{video_id}"}
    except Exception as e:
        logger.error(f"YouTube API error: {e}")
    
    # Fallback
    return {"video_url": "https://www.youtube.com/shorts/dQw4w9WgXcQ"}

@app.get("/")
async def root():
    return {"message": "FocusBoost AI API", "status": "running", "mock_mode": MOCK_MODE}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
