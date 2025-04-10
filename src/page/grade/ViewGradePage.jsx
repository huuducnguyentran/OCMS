import React, { useState, useEffect } from 'react';
import { Table, message, Typography, Button, Space, Tag, Input } from 'antd';
import { ReloadOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { gradeServices } from '../../services/gradeServices';

const { Title } = Typography;
const { Search } = Input;

const ViewGradePage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredGrades, setFilteredGrades] = useState([]);

  const columns = [
    {
      title: 'Grade ID',
      dataIndex: 'gradeId',
      key: 'gradeId',
      width: 120,
    },
    {
      title: 'Trainee ID',
      dataIndex: 'traineeAssignID',
      key: 'traineeAssignID',
      width: 120,
    },
    {
      title: 'Subject',
      dataIndex: 'subjectId',
      key: 'subjectId',
      width: 120,
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return record.subjectId.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: 'Progress Scores',
      children: [
        {
          title: 'Participation',
          dataIndex: 'participantScore',
          key: 'participantScore',
          width: 110,
          render: score => (
            <Tag color={score >= 5 ? 'success' : 'error'} className="w-16 text-center">
              {score}
            </Tag>
          ),
        },
        {
          title: 'Assignment',
          dataIndex: 'assignmentScore',
          key: 'assignmentScore',
          width: 110,
          render: score => (
            <Tag color={score >= 5 ? 'success' : 'error'} className="w-16 text-center">
              {score}
            </Tag>
          ),
        },
      ],
    },
    {
      title: 'Exam Scores',
      children: [
        {
          title: 'Final',
          dataIndex: 'finalExamScore',
          key: 'finalExamScore',
          width: 100,
          render: score => (
            <Tag color={score >= 5 ? 'success' : 'error'} className="w-16 text-center">
              {score}
            </Tag>
          ),
        },
        {
          title: 'Resit',
          dataIndex: 'finalResitScore',
          key: 'finalResitScore',
          width: 100,
          render: score => (
            <Tag color={score === 0 ? 'default' : score >= 5 ? 'success' : 'error'} className="w-16 text-center">
              {score || '-'}
            </Tag>
          ),
        },
      ],
    },
    {
      title: 'Total',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      render: score => (
        <Tag color={score >= 5 ? 'success' : 'error'} className="w-16 text-center font-semibold">
          {score}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'gradeStatus',
      key: 'gradeStatus',
      width: 120,
      render: status => (
        <Tag color={status === 'Pass' ? 'success' : 'error'} className="px-4 py-1">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Graded By',
      dataIndex: 'gradedByInstructorId',
      key: 'gradedByInstructorId',
      width: 120,
    },
    {
      title: 'Evaluation Date',
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
      width: 180,
      render: date => {
        if (!date) return '';
        return new Date(date).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      },
    }
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredGrades(grades);
    } else {
      const filtered = grades.filter(grade => 
        grade.subjectId.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredGrades(filtered);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await gradeServices.getAllGrades();
      
      if (response && Array.isArray(response)) {
        const formattedGrades = response.map(grade => ({
          ...grade,
          key: grade.gradeId,
        }));
        setGrades(formattedGrades);
        setFilteredGrades(formattedGrades);
        setSearchText(''); // Reset search when refreshing data
      } else {
        message.error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      message.error('Unable to load grades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <Title level={2} className="!mb-0 flex items-center gap-2">
              <FileExcelOutlined className="text-green-600" />
              Grade List
            </Title>
            <Space size="large">
              <Search
                placeholder="Search by Subject ID"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 300 }}
                className="rounded-lg"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchGrades}
                loading={loading}
                type="primary"
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Search Results Summary */}
          {searchText && (
            <div className="mb-4">
              <Tag color="blue" className="text-sm px-3 py-1">
                Found {filteredGrades.length} results for "{searchText}"
              </Tag>
            </div>
          )}

          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredGrades}
            pagination={{
              total: filteredGrades.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} records`,
            }}
            className="shadow-sm"
            scroll={{ x: 1500 }}
            bordered
            size="middle"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewGradePage;
