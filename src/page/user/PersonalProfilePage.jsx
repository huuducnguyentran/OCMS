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
      <Layout.Content className="flex-1 p-8 bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            className="!text-cyan-700 hover:!text-cyan-900 hover:!border-cyan-900 px-0"
          >
            Back
          </Button>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-cyan-900 mb-4">Profile</h1>

        {/* Profile Image Section */}
        <div className="relative w-40 h-40 mx-auto my-6 border-4 border-cyan-600 rounded-full shadow-lg">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-700 text-6xl rounded-full">
              <UserOutlined />
            </div>
          )}

          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            <EditOutlined className="absolute bottom-2 right-2 bg-white text-cyan-700 p-2 rounded-full cursor-pointer shadow-md text-lg" />
          </Upload>

          {avatar && (
            <DeleteOutlined
              className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full cursor-pointer shadow-md text-lg"
              onClick={() => setAvatar(null)}
            />
          )}
        </div>

        {/* Tabs */}
        <Tabs
          defaultActiveKey="1"
          centered
          className="mb-6"
          tabBarStyle={{ color: "#0e7490" }}
          onChange={(key) => setActiveTab(key)}
        >
          <TabPane
            tab={
              <span className="text-cyan-800 font-medium">
                Personal Information
              </span>
            }
            key="1"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg border border-cyan-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-cyan-900">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <Button icon={<EditOutlined />} onClick={toggleEdit} />
                ) : (
                  <div className="space-x-2">
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={() => profileForm.submit()}
                      className="!bg-cyan-700 hover:!bg-cyan-800 hover:!border-cyan-800"
                    >
                      Save
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={toggleEdit}
                      className="!border-cyan-700 !text-cyan-700 hover:opacity-60"
                    >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Form.Item label="User ID" name="userId">
                      {isEditing ? (
                        <Input disabled className="!bg-cyan-100" />
                      ) : (
                        <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formData.userId}
                        </span>
                      )}
                    </Form.Item>

                    <Form.Item label="Full Name" name="fullName">
                      {isEditing ? (
                        <Input disabled className="!bg-cyan-100" />
                      ) : (
                        <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
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
                        <Select placeholder="Select gender" className="">
                          <Select.Option value="Male">Male</Select.Option>
                          <Select.Option value="Female">Female</Select.Option>
                          <Select.Option value="Other">Other</Select.Option>
                        </Select>
                      ) : (
                        <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
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
                        <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formData.dateOfBirth
                            ? new Date(formData.dateOfBirth)
                                .toISOString()
                                .split("T")[0]
                            : ""}
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
                          onKeyPress={(e) =>
                            !/[0-9]/.test(e.key) && e.preventDefault()
                          }
                        />
                      ) : (
                        <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
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
                        <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formData.address}
                        </span>
                      )}
                    </Form.Item>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
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

          <TabPane
            tab={
              <span className="text-cyan-800 font-medium">Change Password</span>
            }
            key="2"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg border border-cyan-200">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={confirmPasswordUpdate}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="flex justify-between items-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="!bg-cyan-700 hover:!bg-cyan-800"
                  >
                    Update Password
                  </Button>
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </Layout.Content>
    </Layout>
  );
};

export default PersonalProfilePage;
