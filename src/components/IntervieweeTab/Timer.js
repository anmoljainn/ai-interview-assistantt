import React, { useState, useEffect } from 'react';
import { Progress, Typography, Row, Col, Button, Tooltip } from 'antd';
import { ClockCircleOutlined, SoundOutlined, SoundFilled } from '@ant-design/icons';
import soundEffects, { playSound } from '../../utils/soundEffects';

const { Text } = Typography;

const Timer = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [percent, setPercent] = useState(100);
  const [isWarning, setIsWarning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setTimeLeft(duration);
    setPercent(100);
    setIsWarning(false);
  }, [duration]);

  useEffect(() => {
    let interval;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          const newPercent = (newTime / duration) * 100;
          setPercent(newPercent);
          
          // Show warning when less than 20% time remains
          if (newPercent <= 20 && !isWarning) {
            setIsWarning(true);
            if (soundEnabled) playSound('warning');
          }
          
          // Play tick sound for last 10 seconds
          if (newTime <= 10 && newTime > 0 && soundEnabled) {
            playSound('tick');
          }
          
          if (newTime <= 0) {
            clearInterval(interval);
            onTimeUp();
            if (soundEnabled) playSound('complete');
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, duration, onTimeUp, isWarning, soundEnabled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressColor = () => {
    if (percent > 50) return '#52c41a';
    if (percent > 20) return '#faad14';
    return '#f5222d';
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEffects.setEnabled(newState);
  };

  return (
    <div className={`timer-container ${isWarning ? 'timer-warning' : ''}`}>
      <Row align="middle" gutter={16}>
        <Col>
          <Progress 
            type="circle"
            percent={percent}
            format={() => formatTime(timeLeft)}
            strokeColor={getProgressColor()}
            width={80}
            status={percent <= 20 ? 'exception' : 'normal'}
          />
        </Col>
        <Col>
          <div className="timer-info">
            <Text strong className="timer-label">
              <ClockCircleOutlined /> Time Remaining
            </Text>
            <div className="timer-difficulty">
              {duration === 20 && <Text type="success">Easy Question</Text>}
              {duration === 60 && <Text type="warning">Medium Question</Text>}
              {duration === 120 && <Text type="danger">Hard Question</Text>}
            </div>
          </div>
        </Col>
        <Col>
          <Tooltip title={soundEnabled ? "Mute sounds" : "Enable sounds"}>
            <Button 
              type="text" 
              icon={soundEnabled ? <SoundFilled /> : <SoundOutlined />}
              onClick={toggleSound}
            />
          </Tooltip>
        </Col>
      </Row>
    </div>
  );
};

export default Timer;