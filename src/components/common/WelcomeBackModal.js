import React from 'react';
import { Modal, Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const WelcomeBackModal = ({ visible, onClose, onContinue }) => {
  return (
    <Modal
      title="Welcome Back!"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="new" onClick={onClose}>
          Start New Interview
        </Button>,
        <Button key="back" type="primary" onClick={onContinue}>
          Continue Interview
        </Button>,
      ]}
    >
      <Title level={4}>Welcome back!</Title>
      <Paragraph>
        It looks like you have an unfinished interview session. Would you like to continue where you left off or start a new interview?
      </Paragraph>
      <Paragraph type="secondary">
        Note: Starting a new interview will discard your previous progress.
      </Paragraph>
    </Modal>
  );
};

export default WelcomeBackModal;