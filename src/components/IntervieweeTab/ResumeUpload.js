import React, { useState } from 'react';
import { Upload, message, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { parseResume } from '../../services/resumeParser';
import { useDispatch } from 'react-redux';
import { setCandidateInfo } from '../../store/interviewSlice';

const { Dragger } = Upload;

const ResumeUpload = ({ onComplete }) => {
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await parseResume(file);
      dispatch(setCandidateInfo(result));
      onComplete(result);
      message.success('Resume uploaded successfully!');
    } catch (error) {
      message.error('Failed to parse resume. Please try again.');
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
  };

  return (
    <div className="resume-upload-container">
      <h2>Upload Your Resume</h2>
      <p>Please upload your resume in PDF or DOCX format to begin the interview process.</p>
      
      {uploading ? (
        <div className="upload-loading">
          <Spin size="large" />
          <p>Parsing your resume...</p>
        </div>
      ) : (
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for PDF or DOCX files only.
          </p>
        </Dragger>
      )}
    </div>
  );
};

export default ResumeUpload;