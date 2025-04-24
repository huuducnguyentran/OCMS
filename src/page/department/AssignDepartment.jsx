import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  message,
  Typography,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Alert,
  Popconfirm
} from 'antd';
import {
  UserSwitchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { assignToDepartment, getDepartmentById, removeFromDepartment, getAllUsers } from '../../services/departmentServices';

const { Title, Text } = Typography;
const { Option } = Select;

const AssignDepartment = () => {
  const [form] = Form.useForm();
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch department and users data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptData, usersData] = await Promise.all([
          getDepartmentById(departmentId),
          getAllUsers()
        ]);
        setDepartment(deptData);
        
        // Lấy tất cả users có cùng specialtyId
        const filteredUsers = usersData.filter(user => 
          user.specialtyId === deptData.specialtyId
        );
        setUsers(filteredUsers);
        console.log('Department:', deptData);
        console.log('Filtered Users:', filteredUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [departmentId]);

  const handleUserSelect = (userId) => {
    console.log('Selected User ID:', userId);
    const user = users.find(u => u.userId === userId);
    console.log('Found User:', user);
    setSelectedUser(user);
  };

  const handleSubmit = async (values) => {
    console.log('Submit Values:', values);
    console.log('Selected User:', selectedUser);
    
    if (!selectedUser) {
      message.warning('Please select a user');
      return;
    }

    if (selectedUser.specialtyId !== department.specialtyId) {
      message.error('User specialty does not match department specialty');
      return;
    }

    try {
      setLoading(true);
      await assignToDepartment(departmentId, values.userId);
      message.success('User assigned successfully');
      navigate('/department');
    } catch (error) {
      console.error('Error assigning user:', error);
      message.error('Failed to assign user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      setLoading(true);
      await removeFromDepartment(userId);
      message.success('User removed from department successfully');
      // Refresh data
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers()
      ]);
      setDepartment(deptData);
      const filteredUsers = usersData.filter(user => 
        user.specialtyId === deptData.specialtyId && !user.departmentId
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error removing user:', error);
      message.error('Failed to remove user from department');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: '15%',
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '20%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
    },
    {
      title: 'Specialty',
      dataIndex: 'specialtyId',
      key: 'specialtyId',
      width: '20%',
      render: (specialtyId) => (
        <Tag color={specialtyId === department?.specialtyId ? 'green' : 'red'}>
          {specialtyId}
          {specialtyId === department?.specialtyId && (
            <CheckCircleOutlined style={{ marginLeft: 8 }} />
          )}
        </Tag>
      ),
    },
    {
      title: 'Department Status',
      key: 'departmentStatus',
      width: '15%',
      render: (_, record) => (
        <Tag color={record.departmentId ? 'blue' : 'default'}>
          {record.departmentId ? 'Assigned' : 'Not Assigned'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space>
          {!record.departmentId ? (
            <Button
              type="primary"
              onClick={() => {
                form.setFieldsValue({ userId: record.userId });
                handleUserSelect(record.userId);
              }}
              size="middle"
            >
              Assign
            </Button>
          ) : (
            <Popconfirm
              title="Remove from Department"
              description="Are you sure you want to remove this user from the department?"
              onConfirm={() => handleRemoveUser(record.userId)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button 
                danger
                icon={<DeleteOutlined />}
                size="middle"
              >
                Remove
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Row justify="center">
        <Col xs={24} xl={20}>
          <Card className="shadow-xl rounded-lg">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <Space align="start">
                  <Title level={2} className="mb-0 flex items-center">
                    <UserSwitchOutlined className="mr-3" />
                    Assign User to Department
                  </Title>
                  {department && (
                    <Tag color="blue" style={{ fontSize: '16px', padding: '4px 12px' }}>
                      <TeamOutlined className="mr-2" />
                      {department.departmentName}
                    </Tag>
                  )}
                </Space>
                <Button type="link" onClick={() => navigate('/department')}>
                  Back to Departments
                </Button>
              </div>

              {/* Department Info */}
              {department && (
                <Alert
                  message="Department Information"
                  description={
                    <Space direction="vertical">
                      <Text>Department ID: <strong>{department.departmentId}</strong></Text>
                      <Text>Specialty ID: <strong>{department.specialtyId}</strong></Text>
                      <Text type="secondary">Only users with matching specialty can be assigned</Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                />
              )}

              {/* User Selection Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
              >
                <Form.Item
                  name="userId"
                  label="Select User"
                  rules={[{ required: true, message: 'Please select a user' }]}
                >
                  <Select
                    placeholder="Select a user to assign"
                    onChange={handleUserSelect}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users.map(user => (
                      <Option 
                        key={user.userId}
                        value={user.userId}
                      >
                        {user.fullName} - {user.email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!selectedUser}
                    size="large"
                    style={{ 
                      backgroundColor: '#1890ff',
                      width: '200px',
                      height: '40px'
                    }}
                  >
                    Assign User
                  </Button>
                </Form.Item>
              </Form>

              {/* Users Table */}
              <div className="mt-4">
                <Title level={4}>Available Users</Title>
                <Table
                  columns={columns}
                  dataSource={users}
                  rowKey="userId"
                  loading={loading}
                  pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Total ${total} users`,
                  }}
                  className="shadow-sm"
                  scroll={{ x: 1000 }}
                  rowClassName={(record) => 
                    record.departmentId ? 'bg-gray-50' : ''
                  }
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssignDepartment;
