import React, { useState, useEffect } from 'react';
import { Table, message, Typography, Button, Space, Tag, Input, Popconfirm, Dropdown, Select } from 'antd';
import { ReloadOutlined, FileExcelOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined, FilterOutlined } from '@ant-design/icons';
import { gradeServices } from '../../services/gradeServices';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

const ViewGradePage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjectList, setSubjectList] = useState([]);
  const navigate = useNavigate();

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
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            label: 'Edit Grade',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record)
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Delete Grade"
                description="Are you sure to delete this grade?"
                onConfirm={() => handleDelete(record)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
              >
                <div className="flex items-center text-red-500">
                  {/* <DeleteOutlined className="mr-2" /> */}
                  Delete Grade
                </div>
              </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true
          }
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="custom-dropdown"
          >
            <Button
              icon={<MoreOutlined />}
              className="border-none shadow-none hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    }
  ];

  const getUniqueSubjects = (gradeData) => {
    const subjects = [...new Set(gradeData.map(grade => grade.subjectId))];
    return subjects.map(subject => ({
      value: subject,
      label: subject
    }));
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
        setSearchText('');
        setSubjectList(getUniqueSubjects(formattedGrades));
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

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    filterGrades(searchText, value);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    filterGrades(value, selectedSubject);
  };

  const filterGrades = (search, subject) => {
    let filtered = [...grades];
    
    if (search) {
      filtered = filtered.filter(grade => 
        grade.subjectId.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (subject && subject !== 'all') {
      filtered = filtered.filter(grade => grade.subjectId === subject);
    }
    
    setFilteredGrades(filtered);
  };

  const handleEdit = (record) => {
    navigate(`/grade-update/${record.gradeId}`, {
      state: {
        gradeData: {
          gradeId: record.gradeId,
          traineeAssignID: record.traineeAssignID,
          subjectId: record.subjectId,
          participantScore: record.participantScore,
          assignmentScore: record.assignmentScore,
          finalExamScore: record.finalExamScore,
          finalResultScore: record.finalResitScore || 0,
          remarks: record.remarks || ''
        }
      }
    });
  };

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      if (!record || !record.gradeId) {
        throw new Error('Grade ID is required');
      }
      await gradeServices.deleteGrade(record.gradeId);
      message.success('Grade deleted successfully');
      await fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
      message.error(error.response?.data?.message || 'Failed to delete grade');
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
              <Select
                placeholder="Filter by Subject"
                onChange={handleSubjectChange}
                value={selectedSubject}
                style={{ width: 200 }}
                options={[
                  { value: 'all', label: 'All Subjects' },
                  ...subjectList
                ]}
                suffixIcon={<FilterOutlined />}
                className="rounded-lg"
              />
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

          <div className="mb-4 flex items-center gap-2">
            {searchText && (
              <Tag color="blue" className="text-sm px-3 py-1">
                Search: "{searchText}"
              </Tag>
            )}
            {selectedSubject !== 'all' && (
              <Tag color="green" className="text-sm px-3 py-1">
                Subject: {selectedSubject}
              </Tag>
            )}
            {(searchText || selectedSubject !== 'all') && (
              <Tag color="blue" className="text-sm px-3 py-1">
                Found {filteredGrades.length} results
              </Tag>
            )}
          </div>

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

const styles = `
.custom-dropdown .ant-dropdown-menu {
  padding: 4px;
  min-width: 160px;
}

.custom-dropdown .ant-dropdown-menu-item {
  padding: 8px 12px;
  border-radius: 4px;
}

.custom-dropdown .ant-dropdown-menu-item:hover {
  background-color: #f5f5f5;
}

.custom-dropdown .ant-dropdown-menu-item-danger:hover {
  background-color: #fff1f0;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ViewGradePage;
