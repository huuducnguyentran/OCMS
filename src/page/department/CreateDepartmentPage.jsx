import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Select,
  Space
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createDepartment } from '../../services/departmentServices';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateDepartmentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isAdmin = sessionStorage.getItem('role') === 'Admin';

  useEffect(() => {
    if (!isAdmin) {
      message.error('You do not have permission to create departments');
      navigate('/department');
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Chuẩn bị dữ liệu để gửi đi
      const departmentData = {
        departmentName: values.departmentName,
        departmentDescription: values.departmentDescription,
        specialtyId: values.specialtyId,
        managerId: values.managerId
      };

      // Gọi API để tạo department
      await createDepartment(departmentData);
      message.success('Department created successfully');
      navigate('/department');
    } catch (error) {
      console.error('Error creating department:', error);
      message.error('Failed to create department: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <div className="mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/department')}
              className="mb-4"
            >
              Back to Departments
            </Button>
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-2xl text-blue-500" />
              <div>
                <Title level={2} className="mb-0">Create New Department</Title>
                <Text type="secondary">
                  Add a new department to the system
                </Text>
              </div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 0 // Set default status as Active
            }}
          >
            <Form.Item
              name="departmentName"
              label="Department Name"
              rules={[
                { required: true, message: 'Please enter department name' },
                { max: 100, message: 'Department name cannot exceed 100 characters' }
              ]}
            >
              <Input 
                placeholder="Enter department name"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="departmentDescription"
              label="Description"
              rules={[
                { max: 500, message: 'Description cannot exceed 500 characters' }
              ]}
            >
              <TextArea
                placeholder="Enter department description"
                rows={4}
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="specialtyId"
              label="Specialty ID"
              rules={[
                { required: true, message: 'Please enter specialty ID' }
              ]}
            >
              <Input 
                placeholder="Enter specialty ID"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="managerId"
              label="Manager ID"
              rules={[
                { required: true, message: 'Please enter manager ID' }
              ]}
            >
              <Input 
                placeholder="Enter manager ID"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[
                { required: true, message: 'Please select status' }
              ]}
            >
              <Select className="rounded-md">
                <Select.Option value={0}>Active</Select.Option>
                <Select.Option value={1}>Inactive</Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-4 mt-6">
              <Button 
                onClick={() => navigate('/department')}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                className="min-w-[100px] bg-blue-500 hover:bg-blue-600"
              >
                Create
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateDepartmentPage;
