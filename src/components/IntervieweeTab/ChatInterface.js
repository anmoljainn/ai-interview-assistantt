import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import ResumeUpload from './ResumeUpload';
import Timer from './Timer';
import MissingFieldsModal from './MissingFieldsModal';
import { 
  startInterview, 
  submitAnswer, 
  nextQuestion, 
  completeInterview 
} from '../../store/interviewSlice';
import { generateQuestion, evaluateAnswer } from '../../services/aiService';
import { addCandidate } from '../../store/candidateSlice';

const { TextArea } = Input;

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('');
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [resumeData, setResumeData] = useState(null);
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

  useEffect(() => {
    scrollToBottom();
  }, [questions, answers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResumeUploadComplete = (data) => {
    setResumeData(data);
    
    const missingFields = [];
    if (!data.name) missingFields.push('name');
    if (!data.email) missingFields.push('email');
    if (!data.phone) missingFields.push('phone');
    
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
      const interviewQuestions = await generateQuestion(candidateData);
      dispatch(startInterview({ candidate: candidateData, questions: interviewQuestions }));
    } catch (error) {
      message.error('Failed to start interview. Please try again.');
      console.error('Interview start error:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!inputValue.trim()) {
      message.warning('Please provide an answer before submitting.');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answer = inputValue.trim();
    
    try {
      const evaluation = await evaluateAnswer(currentQuestion, answer);
      dispatch(submitAnswer({ answer, evaluation }));
      setInputValue('');
      
      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        // Calculate final score
        const totalScore = [...answers, { text: answer, evaluation }].reduce((sum, ans) => {
          return sum + (ans.evaluation?.score || 0);
        }, 0);
        
        const finalScore = totalScore / (answers.length + 1);
        
        // Generate a simple summary
        const summary = `Candidate ${currentCandidate.name} completed the interview with an average score of ${finalScore.toFixed(1)}/10. Performance was ${finalScore >= 7 ? 'good' : 'needs improvement'}.`;
        
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
      }
    } catch (error) {
      message.error('Failed to evaluate answer. Please try again.');
      console.error('Answer evaluation error:', error);
    }
  };

  const handleTimeUp = () => {
    if (inputValue.trim()) {
      handleSubmitAnswer();
    } else {
      dispatch(submitAnswer({ answer: '', evaluation: { score: 0, feedback: 'No answer provided' } }));
      
      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        // Calculate final score
        const totalScore = [...answers, { text: '', evaluation: { score: 0, feedback: 'No answer provided' } }].reduce((sum, ans) => {
          return sum + (ans.evaluation?.score || 0);
        }, 0);
        
        const finalScore = totalScore / (answers.length + 1);
        
        // Generate a simple summary
        const summary = `Candidate ${currentCandidate.name} completed the interview with an average score of ${finalScore.toFixed(1)}/10. Performance was ${finalScore >= 7 ? 'good' : 'needs improvement'}.`;
        
        // Add candidate to the list
        dispatch(addCandidate({
          ...currentCandidate,
          score: finalScore,
          summary,
          interviewDate: new Date().toISOString(),
          interviewData: {
            questions,
            answers: [...answers, { text: '', evaluation: { score: 0, feedback: 'No answer provided' } }]
          }
        }));
        
        dispatch(completeInterview());
        message.success('Interview completed! Thank you for your time.');
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

  if (status === 'idle') {
    return <ResumeUpload onComplete={handleResumeUploadComplete} />;
  }

  if (status === 'completed') {
    return (
      <div className="interview-completed">
        <Card title="Interview Completed">
          <p>Thank you for completing the interview, {currentCandidate.name}!</p>
          <p>Your final score will be calculated and shared with the interviewers.</p>
          <p>You can now close this window.</p>
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
        <div className="chat-messages">
          {renderChatMessages()}
          <div ref={messagesEndRef} />
        </div>
        
        {status === 'in-progress' && (
          <div className="chat-input-container">
            <div className="timer-container">
              <Timer 
                duration={timeRemaining} 
                onTimeUp={handleTimeUp}
                isActive={status === 'in-progress'}
              />
            </div>
            
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here..."
              autoSize={{ minRows: 3, maxRows: 5 }}
              disabled={status !== 'in-progress'}
            />
            
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSubmitAnswer}
              disabled={status !== 'in-progress'}
              className="submit-button"
            >
              Submit Answer
            </Button>
          </div>
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