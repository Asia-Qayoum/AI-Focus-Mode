import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MotivationCard from './MotivationCard';
import Timer from './Timer';

const FocusMode = ({ mockMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [distractionCount, setDistractionCount] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationData, setMotivationData] = useState(null);

  const topic = location.state?.topic || 'study';

  useEffect(() => {
    if (!mockMode) {
      requestCameraPermission();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [mockMode]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
      startDetection();
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission(false);
    }
  };

  const startDetection = () => {
    const interval = setInterval(async () => {
      if (mockMode) {
        // Mock detection
        if (Math.random() < 0.1) { // 10% chance of distraction
          handleDistraction('eyes_closed');
        }
      } else if (videoRef.current && canvasRef.current) {
        // Real detection
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        const base64Data = imageData.split(',')[1];
        
        try {
          const response = await fetch('http://localhost:8000/detect-focus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              frame_data: base64Data
            }),
          });
          
          const result = await response.json();
          if (!result.focused) {
            handleDistraction(result.reason);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
    }, 2000); // Check every 2 seconds
    
    setDetectionInterval(interval);
  };

  const handleDistraction = async (reason) => {
    setDistractionCount(prev => prev + 1);
    setIsDistracted(true);
    setShowMotivation(true);
    
    // Fetch motivation data
    try {
      const [quoteResponse, videoResponse] = await Promise.all([
        fetch('http://localhost:8000/get-quote'),
        fetch(`http://localhost:8000/get-video?topic=${topic}`)
      ]);
      
      const quote = await quoteResponse.json();
      const video = await videoResponse.json();
      
      setMotivationData({
        quote: quote.quote,
        author: quote.author,
        videoUrl: video.video_url,
        reason: reason
      });
    } catch (error) {
      console.error('Error fetching motivation:', error);
      setMotivationData({
        quote: "Stay focused and achieve your goals!",
        author: "FocusBoost AI",
        videoUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        reason: reason
      });
    }
    
    // Hide motivation after 10 seconds
    setTimeout(() => {
      setShowMotivation(false);
      setIsDistracted(false);
    }, 10000);
  };

  const endSession = async () => {
    const duration = Math.floor((Date.now() - sessionStartTime) / 60000); // minutes
    
    try {
      await fetch('http://localhost:8000/stop-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          duration: duration,
          distractions: distractionCount,
          details: {
            start_time: sessionStartTime,
            end_time: Date.now(),
            detection_reasons: []
          }
        }),
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
    
    setIsSessionActive(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Focus Session: {topic}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            Distractions: <span className="text-red-400 font-bold">{distractionCount}</span>
          </div>
          <button
            onClick={endSession}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Focus Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Timer */}
          <Timer startTime={sessionStartTime} isActive={isSessionActive} />
          
          {/* Status */}
          <div className="mt-8 text-center">
            <div className={`text-6xl mb-4 ${isDistracted ? 'text-red-500' : 'text-green-500'}`}>
              {isDistracted ? '⚠️' : '🎯'}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isDistracted ? 'Stay Focused!' : 'You\'re Focused!'}
            </h2>
            <p className="text-gray-400">
              {isDistracted ? 'Take a moment to refocus' : 'Keep up the great work!'}
            </p>
          </div>

          {/* Camera Feed (if not in mock mode) */}
          {!mockMode && cameraPermission && (
            <div className="mt-8 relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="rounded-lg border-2 border-gray-600"
                style={{ width: '320px', height: '240px' }}
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                AI Monitoring
              </div>
            </div>
          )}

          {/* Mock Mode Indicator */}
          {mockMode && (
            <div className="mt-8 bg-yellow-600 text-white px-4 py-2 rounded-lg">
              Demo Mode - Simulated Detection
            </div>
          )}
        </div>

        {/* Motivation Card */}
        {showMotivation && motivationData && (
          <div className="w-96 bg-gray-800 p-6">
            <MotivationCard 
              quote={motivationData.quote}
              author={motivationData.author}
              videoUrl={motivationData.videoUrl}
              reason={motivationData.reason}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
