import React, { useState } from 'react';
import { Upload, message, Spin, Alert, Progress } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { parseResume } from '../../services/resumeParser';
import { useDispatch } from 'react-redux';
import { setCandidateInfo } from '../../store/interviewSlice';
import { validateFile, sanitizeInput } from '../../utils/security';
import soundEffects from '../../utils/soundEffects';

const { Dragger } = Upload;

const ResumeUpload = ({ onComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    // Validate file before processing
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      if (soundEffects.isEnabled()) {
        soundEffects.play('error');
      }
      return false;
    }
    
    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const result = await parseResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Sanitize the parsed data
      const sanitizedResult = {
        name: result.name ? sanitizeInput(result.name.trim()) : '',
        email: result.email ? sanitizeInput(result.email.trim().toLowerCase()) : '',
        phone: result.phone ? sanitizeInput(result.phone.trim()) : '',
      };
      
      dispatch(setCandidateInfo(sanitizedResult));
      onComplete(sanitizedResult);
      message.success('Resume uploaded successfully!');
      
      if (soundEffects.isEnabled()) {
        soundEffects.play('complete');
      }
    } catch (error) {
      setUploadError('Failed to parse resume. Please try again.');
      if (soundEffects.isEnabled()) {
        soundEffects.play('error');
      }
      console.error('Resume parsing error:', error);
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.doc,.docx',
    beforeUpload: handleUpload,
    showUploadList: false,
    disabled: uploading,
  };

  return (
    <div className="resume-upload-container">
      <h2>Upload Your Resume</h2>
      <p>Please upload your resume in PDF or DOCX format to begin the interview process.</p>
      
      <div className="upload-requirements">
        <Alert
          message="File Requirements"
          description="PDF or DOCX format only. Maximum file size: 5MB."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </div>
      
      {uploadError && (
        <Alert
          message="Upload Error"
          description={uploadError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setUploadError(null)}
        />
      )}
      
      {uploading ? (
        <div className="upload-loading">
          <Spin size="large" />
          <div className="upload-progress">
            <Progress percent={uploadProgress} status="active" />
            <p>We're extracting your information. This may take a moment.</p>
          </div>
        </div>
      ) : (
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for PDF or DOCX files only. Maximum size 5MB.
          </p>
          <div className="upload-icon-container">
            <FileTextOutlined className="upload-icon" />
          </div>
        </Dragger>
      )}
    </div>
  );
};

export default ResumeUpload;