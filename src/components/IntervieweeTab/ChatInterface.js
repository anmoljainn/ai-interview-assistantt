import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Input, message, Progress, Row, Col, Typography, Tooltip, Alert, Divider } from 'antd';
import { SendOutlined, CheckCircleOutlined, SaveOutlined, ForwardOutlined, ReloadOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import ResumeUpload from './ResumeUpload';
import Timer from './Timer';
import MissingFieldsModal from './MissingFieldsModal';
import { 
  startInterview, 
  submitAnswer, 
  nextQuestion, 
  completeInterview,
  resetInterview,
  pauseInterview,
  resumeInterview
} from '../../store/interviewSlice';
import { generateQuestion, evaluateAnswer } from '../../services/aiService';
import { addCandidate } from '../../store/candidateSlice';
import { sanitizeInput, rateLimit } from '../../utils/security';
import soundEffects from '../../utils/soundEffects';

const { TextArea } = Input;
const { Text } = Typography;

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('');
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [savedDraft, setSavedDraft] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const messagesEndRef = useRef(null);
  
  const dispatch = useDispatch();
  
  const {
    currentCandidate,
    questions,
    currentQuestionIndex,
    answers,
    status,
    timeRemaining
  } = useSelector(state => state.interview);

  // Initialize sound effects on component mount
  useEffect(() => {
    // Pre-initialize audio context on user interaction
    const handleFirstInteraction = () => {
      soundEffects.initAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Auto-save draft answers with rate limiting
  useEffect(() => {
    if (status === 'in-progress' && inputValue.trim() && !isPaused) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      const timer = setTimeout(() => {
        // In a real app, this would save to a backend
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
        if (soundEffects.isEnabled()) {
          soundEffects.play('click');
        }
      }, 3000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [inputValue, status, autoSaveTimer, isPaused]);

  // Memoize the event handlers to prevent unnecessary re-renders
  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      // Resume interview
      dispatch(resumeInterview());
      setIsPaused(false);
      if (soundEffects.isEnabled()) {
        soundEffects.play('click');
      }
    } else {
      // Pause interview
      dispatch(pauseInterview());
      setIsPaused(true);
      setRemainingTime(timeRemaining);
      if (soundEffects.isEnabled()) {
        soundEffects.play('click');
      }
    }
  }, [dispatch, isPaused, timeRemaining]);

  // Rate-limited submit function
  const handleSubmitAnswer = useCallback(async () => {
    if (!inputValue.trim()) {
      message.warning('Please provide an answer before submitting.');
      if (soundEffects.isEnabled()) {
        soundEffects.play('error');
      }
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answer = sanitizeInput(inputValue.trim());
    
    try {
      setIsThinking(true);
      const evaluation = await evaluateAnswer(currentQuestion, answer);
      dispatch(submitAnswer({ answer, evaluation }));
      setInputValue('');
      setIsThinking(false);
      
      if (soundEffects.isEnabled()) {
        soundEffects.play('click');
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        // Calculate final score
        const totalScore = [...answers, { text: answer, evaluation }].reduce((sum, ans) => {
          return sum + (ans.evaluation?.score || 0);
        }, 0);
        
        const finalScore = totalScore / (answers.length + 1);
        
        // Generate a detailed summary
        const summary = generateDetailedSummary(currentCandidate, finalScore, [...answers, { text: answer, evaluation }]);
        
        // Add candidate to the list
        dispatch(addCandidate({
          ...currentCandidate,
          score: finalScore,
          summary,
          interviewDate: new Date().toISOString(),
          interviewData: {
            questions,
            answers: [...answers, { text: answer, evaluation }]
          }
        }));
        
        dispatch(completeInterview());
        message.success('Interview completed! Thank you for your time.');
        
        if (soundEffects.isEnabled()) {
          soundEffects.play('complete');
        }
      }
    } catch (error) {
      setIsThinking(false);
      message.error('Failed to evaluate answer. Please try again.');
      if (soundEffects.isEnabled()) {
        soundEffects.play('error');
      }
      console.error('Answer evaluation error:', error);
    }
  }, [inputValue, questions, currentQuestionIndex, answers, currentCandidate, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'in-progress' || isPaused) return;
      
      // Ctrl+Enter to submit
      if (e.ctrlKey && e.key === 'Enter') {
        handleSubmitAnswer();
      }
      
      // Ctrl+S to save draft
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
        if (soundEffects.isEnabled()) {
          soundEffects.play('click');
        }
      }
      
      // Ctrl+P to pause/resume
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handlePauseResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, isPaused, handleSubmitAnswer, handlePauseResume]);

  useEffect(() => {
    scrollToBottom();
  }, [questions, answers, isThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResumeUploadComplete = (data) => {
    setResumeData(data);
    
    const missingFields = [];
    if (!data.name) missingFields.push('name');
    if (!data.email) missingFields.push('email');
    if (!data.phone) missingFields.push('phone');
    if (!data.experience) missingFields.push('experience');
    if (!data.jobRole) missingFields.push('jobRole');
    if (!data.location) missingFields.push('location');
    
    if (missingFields.length > 0) {
      setShowMissingFields(true);
    } else {
      startInterviewProcess(data);
    }
  };

  const handleMissingFieldsComplete = (completeData) => {
    setShowMissingFields(false);
    startInterviewProcess(completeData);
  };

  const startInterviewProcess = async (candidateData) => {
    try {
      setIsThinking(true);
      const interviewQuestions = await generateQuestion(candidateData);
      dispatch(startInterview({ candidate: candidateData, questions: interviewQuestions }));
      setIsThinking(false);
      
      if (soundEffects.isEnabled()) {
        soundEffects.play('click');
      }
    } catch (error) {
      setIsThinking(false);
      message.error('Failed to start interview. Please try again.');
      if (soundEffects.isEnabled()) {
        soundEffects.play('error');
      }
      console.error('Interview start error:', error);
    }
  };

  const generateDetailedSummary = (candidate, score, allAnswers) => {
    // Calculate performance by difficulty
    const easyQuestions = allAnswers.filter((_, i) => questions[i]?.difficulty === 'Easy');
    const mediumQuestions = allAnswers.filter((_, i) => questions[i]?.difficulty === 'Medium');
    const hardQuestions = allAnswers.filter((_, i) => questions[i]?.difficulty === 'Hard');
    
    const easyScore = easyQuestions.reduce((sum, ans) => sum + (ans.evaluation?.score || 0), 0) / easyQuestions.length || 0;
    const mediumScore = mediumQuestions.reduce((sum, ans) => sum + (ans.evaluation?.score || 0), 0) / mediumQuestions.length || 0;
    const hardScore = hardQuestions.reduce((sum, ans) => sum + (ans.evaluation?.score || 0), 0) / hardQuestions.length || 0;
    
    return `${candidate.name} (${candidate.experience} experience, applying for ${candidate.jobRole}) completed the interview with an overall score of ${score.toFixed(1)}/10. 
    Performance by difficulty: Easy questions - ${easyScore.toFixed(1)}/10, Medium questions - ${mediumScore.toFixed(1)}/10, Hard questions - ${hardScore.toFixed(1)}/10. 
    ${score >= 8 ? 'Demonstrated excellent knowledge across all areas.' : 
      score >= 6 ? 'Showed good understanding with room for improvement in complex topics.' : 
      'Needs significant improvement in core concepts.'}
    ${candidate.skills && candidate.skills.length > 0 ? `Candidate mentioned skills in: ${candidate.skills.join(', ')}.` : ''}`;
  };

  const handleSkipQuestion = () => {
    if (status !== 'in-progress') return;
    
    dispatch(submitAnswer({ 
      answer: '', 
      evaluation: { score: 0, feedback: 'Question skipped' } 
    }));
    
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(nextQuestion());
    } else {
      // Calculate final score
      const totalScore = [...answers, { text: '', evaluation: { score: 0, feedback: 'Question skipped' } }].reduce((sum, ans) => {
        return sum + (ans.evaluation?.score || 0);
      }, 0);
      
      const finalScore = totalScore / (answers.length + 1);
      
      // Generate a detailed summary
      const summary = generateDetailedSummary(currentCandidate, finalScore, [...answers, { text: '', evaluation: { score: 0, feedback: 'Question skipped' } }]);
      
      // Add candidate to the list
      dispatch(addCandidate({
        ...currentCandidate,
        score: finalScore,
        summary,
        interviewDate: new Date().toISOString(),
        interviewData: {
          questions,
          answers: [...answers, { text: '', evaluation: { score: 0, feedback: 'Question skipped' } }]
        }
      }));
      
      dispatch(completeInterview());
      message.success('Interview completed! Thank you for your time.');
    }
    
    setShowSkipConfirm(false);
  };

  const handleRetakeInterview = () => {
    if (window.confirm('Are you sure you want to retake the interview? This will discard your current results.')) {
      dispatch(resetInterview());
      if (soundEffects.isEnabled()) {
        soundEffects.play('click');
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#f5222d';
      default: return '#1890ff';
    }
  };

  const renderChatMessages = () => {
    if (!questions.length) return null;
    
    return questions.slice(0, currentQuestionIndex + 1).map((question, index) => (
      <div key={index}>
        <div className="chat-message ai-message">
          <div className="message-header">
            <span className="ai-label">AI Assistant</span>
            <span 
              className="difficulty-tag" 
              style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
            >
              {question.difficulty}
            </span>
          </div>
          <div className="message-content">{question.text}</div>
        </div>
        
        {index < currentQuestionIndex && (
          <div className="chat-message user-message">
            <div className="message-header">
              <span className="user-label">You</span>
              {answers[index]?.evaluation && (
                <span className="score-tag">
                  <CheckCircleOutlined /> {answers[index].evaluation.score}/10
                </span>
              )}
            </div>
            <div className="message-content">{answers[index]?.text || 'No answer provided'}</div>
            {answers[index]?.evaluation && (
              <div className="answer-evaluation">
                <div className="evaluation-score">Score: {answers[index].evaluation.score}/10</div>
                <div className="evaluation-feedback">{answers[index].evaluation.feedback}</div>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  // Calculate progress percentage
  const progressPercentage = questions.length > 0 
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) 
    : 0;

  if (status === 'idle') {
    return <ResumeUpload onComplete={handleResumeUploadComplete} />;
  }

  if (status === 'completed') {
    return (
      <div className="interview-completed">
        <Card title="Interview Completed">
          <p>Thank you for completing the interview, {currentCandidate.name}!</p>
          <p>Your final score will be calculated and shared with the interviewers.</p>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleRetakeInterview}
            style={{ marginTop: 16 }}
          >
            Retake Interview
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Card 
        title={`Interview with ${currentCandidate.name}`} 
        className="chat-card"
      >
        {/* Progress Bar */}
        <div className="interview-progress">
          <Text className="progress-text">
            Question {currentQuestionIndex + 1} of {questions.length} 
            ({progressPercentage}%)
          </Text>
          <Progress 
            percent={progressPercentage} 
            strokeColor={getDifficultyColor(questions[currentQuestionIndex]?.difficulty)}
            showInfo={false}
          />
        </div>
        
        {isPaused && (
          <Alert
            message="Interview Paused"
            description="Your interview has been paused. Click the Resume button to continue."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <div className="chat-messages">
          {renderChatMessages()}
          
          {/* Typing Indicator */}
          {isThinking && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <Text type="secondary" style={{ marginLeft: '8px' }}>AI is evaluating your answer...</Text>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {status === 'in-progress' && (
          <>
            <Divider />
            <div className="chat-input-container">
              <div className="timer-container">
                <Timer 
                  duration={isPaused ? remainingTime : timeRemaining} 
                  onTimeUp={handleSubmitAnswer}
                  isActive={status === 'in-progress' && !isPaused}
                />
              </div>
              
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here... (Ctrl+Enter to submit, Ctrl+S to save draft, Ctrl+P to pause)"
                autoSize={{ minRows: 3, maxRows: 5 }}
                disabled={status !== 'in-progress' || isPaused}
              />
              
              <Row gutter={8} style={{ marginTop: '8px' }}>
                <Col span={6}>
                  <Tooltip title="Save Draft (Ctrl+S)">
                    <Button 
                      icon={<SaveOutlined />}
                      disabled={status !== 'in-progress' || !inputValue.trim() || isPaused}
                      onClick={() => {
                        setSavedDraft(true);
                        setTimeout(() => setSavedDraft(false), 2000);
                      }}
                      block
                    >
                      {savedDraft ? 'Saved!' : 'Save Draft'}
                    </Button>
                  </Tooltip>
                </Col>
                <Col span={6}>
                  <Tooltip title={isPaused ? "Resume Interview (Ctrl+P)" : "Pause Interview (Ctrl+P)"}>
                    <Button 
                      icon={isPaused ? <CaretRightOutlined /> : <PauseOutlined />}
                      onClick={handlePauseResume}
                      block
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                  </Tooltip>
                </Col>
                <Col span={6}>
                  <Tooltip title="Skip this question">
                    <Button 
                      icon={<ForwardOutlined />}
                      onClick={() => setShowSkipConfirm(true)}
                      disabled={status !== 'in-progress' || isPaused}
                      block
                    >
                      Skip
                    </Button>
                  </Tooltip>
                </Col>
                <Col span={6}>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleSubmitAnswer}
                    disabled={status !== 'in-progress' || isPaused}
                    className="submit-button"
                    block
                  >
                    Submit Answer
                  </Button>
                </Col>
              </Row>
              
              {showSkipConfirm && (
                <Alert
                  message="Skip Question"
                  description="Are you sure you want to skip this question? This will affect your final score."
                  type="warning"
                  showIcon
                  action={
                    <>
                      <Button size="small" onClick={() => setShowSkipConfirm(false)}>
                        Cancel
                      </Button>
                      <Button size="small" type="primary" onClick={handleSkipQuestion}>
                        Skip
                      </Button>
                    </>
                  }
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          </>
        )}
      </Card>
      
      <MissingFieldsModal
        visible={showMissingFields}
        onComplete={handleMissingFieldsComplete}
        initialData={resumeData}
      />
    </div>
  );
};

export default ChatInterface;