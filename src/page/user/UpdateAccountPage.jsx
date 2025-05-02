import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Spin,
  Card,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../services/userService";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const UpdateAccountPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserById(userId);
      setUserData(data);

      // Format the date for DatePicker
      const formattedData = {
        fullName: data.fullName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
        address: data.address,
        phoneNumber: data.phoneNumber,
      };

      form.setFieldsValue(formattedData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      message.error("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Format the date of birth to ISO string
      const formattedValues = {
        fullName: values.fullName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.toISOString()
          : null,
        address: values.address,
        phoneNumber: values.phoneNumber,
      };

      await updateUser(userId, formattedValues);
      message.success("Account information updated successfully");
      navigate("/accounts");
    } catch (error) {
      console.error("Failed to update user:", error);
      message.error("Failed to update account information");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 animate__animated animate__fadeIn">
      <Card
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-0"
        bodyStyle={{ padding: 0 }}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/accounts")}
              className="text-white hover:text-blue-100 border-0 hover:bg-blue-800/30 flex items-center"
            >
              Back
            </Button>
            <Title level={3} className="m-0 text-white">
              Update Account
            </Title>
            <div style={{ width: 75 }}></div> {/* Spacer for alignment */}
          </div>
          <Text className="text-blue-100 mt-2 block opacity-90">
            Update details for user ID: {userId}
          </Text>
        </div>

        {/* Main content */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              className="w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item
                  name="fullName"
                  label={
                    <span className="text-gray-700 font-medium">Full Name</span>
                  }
                  rules={[
                    { required: true, message: "Please enter full name" },
                    { min: 3, message: "Name must be at least 3 characters" },
                  ]}
                  className="col-span-2"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter full name"
                    className="h-11 rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label={
                    <span className="text-gray-700 font-medium">Gender</span>
                  }
                  rules={[{ required: true, message: "Please select gender" }]}
                >
                  <Select
                    placeholder="Select gender"
                    className="h-11 rounded-lg"
                    dropdownClassName="rounded-lg shadow-lg"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dateOfBirth"
                  label={
                    <span className="text-gray-700 font-medium">
                      Date of Birth
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select date of birth" },
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="Select date of birth"
                    className="w-full h-11 rounded-lg"
                    showToday={false}
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label={
                    <span className="text-gray-700 font-medium">
                      Phone Number
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                      pattern: /^\d{10,15}$/,
                      message: "Please enter a valid phone number",
                    },
                  ]}
                  className="col-span-2 md:col-span-1"
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="Enter phone number"
                    className="h-11 rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label={
                    <span className="text-gray-700 font-medium">Address</span>
                  }
                  rules={[{ required: true, message: "Please enter address" }]}
                  className="col-span-2"
                >
                  <Input.TextArea
                    placeholder="Enter address"
                    rows={3}
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <Divider className="my-6" />

              <Form.Item className="mb-0">
                <div className="flex justify-end">
                  <Button
                    type="default"
                    onClick={() => navigate("/accounts")}
                    className="mr-4 h-11 px-6 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={submitting}
                    className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg border-0 shadow-md"
                  >
                    Save Changes
                  </Button>
                </div>
              </Form.Item>
            </Form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UpdateAccountPage;
