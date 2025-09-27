import React, { useState } from 'react';
import { Table, Tag, Card, Input, Button, Space } from 'antd';
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CandidateList = () => {
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('score');
  const [sortOrder, setSortOrder] = useState('descend');
  const navigate = useNavigate();
  
  const candidates = useSelector(state => state.candidates.list);

  const handleViewDetails = (candidateId) => {
    navigate(`/candidate/${candidateId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'processing';
    return 'error';
  };

  const getScoreTag = (score) => {
    let color = getScoreColor(score);
    return <Tag color={color}>{score.toFixed(1)}/10</Tag>;
  };

  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'score') {
        return sortOrder === 'ascend' ? a.score - b.score : b.score - a.score;
      } else if (sortField === 'name') {
        return sortOrder === 'ascend' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'date') {
        return sortOrder === 'ascend' 
          ? new Date(a.interviewDate) - new Date(b.interviewDate)
          : new Date(b.interviewDate) - new Date(a.interviewDate);
      }
      return 0;
    });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortOrder: sortField === 'name' ? sortOrder : null,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: score => getScoreTag(score),
      sorter: true,
      sortOrder: sortField === 'score' ? sortOrder : null,
    },
    {
      title: 'Interview Date',
      dataIndex: 'interviewDate',
      key: 'interviewDate',
      render: date => new Date(date).toLocaleDateString(),
      sorter: true,
      sortOrder: sortField === 'date' ? sortOrder : null,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleViewDetails(record.id)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortField(sorter.field);
    setSortOrder(sorter.order);
  };

  const handleSortChange = (field) => {
    // If clicking the same field, toggle order
    if (field === sortField) {
      setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
    } else {
      setSortField(field);
      setSortOrder('descend'); // Default to descending for new field
    }
  };

  return (
    <div className="candidate-list-container">
      <Card title="Candidate Dashboard">
        <Space style={{ marginBottom: 16, width: '100%' }}>
          <Input
            placeholder="Search candidates..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          
          <span>Sort by:</span>
          
          <Button
            type={sortField === 'score' ? 'primary' : 'default'}
            icon={sortField === 'score' && sortOrder === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
            onClick={() => handleSortChange('score')}
          >
            Score
          </Button>
          
          <Button
            type={sortField === 'name' ? 'primary' : 'default'}
            icon={sortField === 'name' && sortOrder === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
            onClick={() => handleSortChange('name')}
          >
            Name
          </Button>
          
          <Button
            type={sortField === 'date' ? 'primary' : 'default'}
            icon={sortField === 'date' && sortOrder === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
            onClick={() => handleSortChange('date')}
          >
            Date
          </Button>
        </Space>
        
        <Table
          columns={columns}
          dataSource={filteredCandidates}
          rowKey="id"
          onChange={handleTableChange}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default CandidateList;