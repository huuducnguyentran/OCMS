import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Typography,
  Tag,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllDepartments } from '../../services/departmentServices';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem('role') === 'Admin';

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      message.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const columns = [
    {
      title: 'Department ID',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: 'Department Name',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'departmentDescription',
      key: 'departmentDescription',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Specialty',
      dataIndex: 'specialtyId',
      key: 'specialtyId',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Manager',
      dataIndex: 'managerUserId',
      key: 'managerUserId',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 0 ? 'success' : 'error'}
          text={status === 0 ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <Tooltip title={dayjs(text).format('YYYY-MM-DD HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined />
            {dayjs(text).format('YYYY-MM-DD')}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {isAdmin && (
            <Tooltip title="Edit Department">
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/department/edit/${record.departmentId}`)}
                className="text-blue-600 hover:text-blue-800"
              />
            </Tooltip>
          )}
          <Tooltip title="View Details">
            <Button
              type="primary"
              onClick={() => navigate(`/department/${record.departmentId}`)}
              className="bg-green-500 hover:bg-green-600"
            >
              View
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={2} className="mb-0 flex items-center">
                <TeamOutlined className="mr-2" />
                Departments Management
              </Title>
              <Text type="secondary">
                Manage all departments and their information
              </Text>
            </div>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/department/create')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Department
              </Button>
            )}
          </div>

          <Table
            columns={columns}
            dataSource={departments}
            loading={loading}
            rowKey="departmentId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} departments`,
            }}
            className="shadow-sm"
          />
        </Card>
      </div>
    </div>
  );
};

export default DepartmentPage;
