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
  Popconfirm,
  Checkbox
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
  const [searchValue, setSearchValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersToRemove, setSelectedUsersToRemove] = useState([]);

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
      
      // Thay đổi từ navigate('/department') thành load lại data
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers()
      ]);
      setDepartment(deptData);
      const filteredUsers = usersData.filter(user => 
        user.specialtyId === deptData.specialtyId
      );
      setUsers(filteredUsers);
      
      // Reset form và selected user
      form.resetFields();
      setSelectedUser(null);
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
      
      // Load lại data thay vì navigate
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers()
      ]);
      setDepartment(deptData);
      const filteredUsers = usersData.filter(user => 
        user.specialtyId === deptData.specialtyId
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error removing user:', error);
      message.error('Failed to remove user from department');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleAssign = async () => {
    try {
      setLoading(true);
      // Thực hiện assign lần lượt cho từng user
      await Promise.all(
        selectedUsers.map(userId => assignToDepartment(departmentId, userId))
      );
      message.success('Users assigned successfully');
      
      // Load lại data
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers()
      ]);
      setDepartment(deptData);
      const filteredUsers = usersData.filter(user => 
        user.specialtyId === deptData.specialtyId
      );
      setUsers(filteredUsers);
      setSelectedUsers([]); // Reset selection
    } catch (error) {
      console.error('Error assigning users:', error);
      message.error('Failed to assign users');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleRemove = async () => {
    try {
      setLoading(true);
      await Promise.all(
        selectedUsersToRemove.map(userId => removeFromDepartment(userId))
      );
      message.success('Users removed successfully');
      
      // Load lại data
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers()
      ]);
      setDepartment(deptData);
      const filteredUsers = usersData.filter(user => 
        user.specialtyId === deptData.specialtyId
      );
      setUsers(filteredUsers);
      setSelectedUsersToRemove([]); // Reset selection
    } catch (error) {
      console.error('Error removing users:', error);
      message.error('Failed to remove users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllChange = (type, checked) => {
    if (type === 'assign') {
      const availableUsers = users.filter(user => !user.departmentId).map(user => user.userId);
      setSelectedUsers(checked ? availableUsers : []);
    } else {
      const assignedUsers = users.filter(user => user.departmentId).map(user => user.userId);
      setSelectedUsersToRemove(checked ? assignedUsers : []);
    }
  };

  const columns = [
    {
      title: () => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            checked={
              users.length > 0 && 
              users.every(u => 
                !u.departmentId ? selectedUsers.includes(u.userId) : selectedUsersToRemove.includes(u.userId)
              )
            }
            indeterminate={
              (selectedUsers.length > 0 || selectedUsersToRemove.length > 0) &&
              !users.every(u => 
                !u.departmentId ? selectedUsers.includes(u.userId) : selectedUsersToRemove.includes(u.userId)
              )
            }
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                // Select tất cả
                const availableUsers = users.filter(u => !u.departmentId).map(u => u.userId);
                const assignedUsers = users.filter(u => u.departmentId).map(u => u.userId);
                setSelectedUsers(availableUsers);
                setSelectedUsersToRemove(assignedUsers);
              } else {
                // Bỏ chọn tất cả
                setSelectedUsers([]);
                setSelectedUsersToRemove([]);
              }
            }}
          />
          <span style={{ marginLeft: '8px' }}>Select</span>
        </div>
      ),
      key: 'select',
      width: '5%',
      render: (_, record) => (
        <Checkbox
          checked={record.departmentId ? 
            selectedUsersToRemove.includes(record.userId) : 
            selectedUsers.includes(record.userId)
          }
          onChange={(e) => {
            if (record.departmentId) {
              // Xử lý cho remove
              if (e.target.checked) {
                setSelectedUsersToRemove(prev => [...prev, record.userId]);
              } else {
                setSelectedUsersToRemove(prev => prev.filter(id => id !== record.userId));
              }
            } else {
              // Xử lý cho assign
              if (e.target.checked) {
                setSelectedUsers(prev => [...prev, record.userId]);
              } else {
                setSelectedUsers(prev => prev.filter(id => id !== record.userId));
              }
            }
          }}
        />
      )
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: '12%',
      sorter: (a, b) => a.userId.localeCompare(b.userId),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '18%',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '22%',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Specialty',
      dataIndex: 'specialtyId',
      key: 'specialtyId',
      width: '18%',
      sorter: (a, b) => a.specialtyId.localeCompare(b.specialtyId),
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
      title: 'Status',
      key: 'departmentStatus',
      width: '12%',
      sorter: (a, b) => (a.departmentId ? 1 : 0) - (b.departmentId ? 1 : 0),
      render: (_, record) => (
        <Tag color={record.departmentId ? 'blue' : 'orange'}>
          {record.departmentId ? 'Assigned' : 'Available'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '13%',
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
              icon={<UserSwitchOutlined />}
            >
              Assign
            </Button>
          ) : (
            <Popconfirm
              title="Remove from Department"
              description="Are you sure you want to remove this user?"
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
                    showSearch
                    allowClear
                    filterOption={(input, option) => {
                        const childrenText = option?.children?.toString().toLowerCase() || '';
                        const searchText = input.toLowerCase();
                        return childrenText.includes(searchText);
                    }}
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
                <div className="flex justify-between items-center mb-4">
                  <Title level={4}>Available Users</Title>
                  <Space>
                    {selectedUsersToRemove.length > 0 && (
                      <Button
                        danger
                        type="primary"
                        onClick={handleMultipleRemove}
                        loading={loading}
                        icon={<DeleteOutlined />}
                      >
                        Remove Selected ({selectedUsersToRemove.length})
                      </Button>
                    )}
                    {selectedUsers.length > 0 && (
                      <Button
                        type="primary"
                        onClick={handleMultipleAssign}
                        loading={loading}
                        icon={<UserSwitchOutlined />}
                        style={{ 
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a'
                        }}
                      >
                        Assign Selected ({selectedUsers.length})
                      </Button>
                    )}
                  </Space>
                </div>
                <Table
                  columns={columns}
                  dataSource={users}
                  rowKey="userId"
                  loading={loading}
                  pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Total ${total} users`,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                  }}
                  className="shadow-lg rounded-lg overflow-hidden"
                  scroll={{ x: 1200 }}
                  rowClassName={(record) => {
                    if (record.departmentId) {
                      return selectedUsersToRemove.includes(record.userId) ? 'bg-red-50' : 'bg-gray-50';
                    }
                    return selectedUsers.includes(record.userId) ? 'bg-blue-50' : '';
                  }}
                  onChange={(pagination, filters, sorter) => {
                    console.log('Table change:', { pagination, filters, sorter });
                  }}
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
