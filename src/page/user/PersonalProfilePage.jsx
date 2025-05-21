// src\page\PersonalProfilePage.jsx
import { useEffect, useState } from "react";
import {
  Layout,
  // Avatar,
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
  // UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  LogoutOutlined,
  UserOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useAvatar } from "../../context/AvatarContext";
import {
  // getUserById,
  getUserProfile,
  updateAvatar,
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
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing(!isEditing);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        if (!userId) {
          message.error("User ID not found.");
          return;
        }

        const userData = await getUserProfile();

        const profileData = {
          avatar: userData.avatarUrlWithSas || "",
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
  const handleUpload = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      await updateAvatar(formDataUpload);
      message.success("Avatar uploaded successfully!");

      // Re-fetch updated user data
      const userData = await getUserProfile();

      const updatedAvatar = userData.avatarUrlWithSas || "";

      // Update local state
      setFormData((prev) => ({
        ...prev,
        avatar: updatedAvatar,
      }));

      // ✅ Update global avatar
      setAvatar(updatedAvatar);
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Avatar upload failed.");
    }
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

  const confirmPasswordUpdate = (values) => {
    Modal.confirm({
      title: "Confirm Password Change",
      icon: <SaveOutlined />,
      content: "Are you sure you want to change your password?",
      okText: "Yes, Change",
      cancelText: "Cancel",
      onOk: async () => {
        await handlePasswordSave(values);
        // Clear any stored user data
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        // Redirect to login page
        navigate("/login");
      },
    });
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
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
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
        {/* Profile Image Section */}
        <div className="relative w-40 h-40 mx-auto my-6 border-4 border-gray-300 rounded-full shadow-sm">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full text-gray-400 text-6xl">
              <UserOutlined />
            </div>
          )}
          {/* Upload/Edit Button */}
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            <EditOutlined className="absolute bottom-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow-md text-lg" />
          </Upload>

          {/* Remove Image Button */}
          {avatar && (
            <DeleteOutlined
              className="absolute top-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow-md text-lg"
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                {!isEditing ? (
                  <Button icon={<EditOutlined />} onClick={toggleEdit} />
                ) : (
                  <div className="space-x-2">
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={() => profileForm.submit()}
                    >
                      Save
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={toggleEdit}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <Form
                form={profileForm}
                layout="vertical"
                initialValues={formData}
                onFinish={(values) => {
                  handleProfileSave(values);
                  setIsEditing(false);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {/* Divider for large screens */}
                  <div className="space-y-4">
                    <Form.Item label="User ID" name="userId">
                      {isEditing ? (
                        <Input disabled />
                      ) : (
                        <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.userId}
                        </span>
                      )}
                    </Form.Item>

                    <Form.Item label="Full Name" name="fullName">
                      {isEditing ? (
                        <Input disabled />
                      ) : (
                        <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.fullName}
                        </span>
                      )}
                    </Form.Item>

                    <Form.Item
                      label="Gender"
                      name="gender"
                      rules={[
                        { required: true, message: "Please select gender" },
                      ]}
                    >
                      {isEditing ? (
                        <Select placeholder="Select gender">
                          <Select.Option value="Male">Male</Select.Option>
                          <Select.Option value="Female">Female</Select.Option>
                          <Select.Option value="Other">Other</Select.Option>
                        </Select>
                      ) : (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.gender}
                        </span>
                      )}
                    </Form.Item>
                  </div>
                  <div className="space-y-4">
                    <Form.Item
                      label="Date of Birth"
                      name="dateOfBirth"
                      rules={[
                        {
                          required: true,
                          message: "Please select date of birth",
                        },
                      ]}
                    >
                      {isEditing ? (
                        <DatePicker
                          style={{ width: "100%" }}
                          disabledDate={disabledDate}
                          format="YYYY-MM-DD"
                        />
                      ) : (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.dateOfBirth?.format("YYYY-MM-DD")}
                        </span>
                      )}
                    </Form.Item>

                    <Form.Item
                      label="Phone Number"
                      name="phoneNumber"
                      rules={[
                        {
                          required: true,
                          message: "Please input phone number",
                        },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "Phone number must be exactly 10 digits",
                        },
                      ]}
                    >
                      {isEditing ? (
                        <Input
                          maxLength={10}
                          onChange={handlePhoneNumberChange}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) e.preventDefault();
                          }}
                        />
                      ) : (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.phoneNumber}
                        </span>
                      )}
                    </Form.Item>

                    <Form.Item
                      label="Address"
                      name="address"
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
                      {isEditing ? (
                        <Input.TextArea rows={3} />
                      ) : (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {formData.address}
                        </span>
                      )}
                    </Form.Item>
                  </div>
                </div>

                <div className="flex justify-end items-center mt-4">
                  <Button
                    type="default"
                    danger
                    onClick={handleLogout}
                    icon={<LogoutOutlined />}
                  >
                    Logout
                  </Button>
                </div>
              </Form>
            </div>
          </TabPane>

          <TabPane tab="Change Password" key="2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={confirmPasswordUpdate}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Input.Password placeholder="Enter current password" />
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
                    <Input.Password placeholder="Enter new password" />
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
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("The two passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Re-enter new password" />
                  </Form.Item>
                </div>

                <Form.Item>
                  <div className="flex justify-between items-center mt-4">
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
            </div>
          </TabPane>
        </Tabs>
      </Layout.Content>
    </Layout>
  );
};

export default PersonalProfilePage;
