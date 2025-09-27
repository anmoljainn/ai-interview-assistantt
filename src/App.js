import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout, Tabs } from 'antd';
import { restoreSession } from './store/interviewSlice';
import IntervieweeTab from './components/IntervieweeTab/ChatInterface';
import InterviewerTab from './components/InterviewerTab/CandidateList';
import CandidateDetails from './components/InterviewerTab/CandidateDetails';
import WelcomeBackModal from './components/common/WelcomeBackModal';
import './styles.css';

const { Header, Content } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('1');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const dispatch = useDispatch();
  const interview = useSelector(state => state.interview);

  useEffect(() => {
    // Check for existing session on app load
    try {
      const savedState = localStorage.getItem('persist:root');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState && parsedState.interview) {
          const interviewState = JSON.parse(parsedState.interview);
          
          if (interviewState.currentCandidate && 
              interviewState.status !== 'completed') {
            setShowWelcomeBack(true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved state', e);
      // Clear corrupted data
      localStorage.removeItem('persist:root');
    }
  }, []);

  const handleContinue = () => {
    dispatch(restoreSession());
    setShowWelcomeBack(false);
    setActiveTab('1'); // Switch to interviewee tab
  };

  const handleStartNew = () => {
    setShowWelcomeBack(false);
  };

  return (
    <Layout className="layout">
      <Header>
        <div className="logo">AI Interview Assistant</div>
      </Header>
      <Content className="content">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                  {
                    key: '1',
                    label: 'Interviewee',
                    children: <IntervieweeTab />,
                  },
                  {
                    key: '2',
                    label: 'Interviewer Dashboard',
                    children: <InterviewerTab />,
                  },
                ]}
              />
            } />
            <Route path="/candidate/:candidateId" element={<CandidateDetails />} />
          </Routes>
          
          <WelcomeBackModal 
            visible={showWelcomeBack}
            onClose={handleStartNew}
            onContinue={handleContinue}
          />
        </BrowserRouter>
      </Content>
    </Layout>
  );
}

export default App;