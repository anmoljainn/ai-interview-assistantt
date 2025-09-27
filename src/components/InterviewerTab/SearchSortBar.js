import React from 'react';
import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

const { Option } = Select;

const SearchSortBar = ({ 
  searchText, 
  onSearchChange, 
  sortField, 
  sortOrder, 
  onSortChange 
}) => {
  const handleSortChange = (field) => {
    // If clicking the same field, toggle order
    if (field === sortField) {
      onSortChange(field, sortOrder === 'ascend' ? 'descend' : 'ascend');
    } else {
      onSortChange(field, 'descend'); // Default to descending for new field
    }
  };

  return (
    <div className="search-sort-bar">
      <Space style={{ marginBottom: 16, width: '100%' }}>
        <Input
          placeholder="Search candidates..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
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
    </div>
  );
};

export default SearchSortBar;