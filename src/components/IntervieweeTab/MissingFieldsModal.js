import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { setCandidateInfo } from '../../store/interviewSlice';

const MissingFieldsModal = ({ visible, onComplete, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [visible, initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      dispatch(setCandidateInfo(values));
      onComplete(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onComplete(initialData);
  };

  return (
    <Modal
      title="Complete Your Profile"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleOk}
        >
          Start Interview
        </Button>,
      ]}
    >
      <p>Please provide the following information before starting the interview:</p>
      <Form
        form={form}
        layout="vertical"
        name="userForm"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please input your full name!' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input placeholder="john@example.com" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please input your phone number!' },
            { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number!' }
          ]}
        >
          <Input placeholder="+1 (555) 123-4567" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MissingFieldsModal;