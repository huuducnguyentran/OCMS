import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Typography, Select, Spin } from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createDepartment, getAllUsers } from "../../services/departmentServices";
import { specialtyService } from "../../services/specialtyServices";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateDepartmentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [managers, setManagers] = useState([]);
  const isAdmin = sessionStorage.getItem("role") === "Admin";

  useEffect(() => {
    if (!isAdmin) {
      message.error("You do not have permission to create departments");
      navigate("/department");
    } else {
      fetchSpecialties();
      fetchManagers();
    }
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await specialtyService.getAllSpecialties();
      if (response.success) {
        setSpecialties(response.data);
      } else {
        message.error("Failed to fetch specialties list");
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
      message.error("Failed to load specialties");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      console.log("Users response:", response);
      
      // Lọc users có roleName là "AOC Manager"
      let allUsers = [];
      
      if (Array.isArray(response)) {
        allUsers = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        allUsers = response.data;
      } else if (response && Array.isArray(response.users)) {
        allUsers = response.users;
      } else if (response && response.data && Array.isArray(response.data.users)) {
        allUsers = response.data.users;
      } else {
        console.error("Unexpected response format:", response);
        message.error("Failed to parse users data");
        return;
      }
      
      const aocManagers = allUsers.filter(user => 
        user && user.roleName && user.roleName === "AOC Manager"
      );
      
      setManagers(aocManagers);
    } catch (error) {
      console.error("Error fetching managers:", error);
      message.error("Failed to load available managers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      // Chuẩn bị dữ liệu để gửi đi
      const departmentData = {
        departmentName: values.departmentName,
        departmentDescription: values.departmentDescription,
        specialtyId: values.specialtyId,
        managerId: values.managerId,
        status: parseInt(values.status),
      };

      // Gọi API để tạo department
      await createDepartment(departmentData);
      message.success("Department created successfully");
      navigate("/department");
    } catch (error) {
      console.error("Error creating department:", error);
      message.error(
        "Failed to create department: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <div className="mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/department")}
              className="mb-4"
            >
              Back to Departments
            </Button>
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-2xl text-blue-500" />
              <div>
                <Title level={2} className="mb-0">
                  Create New Department
                </Title>
                <Text type="secondary">Add a new department to the system</Text>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                status: 0, // Set default status as Active
              }}
            >
              <Form.Item
                name="departmentName"
                label="Department Name"
                rules={[
                  { required: true, message: "Please enter department name" },
                  {
                    max: 100,
                    message: "Department name cannot exceed 100 characters",
                  },
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
                  {
                    max: 500,
                    message: "Description cannot exceed 500 characters",
                  },
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
                label="Specialty"
                rules={[{ required: true, message: "Please select a specialty" }]}
              >
                <Select 
                  placeholder="Select a specialty" 
                  className="rounded-md"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {specialties.map(specialty => (
                    <Option key={specialty.specialtyId} value={specialty.specialtyId}>
                      {specialty.specialtyName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="managerId"
                label="Department Manager"
                rules={[{ required: true, message: "Please select a manager" }]}
              >
                <Select 
                  placeholder="Select a manager" 
                  className="rounded-md"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {managers.map(manager => (
                    <Option key={manager.userId} value={manager.userId}>
                      {manager.fullName} ({manager.userId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select className="rounded-md">
                  <Option value={0}>Active</Option>
                  <Option value={1}>Inactive</Option>
                </Select>
              </Form.Item>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  onClick={() => navigate("/department")}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SaveOutlined />}
                  className="min-w-[100px] bg-blue-500 hover:bg-blue-600"
                >
                  Create
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateDepartmentPage;
