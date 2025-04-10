// src\page\PersonalProfilePage.jsx
import { useEffect, useState } from "react";
import {
  Layout,
  Avatar,
  Input,
  Button,
  Upload,
  message,
  Tabs,
  Form,
  Select,
  DatePicker,
  Modal,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAvatar } from "../../context/AvatarContext";
import {
  getUserById,
  updatePassword,
  updateUser,
} from "../../services/userService";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

const { TabPane } = Tabs;
const { confirm } = Modal;

const PersonalProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { avatar, setAvatar } = useAvatar();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({}); // Stores editable user details
  const [setActiveTab] = useState("1");
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        if (!userId) {
          message.error("User ID not found.");
          return;
        }

        const userData = await getUserById(userId);
        const profileData = {
          userId: userData.userId || "",
          fullName: userData.fullName || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth
            ? moment(userData.dateOfBirth.split("T")[0])
            : null,
          address: userData.address || "",
          phoneNumber: userData.phoneNumber || "",
        };

        setFormData(profileData);
        profileForm.setFieldsValue(profileData);
      } catch {
        message.error("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, profileForm]);

  // Handle file upload
  const handleUpload = (info) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatar(e.target.result); // Save to global context
    };
    reader.readAsDataURL(file);
  };

  // Validate date of birth (18 years from today)
  const disabledDate = (current) => {
    return current && current > moment().subtract(18, "years");
  };

  // Phone number input handler - only allow numbers
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    profileForm.setFieldsValue({ phoneNumber: value });
  };

  // Save profile changes
  const handleProfileSave = async (values) => {
    try {
      if (!userId) {
        message.error("User ID is missing.");
        return;
      }

      const profileData = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
      };

      await updateUser(userId, profileData);
      message.success("Profile updated successfully.");
    } catch {
      message.error("Failed to update profile.");
    }
  };

  // Save password changes
  const handlePasswordSave = async (values) => {
    try {
      if (!userId) {
        message.error("User ID is missing.");
        return;
      }

      await updatePassword(userId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success("Password updated successfully.");
      passwordForm.resetFields();
    } catch {
      message.error("Failed to update password.");
    }
  };

  const handleLogout = () => {
    confirm({
      title: "Are you sure you want to logout?",
      icon: <LogoutOutlined />,
      content: "You will need to login again to access your account.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        // Clear any stored user data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login page
        navigate("/login");
      },
    });
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <Layout className="min-h-screen flex flex-col">
      <Layout.Content className="flex-1 p-8 bg-gray-100">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Profile Image */}
        <div className="relative w-32 h-32 mx-auto my-4">
          <Avatar size={128} src={avatar} icon={!avatar && <UserOutlined />} />

          {/* Upload/Edit Button */}
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            <EditOutlined className="absolute bottom-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow-md" />
          </Upload>

          {/* Remove Image Button */}
          {avatar && (
            <DeleteOutlined
              className="absolute top-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow-md"
              onClick={() => setAvatar(null)}
            />
          )}
        </div>

        {/* Tab Navigation */}
        <Tabs
          defaultActiveKey="1"
          centered
          className="mt-4 mb-4"
          onChange={(key) => setActiveTab(key)}
        >
          <TabPane tab="Personal Information" key="1">
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={formData}
              onFinish={handleProfileSave}
              className="flex flex-col"
            >
              <div className="grid grid-cols-2 gap-2 flex-grow">
                <Form.Item name="userId" label="User ID">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="fullName" label="Full Name">
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: "Please select gender" }]}
                >
                  <Select>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[
                    { required: true, message: "Please select date of birth" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={disabledDate}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Please input phone number" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Phone number must be exactly 10 digits",
                    },
                  ]}
                >
                  <Input
                    maxLength={10}
                    onChange={handlePhoneNumberChange}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[
                    { required: true, message: "Please input address" },
                    {
                      min: 10,
                      message: "Address must be at least 10 characters",
                    },
                    {
                      max: 100,
                      message: "Address must be at most 100 characters",
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </div>

              {/* Save Button for Profile */}
              <Form.Item className="mt-4">
                <div className="flex justify-between">
                  <Button type="primary" htmlType="submit">
                    Save Profile
                  </Button>
                  <Button
                    type="default"
                    danger
                    onClick={handleLogout}
                    icon={<LogoutOutlined />}
                  >
                    Logout
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Change Password" key="2">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSave}
              className="flex flex-col"
            >
              <div className="grid grid-cols-2 gap-2 flex-grow">
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[
                    {
                      required: true,
                      message: "Please input current password",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  dependencies={["currentPassword"]}
                  rules={[
                    { required: true, message: "Please input new password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value ||
                          getFieldValue("currentPassword") !== value
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "New password cannot be the same as current password"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your new password",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </div>

              {/* Save Button for Password */}
              <Form.Item className="mt-4">
                <div className="flex justify-between">
                  <Button type="primary" htmlType="submit">
                    Update Password
                  </Button>
                  <Button
                    type="default"
                    danger
                    onClick={handleLogout}
                    icon={<LogoutOutlined />}
                  >
                    Logout
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Layout.Content>
    </Layout>
  );
};

export default PersonalProfilePage;
