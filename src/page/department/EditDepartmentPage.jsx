import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Typography,
  Select,
  Spin,
  Alert,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDepartmentById,
  updateDepartment,
  getAllUsers,
} from "../../services/departmentServices";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditDepartmentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const isAdmin = sessionStorage.getItem("role") === "Admin";
  const [departmentStatus, setDepartmentStatus] = useState(0);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      message.error("You do not have permission to edit departments");
      navigate("/department");
      return;
    }
    fetchDepartment();
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      // Lấy tất cả users từ API 
      const response = await getAllUsers();
      console.log("API response for users:", response);
      
      // Kiểm tra cấu trúc dữ liệu trả về
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
      
      // Lọc users có roleName là "AOC Manager"
      const filteredUsers = allUsers.filter(user => 
        user && user.roleName && user.roleName === "AOC Manager"
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users list");
    }
  };

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      const data = await getDepartmentById(id);
      setDepartment(data);
      setDepartmentStatus(data.status);
      console.log("Fetched department:", data);
      form.setFieldsValue({
        departmentName: data.departmentName,
        departmentDescription: data.departmentDescription,
        managerId: data.managerId,
      });
    } catch (error) {
      message.error("Failed to fetch department details", error);
      navigate("/department");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setApiError(null); // Xóa lỗi trước đó (nếu có)
      
      const updateData = {
        departmentName: values.departmentName,
        departmentDescription: values.departmentDescription,
        managerId: values.managerId,
      };

      await updateDepartment(id, updateData);
      message.success("Department updated successfully");
      navigate("/department");
    } catch (error) {
      console.error("Failed to update department:", error);
      
      // Xử lý thông báo lỗi từ API
      if (error.response && error.response.data) {
        // Lưu thông tin lỗi API vào state
        const errorData = error.response.data;
        setApiError(errorData);
        
        // Nếu có thông báo lỗi cụ thể, hiển thị nó
        if (errorData.message) {
          message.error(errorData.message);
        } else {
          message.error("Failed to update department");
        }
      } else {
        // Trường hợp không có error.response.data
        message.error("Failed to update department");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleStatusChange = async (checked) => {
  //   if (!checked) {
  //     try {
  //       const confirmDelete = window.confirm(
  //         "Deactivating this department will delete it permanently. Are you sure?"
  //       );
  //       if (confirmDelete) {
  //         await deleteDepartment(id);
  //         message.success("Department deleted successfully");
  //         navigate("/department");
  //       }
  //     } catch (error) {
  //       message.error("Failed to delete department");
  //     }
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

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
            <Title level={2}>Edit Department</Title>
            <Text type="secondary">
              Update department information or delete department
            </Text>
          </div>



          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="departmentName"
              label="Department Name"
              rules={[
                { required: true, message: "Please enter department name" },
              ]}
            >
              <Input placeholder="Enter department name" />
            </Form.Item>

            <Form.Item name="departmentDescription" label="Description">
              <TextArea placeholder="Enter department description" rows={4} />
            </Form.Item>

            <Form.Item
              name="managerId"
              label="Manager"
              rules={[{ required: true, message: "Please select manager" }]}
            >
              <Select
                placeholder="Select a manager"
                suffixIcon={<UserOutlined />}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const searchText = option.children.toString().toLowerCase();
                  return searchText.indexOf(input.toLowerCase()) >= 0;
                }}
              >
                {users.map((user) => (
                  <Option key={user.userId} value={user.userId}>
                    {user.userId} - {user.fullName} ({user.roleName})
                  </Option>
                ))}
              </Select>
            </Form.Item>


            <div className="flex justify-end mt-6">
              <Space>
                <Button onClick={() => navigate("/department")}>Cancel</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Save Changes
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditDepartmentPage;
