import React, { useParams } from 'react';
import { Card, Descriptions, Tag, Typography, Divider, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const CandidateDetails = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  
  const candidates = useSelector(state => state.candidates.list);
  const candidate = candidates.find(c => c.id === candidateId);

  if (!candidate) {
    return (
      <div className="candidate-details-container">
        <Card>
          <Title level={3}>Candidate Not Found</Title>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Candidates
          </Button>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'processing';
    return 'error';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#f5222d';
      default: return '#1890ff';
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="candidate-details-container">
      <Card>
        <div className="details-header">
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            Back to Candidates
          </Button>
          <Title level={2}>{candidate.name}</Title>
        </div>
        
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{candidate.phone}</Descriptions.Item>
          <Descriptions.Item label="Interview Date">
            {new Date(candidate.interviewDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Overall Score">
            <Tag color={getScoreColor(candidate.score)}>
              {candidate.score.toFixed(1)}/10
            </Tag>
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Title level={3}>AI Summary</Title>
        <Paragraph>{candidate.summary}</Paragraph>
        
        <Divider />
        
        <Title level={3}>Interview Details</Title>
        
        {candidate.interviewData && candidate.interviewData.questions && (
          <div className="interview-questions">
            {candidate.interviewData.questions.map((question, index) => (
              <Card key={index} className="question-card" type="inner">
                <div className="question-header">
                  <Title level={4}>Question {index + 1}</Title>
                  <Tag 
                    color={getDifficultyColor(question.difficulty)}
                    style={{ marginLeft: '10px' }}
                  >
                    {question.difficulty}
                  </Tag>
                </div>
                <Paragraph>{question.text}</Paragraph>
                
                <div className="answer-section">
                  <Title level={5}>Candidate's Answer:</Title>
                  <Paragraph>
                    {candidate.interviewData.answers[index]?.text || 'No answer provided'}
                  </Paragraph>
                  
                  {candidate.interviewData.answers[index]?.evaluation && (
                    <div className="evaluation-section">
                      <Title level={5}>Evaluation:</Title>
                      <div className="evaluation-score">
                        <Tag color={getScoreColor(candidate.interviewData.answers[index].evaluation.score)}>
                          Score: {candidate.interviewData.answers[index].evaluation.score}/10
                        </Tag>
                      </div>
                      <Paragraph>
                        {candidate.interviewData.answers[index].evaluation.feedback}
                      </Paragraph>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CandidateDetails;