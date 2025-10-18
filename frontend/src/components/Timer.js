import React from 'react';

const Timer = ({ startTime, isActive }) => {
  const [currentTime, setCurrentTime] = React.useState(Date.now());

  React.useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const elapsed = Math.floor((currentTime - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatTime = (num) => num.toString().padStart(2, '0');

  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold text-white mb-2">
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </div>
      <div className="text-gray-400 text-lg">Session Time</div>
    </div>
  );
};

export default Timer;
