import React, { useParams } from 'react';
import { Card, Descriptions, Tag, Typography, Divider, Button, Table, Dropdown, Menu } from 'antd';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined, 
  MailOutlined, 
  PhoneOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  MoreOutlined
} from '@ant-design/icons';
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

  const downloadReport = (format) => {
    if (!candidate) return;
    
    if (format === 'txt') {
      // Create a detailed text report
      const report = `
INTERVIEW REPORT
===============

Candidate Information
------------------
Name: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone}
Location: ${candidate.location || 'Not provided'}
Experience: ${candidate.experience}
Job Role: ${candidate.jobRole}
Portfolio: ${candidate.portfolio || 'Not provided'}
Skills: ${candidate.skills ? candidate.skills.join(', ') : 'Not provided'}
Interview Date: ${new Date(candidate.interviewDate).toLocaleDateString()}
Overall Score: ${candidate.score.toFixed(1)}/10

Summary
-------
 ${candidate.summary}

Interview Details
----------------
 ${candidate.interviewData.questions.map((q, i) => `
Question ${i+1} (${q.difficulty}): ${q.text}
Answer: ${candidate.interviewData.answers[i]?.text || 'No answer provided'}
Score: ${candidate.interviewData.answers[i]?.evaluation?.score || 0}/10
Feedback: ${candidate.interviewData.answers[i]?.evaluation?.feedback || 'No feedback'}
`).join('\n')}
      `;
      
      // Create and download the file
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidate.name.replace(/\s+/g, '_')}_Interview_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      // Create a JSON report
      const report = JSON.stringify(candidate, null, 2);
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidate.name.replace(/\s+/g, '_')}_Interview_Data.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="txt" icon={<DownloadOutlined />} onClick={() => downloadReport('txt')}>
        Text Report (.txt)
      </Menu.Item>
      <Menu.Item key="json" icon={<FileExcelOutlined />} onClick={() => downloadReport('json')}>
        Data Export (.json)
      </Menu.Item>
    </Menu>
  );

  // Prepare data for the performance table
  const performanceData = candidate.interviewData.questions.map((q, i) => ({
    key: i,
    question: `Q${i+1}`,
    difficulty: q.difficulty,
    score: candidate.interviewData.answers[i]?.evaluation?.score || 0,
    feedback: candidate.interviewData.answers[i]?.evaluation?.feedback || 'No feedback',
  }));

  const performanceColumns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: difficulty => (
        <Tag color={getDifficultyColor(difficulty)}>
          {difficulty}
        </Tag>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: score => (
        <Tag color={getScoreColor(score)}>
          {score}/10
        </Tag>
      ),
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      ellipsis: true,
    },
  ];

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
          <Dropdown overlay={exportMenu} placement="bottomRight">
            <Button type="primary" icon={<DownloadOutlined />}>
              Export <MoreOutlined />
            </Button>
          </Dropdown>
        </div>
        
        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Email">
            <a href={`mailto:${candidate.email}`}>
              <MailOutlined /> {candidate.email}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            <a href={`tel:${candidate.phone}`}>
              <PhoneOutlined /> {candidate.phone}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {candidate.location || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Experience">
            {candidate.experience === 'entry' && 'Entry Level (0-2 years)'}
            {candidate.experience === 'mid' && 'Mid Level (3-5 years)'}
            {candidate.experience === 'senior' && 'Senior Level (6-10 years)'}
            {candidate.experience === 'lead' && 'Lead/Principal (10+ years)'}
          </Descriptions.Item>
          <Descriptions.Item label="Job Role">
            {candidate.jobRole === 'frontend' && 'Frontend Developer'}
            {candidate.jobRole === 'backend' && 'Backend Developer'}
            {candidate.jobRole === 'fullstack' && 'Full Stack Developer'}
            {candidate.jobRole === 'devops' && 'DevOps Engineer'}
            {candidate.jobRole === 'mobile' && 'Mobile Developer'}
            {candidate.jobRole === 'qa' && 'QA Engineer'}
            {candidate.jobRole === 'uiux' && 'UI/UX Designer'}
            {candidate.jobRole === 'datascience' && 'Data Scientist'}
          </Descriptions.Item>
          <Descriptions.Item label="Portfolio">
            {candidate.portfolio ? (
              <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer">
                <FilePdfOutlined /> View Portfolio
              </a>
            ) : 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Skills">
            {candidate.skills && candidate.skills.length > 0 
              ? candidate.skills.map(skill => <Tag key={skill}>{skill}</Tag>)
              : 'Not provided'}
          </Descriptions.Item>
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
        
        <Title level={3}>Performance Summary</Title>
        <Table
          columns={performanceColumns}
          dataSource={performanceData}
          pagination={false}
          bordered
          size="small"
        />
        
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