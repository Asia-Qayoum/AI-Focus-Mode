import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ mockMode, setMockMode }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const topics = [
    { id: 'study', label: 'Study', icon: '📚', color: 'bg-blue-500' },
    { id: 'coding', label: 'Coding', icon: '💻', color: 'bg-green-500' },
    { id: 'art', label: 'Art', icon: '🎨', color: 'bg-purple-500' },
    { id: 'fitness', label: 'Fitness', icon: '💪', color: 'bg-red-500' },
    { id: 'other', label: 'Other', icon: '⭐', color: 'bg-gray-500' }
  ];

  const handleStartFocus = async () => {
    if (!selectedTopic) return;
    
    setIsLoading(true);
    try {
      // Start session
      const response = await fetch('http://localhost:8000/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          user_id: 'default'
        }),
      });
      
      if (response.ok) {
        navigate('/focus', { state: { topic: selectedTopic } });
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen focus-gradient flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            FocusBoost AI
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Stay focused with AI-powered distraction detection
          </p>
          
          {/* Mock Mode Toggle */}
          <div className="flex items-center justify-center mb-8">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mockMode}
                onChange={(e) => setMockMode(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mockMode ? 'bg-focus-500' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mockMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-3 text-white font-medium">
                Demo Mode {mockMode ? '(ON)' : '(OFF)'}
              </span>
            </label>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            What are you focusing on today?
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{topic.icon}</div>
                <div className="font-medium text-gray-700">{topic.label}</div>
              </button>
            ))}
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartFocus}
            disabled={!selectedTopic || isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
              selectedTopic && !isLoading
                ? 'bg-focus-500 hover:bg-focus-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Starting...' : 'Start Focus Session'}
          </button>

          {/* Dashboard Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View Progress Dashboard →
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center text-white">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold mb-1">AI Detection</h3>
            <p className="text-sm text-white/80">Real-time focus monitoring</p>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-bold mb-1">Progress Tracking</h3>
            <p className="text-sm text-white/80">Track your improvement</p>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl mb-2">💪</div>
            <h3 className="font-bold mb-1">Motivation</h3>
            <p className="text-sm text-white/80">Stay motivated with quotes & videos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
