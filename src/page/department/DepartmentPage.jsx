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
  Badge,
  Popconfirm,
  Row,
  Col,
  Dropdown,
  Menu,
  Input,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined,
  EllipsisOutlined,
  SearchOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllDepartments, deleteDepartment, activateDepartment } from '../../services/departmentServices';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Định nghĩa tableStyles
const tableStyles = {
  header: {
    backgroundColor: '#f0f7ff',
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '16px 12px',
    textTransform: 'uppercase',
    color: '#1890ff'
  },
  cell: {
    fontSize: '15px',
    padding: '16px 12px'
  }
};

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem('role') === 'Admin';
  
  // Console log để kiểm tra giá trị isAdmin
  console.log("Is Admin:", isAdmin);
  console.log("Role from session:", sessionStorage.getItem('role'));

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

  const handleStatusChange = async (id, currentStatus) => {
    console.log('Handling status change for department:', id);
    console.log('Current status:', currentStatus);

    try {
      setLoading(true);
      
      if (currentStatus === 1) { // Nếu đang inactive -> active
        console.log('Activating department...');
        const response = await activateDepartment(id);
        if (response) {
          message.success('Department activated successfully');
        }
      } else { // Nếu đang active -> delete
        const confirmDelete = window.confirm(
          'Deactivating this department will delete it permanently. Are you sure?'
        );
        if (confirmDelete) {
          await deleteDepartment(id);
          message.success('Department deleted successfully');
        } else {
          setLoading(false);
          return;
        }
      }
      
      await fetchDepartments();
    } catch (error) {
      console.error('Error handling status change:', error);
      message.error(
        currentStatus === 1 
          ? 'Failed to activate department' 
          : 'Failed to delete department'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filtering function
  const getFilteredData = () => {
    if (!searchText) return departments;
    
    return departments.filter(item => 
      Object.values(item).some(val => 
        val && val.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };
  
  const columns = [
    {
      title: 'Department ID',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (text) => (
        <Text copyable style={{ fontSize: '16px', fontWeight: '500' }}>
          {text}
        </Text>
      ),
      width: '15%',
    },
    {
      title: 'Department Name',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text) => (
        <Text strong style={{ fontSize: '16px' }}>
          {text}
        </Text>
      ),
      width: '20%',
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
          <div style={{ 
            fontSize: '16px', 
            maxWidth: '300px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {text}
          </div>
        </Tooltip>
      ),
      width: '25%',
    },
    {
      title: 'Specialty',
      dataIndex: 'specialtyId',
      key: 'specialtyId',
      render: (text) => (
        <Tag color="blue" style={{ 
          fontSize: '15px', 
          padding: '4px 12px',
          borderRadius: '4px'
        }}>
          {text}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: 'Manager',
      dataIndex: 'managerUserId',
      key: 'managerUserId',
      render: (text) => (
        <Space size="middle">
          <UserOutlined style={{ fontSize: '18px' }} />
          <Text style={{ fontSize: '16px' }}>{text}</Text>
        </Space>
      ),
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tooltip title={
            status === 0 
              ? "Switch off to delete department" 
              : "Switch on to activate department"
          }>
            <Switch
              checked={status === 0}
              onChange={() => handleStatusChange(record.departmentId, status)}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              style={{
                backgroundColor: status === 0 ? '#52c41a' : '#ff4d4f',
                width: '90px',
                height: '28px'
              }}
              disabled={!isAdmin}
            />
          </Tooltip>
          {status === 0 ? (
            <Tag color="success" style={{ margin: 0, fontSize: '14px' }}>
              Active
            </Tag>
          ) : (
            <Tag color="error" style={{ margin: 0, fontSize: '14px' }}>
              Inactive
            </Tag>
          )}
        </div>
      ),
      width: '15%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <Tooltip title={dayjs(text).format('YYYY-MM-DD HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined style={{ fontSize: '16px' }} />
            <span style={{ fontSize: '15px' }}>{dayjs(text).format('YYYY-MM-DD')}</span>
          </Space>
        </Tooltip>
      ),
      width: '10%',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: '10%',
      render: (_, record) => {
        const menu = (
          <Menu style={{ padding: '8px 0' }}>
            {isAdmin && (
              <Menu.Item 
                key="edit" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/department/edit/${record.departmentId}`)}
                style={{ padding: '10px 16px', fontSize: '15px' }}
              >
                Edit Department
              </Menu.Item>
            )}
            <Menu.Item 
              key="assign" 
              icon={<UserSwitchOutlined />}
              onClick={() => navigate(`/department/assign/${record.departmentId}`)}
              style={{ padding: '10px 16px', fontSize: '15px' }}
            >
              Assign User
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown  
            overlay={menu} 
            trigger={['click']} 
            placement="bottomRight"
          >
            <Button 
              icon={<EllipsisOutlined />} 
              className="border-none shadow-none" 
              style={{ fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Row justify="center">
        <Col xs={24} xl={22} xxl={20}>
          <Card 
            className="shadow-xl rounded-lg" 
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <Title level={2} className="mb-2 flex items-center text-blue-700" style={{ fontSize: '28px' }}>
                  <TeamOutlined className="mr-3" style={{ fontSize: '28px' }}/>
                  Departments Management
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Manage all departments and their information
                </Text>
              </div>
              
              <Space size="large">
                <Input
                  placeholder="Search departments..."
                  prefix={<SearchOutlined style={{ color: '#1890ff' }}/>}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300, height: '42px', fontSize: '15px' }}
                  allowClear
                />
                
                {isAdmin && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/department/create')}
                    className="bg-blue-500 hover:bg-blue-600 shadow-md"
                    size="large"
                    style={{ height: '42px', fontSize: '15px', padding: '0 24px' }}
                  >
                    Add Department
                  </Button>
                )}
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={getFilteredData()}
              loading={loading}
              rowKey="departmentId"
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} departments`,
                position: ['bottomCenter'],
                style: { marginTop: '24px' }
              }}
              className="shadow-sm"
              scroll={{ x: 1200 }}
              bordered
              rowClassName={() => 'hover:bg-blue-50'}
              size="large"
              style={{
                fontSize: '16px',
                '--table-header-bg': '#f0f7ff',
                '--table-header-color': '#1890ff',
                '--table-row-hover-bg': '#e6f4ff',
              }}
              onRow={(record) => ({
                style: { 
                  height: '72px',  // Increased row height
                  cursor: 'pointer'
                }
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DepartmentPage;
