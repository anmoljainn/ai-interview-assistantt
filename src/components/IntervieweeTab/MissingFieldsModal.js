import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Alert, Row, Col } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setCandidateInfo } from '../../store/interviewSlice';
import { isValidEmail, isValidPhone, sanitizeInput } from '../../utils/security';
import soundEffects from '../../utils/soundEffects';

const { Option } = Select;

const MissingFieldsModal = ({ visible, onComplete, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [visible, initialData, form]);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return 'Please enter your full name (at least 2 characters)';
        }
        return null;
      case 'email':
        if (!value) return 'Please enter your email address';
        if (!isValidEmail(value)) return 'Please enter a valid email address';
        return null;
      case 'phone':
        if (!value) return 'Please enter your phone number';
        if (!isValidPhone(value)) return 'Please enter a valid phone number';
        return null;
      case 'experience':
        if (!value) return 'Please select your experience level';
        return null;
      case 'jobRole':
        if (!value) return 'Please select the job role you\'re applying for';
        return null;
      case 'location':
        if (!value) return 'Please enter your location';
        return null;
      case 'portfolio':
        if (value && !isValidUrl(value)) return 'Please enter a valid URL';
        return null;
      default:
        return null;
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFieldChange = (field, value) => {
    const error = validateField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Sanitize all inputs
      const sanitizedValues = {
        name: sanitizeInput(values.name),
        email: sanitizeInput(values.email),
        phone: sanitizeInput(values.phone),
        experience: values.experience,
        jobRole: values.jobRole,
        location: sanitizeInput(values.location),
        portfolio: values.portfolio ? sanitizeInput(values.portfolio) : '',
        skills: values.skills || [],
      };
      
      dispatch(setCandidateInfo(sanitizedValues));
      onComplete(sanitizedValues);
      form.resetFields();
      setFormErrors({});
      
      if (soundEffects.isEnabled()) {
        soundEffects.play('click');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      if (soundEffects.isEnabled()) {
        soundEffects.play('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormErrors({});
    onComplete(initialData);
    
    if (soundEffects.isEnabled()) {
      soundEffects.play('click');
    }
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
      width={700}
    >
      <p>Please provide the following information before starting the interview:</p>
      
      {Object.values(formErrors).some(error => error) && (
        <Alert
          message="Please fix the errors below"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        name="userForm"
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please input your full name!' }]}
              help={formErrors.name}
              validateStatus={formErrors.name ? 'error' : ''}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="John Doe" 
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
              help={formErrors.email}
              validateStatus={formErrors.email ? 'error' : ''}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="john@example.com"
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please input your phone number!' },
                { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number!' }
              ]}
              help={formErrors.phone}
              validateStatus={formErrors.phone ? 'error' : ''}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="+1 (555) 123-4567"
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please input your location!' }]}
              help={formErrors.location}
              validateStatus={formErrors.location ? 'error' : ''}
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="City, Country"
                onChange={(e) => handleFieldChange('location', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="experience"
              label="Experience Level"
              rules={[{ required: true, message: 'Please select your experience level!' }]}
              help={formErrors.experience}
              validateStatus={formErrors.experience ? 'error' : ''}
            >
              <Select 
                placeholder="Select your experience level"
                onChange={(value) => handleFieldChange('experience', value)}
              >
                <Option value="entry">Entry Level (0-2 years)</Option>
                <Option value="mid">Mid Level (3-5 years)</Option>
                <Option value="senior">Senior Level (6-10 years)</Option>
                <Option value="lead">Lead/Principal (10+ years)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="jobRole"
              label="Job Role"
              rules={[{ required: true, message: 'Please select the job role!' }]}
              help={formErrors.jobRole}
              validateStatus={formErrors.jobRole ? 'error' : ''}
            >
              <Select 
                placeholder="Select the job role you're applying for"
                onChange={(value) => handleFieldChange('jobRole', value)}
              >
                <Option value="frontend">Frontend Developer</Option>
                <Option value="backend">Backend Developer</Option>
                <Option value="fullstack">Full Stack Developer</Option>
                <Option value="devops">DevOps Engineer</Option>
                <Option value="mobile">Mobile Developer</Option>
                <Option value="qa">QA Engineer</Option>
                <Option value="uiux">UI/UX Designer</Option>
                <Option value="datascience">Data Scientist</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="portfolio"
          label="Portfolio/GitHub URL (Optional)"
          help={formErrors.portfolio}
          validateStatus={formErrors.portfolio ? 'error' : ''}
        >
          <Input 
            prefix={<LinkOutlined />} 
            placeholder="https://github.com/username"
            onChange={(e) => handleFieldChange('portfolio', e.target.value)}
          />
        </Form.Item>
        
        <Form.Item
          name="skills"
          label="Technical Skills (Optional)"
        >
          <Select 
            mode="tags"
            placeholder="Select or type your skills"
            style={{ width: '100%' }}
          >
            <Option value="JavaScript">JavaScript</Option>
            <Option value="React">React</Option>
            <Option value="Node.js">Node.js</Option>
            <Option value="Python">Python</Option>
            <Option value="Java">Java</Option>
            <Option value="C#">C#</Option>
            <Option value="HTML/CSS">HTML/CSS</Option>
            <Option value="SQL">SQL</Option>
            <Option value="MongoDB">MongoDB</Option>
            <Option value="AWS">AWS</Option>
            <Option value="Docker">Docker</Option>
            <Option value="Kubernetes">Kubernetes</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MissingFieldsModal;