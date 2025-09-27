import React, { useState, useEffect } from 'react';
import { Progress, Typography } from 'antd';

const { Text } = Typography;

const Timer = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    setTimeLeft(duration);
    setPercent(100);
  }, [duration]);

  useEffect(() => {
    let interval;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          setPercent((newTime / duration) * 100);
          
          if (newTime <= 0) {
            clearInterval(interval);
            onTimeUp();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, duration, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTimerColor = () => {
    if (percent > 50) return '#52c41a';
    if (percent > 20) return '#faad14';
    return '#f5222d';
  };

  return (
    <div className="timer-container">
      <div className="timer-display">
        <Text strong>Time remaining:</Text>
        <Text 
          strong 
          style={{ 
            color: getTimerColor(),
            fontSize: '18px',
            marginLeft: '8px'
          }}
        >
          {formatTime(timeLeft)}
        </Text>
      </div>
      <Progress 
        percent={percent} 
        showInfo={false} 
        strokeColor={getTimerColor()}
        size="small"
      />
    </div>
  );
};

export default Timer;