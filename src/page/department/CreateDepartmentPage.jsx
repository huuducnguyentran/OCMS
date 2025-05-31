import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Select,
  Spin,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  createDepartment,
  getAllUsers,
} from "../../services/departmentServices";
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
      let allUsers = [];

      if (Array.isArray(response)) {
        allUsers = response;
      } else if (response?.data?.users) {
        allUsers = response.data.users;
      } else if (response?.data) {
        allUsers = response.data;
      } else if (response?.users) {
        allUsers = response.users;
      }

      const aocManagers = allUsers.filter(
        (user) => user?.roleName === "AOC Manager"
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
      const departmentData = {
        departmentName: values.departmentName,
        departmentDescription: values.departmentDescription,
        specialtyId: values.specialtyId,
        managerId: values.managerId,
        status: parseInt(values.status),
      };
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <Card className="!shadow-xl !rounded-2xl" bodyStyle={{ padding: 24 }}>
          <div className="mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/department")}
              className="mb-4 !text-cyan-600 hover:!border-cyan-600"
            >
              Back to Departments
            </Button>
            <div className="flex items-center gap-3">
              <TeamOutlined className="!text-6xl !text-cyan-700" />
              <div>
                <Title level={2} className="!mb-1 !text-cyan-800">
                  Create New Department
                </Title>
                <Text type="secondary" className="!text-cyan-600">
                  Add a new department to the system
                </Text>
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
              initialValues={{ status: 0 }}
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
                  className="rounded-md !border-cyan-600 focus:!border-cyan-800"
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
                  className="rounded-md !border-cyan-600 focus:!border-cyan-800"
                />
              </Form.Item>

              <Form.Item
                name="specialtyId"
                label="Specialty"
                rules={[
                  { required: true, message: "Please select a specialty" },
                ]}
              >
                <Select
                  placeholder="Select a specialty"
                  className="rounded-md"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {specialties.map((specialty) => (
                    <Option
                      key={specialty.specialtyId}
                      value={specialty.specialtyId}
                    >
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
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {managers.map((manager) => (
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
                  className="!min-w-[100px] hover:!border-cyan-600 hover:!text-cyan-600"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SaveOutlined />}
                  className="!min-w-[100px] !bg-cyan-700 hover:!bg-cyan-800 !border-none"
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
