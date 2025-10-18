#                         FocusBoost AI 🎯

> **AI-Powered Focus Tracking Web Application** - Stay focused with real-time webcam-based distraction detection, motivational content, and comprehensive progress analytics.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-blue?logo=react)](https://reactjs.org/)
[![Security](https://img.shields.io/badge/Security-Audited-green?logo=security)](https://github.com/your-repo/focusboost-ai)

## 🌟 Features

- **🎯 
























AI-Powered Focus Detection**: Real-time webcam monitoring with MediaPipe/OpenCV
- **🧠 Smart Distraction Detection**: Eyes closed, head turned, yawning, phone away detection
- **💪 Motivational Content**: Automatic YouTube shorts and quotes when distracted
- **📈 Progress Tracking**: Comprehensive analytics with day/week/month charts
- **📱 Session Management**: Track focus sessions with detailed statistics
- **🎮 Mock Mode**: Demo mode for testing without camera access
- **🎨 Responsive Design**: Beautiful UI with Tailwind CSS
- **🐳 Docker Ready**: Fully containerized with Docker Compose
- **🔒 Security First**: Rate limiting, input validation, secure headers

## 📸 Screenshots
<img width="1920" height="1080" alt="Screenshot (41)" src="https://github.com/user-attachments/assets/e8c80e07-8f07-4ff6-9250-b5482f01d86d" />

### Docker Compose Running
<img width="1113" height="649" alt="Screenshot 2025-10-18 005410" src="https://github.com/user-attachments/assets/bff7f536-3618-47de-97d4-e01e884c4b2e" />
<img width="1189" height="672" alt="Screenshot 2025-10-18 005438" src="https://github.com/user-attachments/assets/ba9f224f-84b6-46f9-9553-0edceb6d3f12" />
<img width="1080" height="724" alt="Screenshot 2025-10-18 005503" src="https://github.com/user-attachments/assets/19dde13a-12f9-4d73-9dea-1a47f78decfb" />


*Screenshot placeholder: `docker-compose up --build` command running successfully*

### Landing Page
<img width="1920" height="1080" alt="Screenshot (39)" src="https://github.com/user-attachments/assets/3507913e-867a-450c-8311-025431484b48" />

*Screenshot placeholder: Beautiful landing page with topic selection*

### Focus Mode
<img width="1920" height="1080" alt="Screenshot (40)" src="https://github.com/user-attachments/assets/d853f64c-e137-4f9b-8f5b-e8c2f6a5d1be" />


### Progress
<img width="1920" height="1080" alt="Screenshot (41)" src="https://github.com/user-attachments/assets/d8eddc62-869c-4521-b15c-f267a58d51f7" />




## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (latest version)
- **Webcam** (optional - works in mock mode)
- **8GB RAM** (recommended for AI processing)

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/focusboost-ai.git
cd focusboost-ai
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp env.example .env
```

Edit `.env` with your values:
```env
# API Keys (optional - app works without them in mock mode)
YOUTUBE_API_KEY=your_youtube_api_key_here
QUOTE_API=zenquotes

# App Settings
MOCK_MODE=true
DEBUG=false

# Security Settings
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📱 How to Use

### 1. Landing Page
- Choose your focus topic (Study, Coding, Art, Fitness, Other)
- Toggle Demo Mode if you don't want to use your camera
- Click "Start Focus Session"

### 2. Focus Mode
- The app monitors your focus in real-time
- When distracted, you'll see a motivational card with:
  - A motivational quote
  - A YouTube short video
  - Distraction reason
- Track your session time and distraction count
- End session when done

### 3. Dashboard
- View your progress with interactive charts
- Switch between Day/Week/Month views
- See total focus time, sessions, distractions, and best streak
- Review recent sessions

## 🔧 API Endpoints

### Session Management
- `POST /start-session` - Start a new focus session
- `POST /stop-session` - End and save a session
- `POST /detect-focus` - Detect focus state from frame data

### Data & Content
- `GET /get-progress?range=day|week|month` - Get progress data
- `GET /get-quote` - Get motivational quote
- `GET /get-video?topic=study|coding|art|fitness|other` - Get YouTube short

### API Documentation
Visit http://localhost:8000/docs for interactive API documentation with:
- Request/response schemas
- Try-it-out functionality
- Authentication details
- Rate limiting information

## 🧠 AI Detection Features

### Detection Methods
- **Eyes Closed**: Eye Aspect Ratio (EAR) analysis
- **Head Turned**: Head pose estimation
- **Yawning**: Mouth aspect ratio analysis
- **No Face**: Face detection failure
- **Phone Away**: Face disappearance patterns

### Detection Thresholds (Configurable)
```python
DETECTION_CONFIG = {
    "eye_aspect_ratio_threshold": 0.25,
    "head_pose_threshold": 30,  # degrees
    "yawn_threshold": 0.5,
    "no_face_timeout": 3,  # seconds
    "distraction_cooldown": 2  # seconds between detections
}
```

## 🔒 Security Features

### Implemented Security Measures
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All inputs validated with Pydantic
- **CORS Protection**: Configured for specific origins
- **Trusted Hosts**: Middleware to prevent host header attacks
- **Secure Headers**: Security headers implemented
- **Environment Variables**: Sensitive data in environment files
- **Base64 Validation**: Image data validated before processing

### Security Best Practices
- Never commit `.env` files to version control
- Use strong API keys and rotate them regularly
- Run in mock mode for testing without exposing real APIs
- Monitor logs for suspicious activity
- Keep dependencies updated

## 🛠️ Development

### Local Development (without Docker)

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Project Structure
```
focusboost-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .gitignore          # Python gitignore
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LandingPage.js
│   │   │   ├── FocusMode.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Timer.js
│   │   │   └── MotivationCard.js
│   │   ├── App.js          # Main app component
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Tailwind CSS
│   ├── package.json        # Node dependencies
│   ├── Dockerfile         # Frontend container
│   └── .gitignore         # Node gitignore
├── docs/
│   └── screenshots/       # Screenshot placeholders
├── docker-compose.yml     # Multi-container setup
├── env.example           # Environment template
├── .gitignore           # Root gitignore
└── README.md            # This file
```

## 🔑 API Keys Setup

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `.env`: `YOUTUBE_API_KEY=your_key_here`

### Quote APIs
- **ZenQuotes**: Free, no key required
- **Type.fit**: Free, no key required
- **Mock**: Built-in quotes (default)

## 🐳 Docker Commands

### Build and Run
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build backend
```

### Individual Services
```bash
# Build backend only
docker-compose build backend

# Run frontend only
docker-compose up frontend

# View specific service logs
docker-compose logs -f backend
```

## 🧪 Testing

### Mock Mode Testing
- Set `MOCK_MODE=true` in `.env`
- App will simulate distractions randomly
- No camera required
- Perfect for testing UI and functionality

### Camera Testing
- Set `MOCK_MODE=false` in `.env`
- Grant camera permissions when prompted
- Real-time detection will work
- Test different distraction scenarios

### API Testing
- Visit http://localhost:8000/docs for interactive API docs
- Use the Swagger UI to test endpoints
- Check logs for detection results

## 📊 Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    duration INTEGER NOT NULL,
    distractions INTEGER NOT NULL,
    date TEXT NOT NULL,
    details TEXT,
    user_id TEXT DEFAULT 'default'
);
```

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
YOUTUBE_API_KEY=          # YouTube Data API v3 key
QUOTE_API=zenquotes       # zenquotes, type.fit, or mock

# App Settings
MOCK_MODE=true           # Enable mock mode
DEBUG=false              # Enable debug logging

# Detection Settings
EYE_ASPECT_RATIO_THRESHOLD=0.25
HEAD_POSE_THRESHOLD=30
YAWN_THRESHOLD=0.5
NO_FACE_TIMEOUT=3
DISTRACTION_COOLDOWN=2

# Security Settings
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🚨 Troubleshooting

### Common Issues

#### Camera Permission Denied
- **Solution**: Use mock mode or grant camera permissions
- **Alternative**: Test with uploaded images

#### Docker Build Fails
- **Solution**: Check Docker is running and has enough resources
- **Alternative**: Run services individually for debugging

#### API Keys Not Working
- **Solution**: Verify API keys are correct and APIs are enabled
- **Fallback**: App works in mock mode without API keys

#### Detection Not Working
- **Solution**: Check camera permissions and lighting
- **Debug**: Enable debug mode and check logs

#### Rate Limiting Errors
- **Solution**: Reduce request frequency or increase limits
- **Debug**: Check rate limiting configuration

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true

# View detailed logs
docker-compose logs -f backend

# Check specific service
docker-compose logs -f frontend
```

## 📈 Performance Optimization

### Backend Optimization
- Use connection pooling for database
- Implement caching for API responses
- Optimize image processing pipeline
- Add request compression

### Frontend Optimization
- Implement lazy loading for components
- Add service worker for offline support
- Optimize bundle size
- Implement virtual scrolling for large datasets

## 🔮 Roadmap & Future Improvements

### Planned Features
- [ ] **User Authentication**: JWT-based user system
- [ ] **Multi-user Support**: Separate sessions per user
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Mobile App**: React Native version
- [ ] **Cloud Deployment**: AWS/GCP deployment guides
- [ ] **Real-time Notifications**: WebSocket support
- [ ] **Custom Motivational Content**: User-uploaded content
- [ ] **Focus Challenges**: Gamification features

### Technical Improvements
- [ ] **Database Migration**: PostgreSQL for production
- [ ] **Microservices**: Split into smaller services
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Monitoring**: Application performance monitoring
- [ ] **Testing**: Comprehensive test suite
- [ ] **Documentation**: API documentation improvements

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure security best practices
- Test with both mock and real modes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** for face detection and analysis
- **OpenCV** for computer vision capabilities
- **FastAPI** for the robust backend framework
- **React** and **Tailwind CSS** for the beautiful frontend
- **Chart.js** for data visualization
- **Docker** for containerization

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **Review the API documentation** at `/docs`
3. **Enable debug mode** for detailed logs
4. **Create an issue** with detailed information
5. **Join our community** discussions

### Getting Help
- 📧 **Email**: support@focusboost-ai.com
- 💬 **Discord**: [Join our community](https://discord.gg/focusboost-ai)
- 📖 **Documentation**: [Full docs](https://docs.focusboost-ai.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-repo/focusboost-ai/issues)

---

## 📸 Screenshot Instructions

To complete the documentation, please capture these screenshots:

### 1. Docker Compose Running
```bash
# Run this command and take a screenshot
docker-compose up --build
```
**File**: `docs/screenshots/docker-compose-running.png`

### 2. Landing Page
- Open http://localhost:3000
- Take a screenshot of the landing page
**File**: `docs/screenshots/landing-page.png`

### 3. Focus Mode
- Start a focus session
- Take a screenshot of the focus mode interface
**File**: `docs/screenshots/focus-mode.png`

### 4. Dashboard
- Navigate to the dashboard
- Take a screenshot of the progress charts
**File**: `docs/screenshots/dashboard.png`

### 5. API Documentation
- Open http://localhost:8000/docs
- Take a screenshot of the Swagger UI
**File**: `docs/screenshots/api-docs.png`

---

**Happy Focusing! 🎯✨**

*Built with ❤️ for productivity enthusiasts*
