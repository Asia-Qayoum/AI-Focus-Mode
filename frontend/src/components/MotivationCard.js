import React from 'react';

const MotivationCard = ({ quote, author, videoUrl, reason }) => {
  const getReasonEmoji = (reason) => {
    switch (reason) {
      case 'eyes_closed': return '😴';
      case 'head_turned': return '👀';
      case 'yawning': return '😮‍💨';
      case 'phone_away': return '📱';
      case 'no_face': return '👤';
      default: return '⚠️';
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'eyes_closed': return 'Eyes Closed';
      case 'head_turned': return 'Looking Away';
      case 'yawning': return 'Yawning';
      case 'phone_away': return 'Phone Distraction';
      case 'no_face': return 'No Face Detected';
      default: return 'Distraction Detected';
    }
  };

  return (
    <div className="motivation-card rounded-xl p-6 text-white">
      {/* Distraction Alert */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{getReasonEmoji(reason)}</div>
        <div className="text-lg font-bold">{getReasonText(reason)}</div>
      </div>

      {/* Quote */}
      <div className="bg-white/20 rounded-lg p-4 mb-4">
        <blockquote className="text-lg italic mb-2">
          "{quote}"
        </blockquote>
        <cite className="text-sm opacity-80">- {author}</cite>
      </div>

      {/* Video */}
      <div className="bg-white/20 rounded-lg p-4">
        <div className="text-center mb-2">
          <div className="text-2xl mb-2">🎬</div>
          <div className="font-bold">Motivational Video</div>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white/30 hover:bg-white/40 rounded-lg p-3 text-center transition-colors"
        >
          Watch Now →
        </a>
      </div>

      {/* Refocus Message */}
      <div className="text-center mt-4 text-sm opacity-80">
        Take a deep breath and refocus
      </div>
    </div>
  );
};

export default MotivationCard;
