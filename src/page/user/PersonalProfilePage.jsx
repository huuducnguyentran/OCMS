// src\page\PersonalProfilePage.jsx
import { useEffect, useState } from "react";
import { Layout, Avatar, Input, Button, Upload, message } from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAvatar } from "../../context/AvatarContext";
import {
  getUserById,
  updatePassword,
  updateUser,
} from "../../services/userService";
import { useParams } from "react-router-dom";

const PersonalProfilePage = () => {
  const { userId } = useParams();
  const { avatar, setAvatar } = useAvatar();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({}); // Stores editable user details

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        if (!userId) {
          message.error("User ID not found.");
          return;
        }

        const userData = await getUserById(userId);
        setFormData({
          userId: userData.userId || "",
          fullName: userData.fullName || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth
            ? userData.dateOfBirth.split("T")[0]
            : "",
          address: userData.address || "",
          phoneNumber: userData.phoneNumber || "",
        });
      } catch {
        message.error("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Handle file upload
  const handleUpload = (info) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatar(e.target.result); // Save to global context
    };
    reader.readAsDataURL(file);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      if (!userId) {
        message.error("User ID is missing.");
        return;
      }

      // Check if password fields are filled
      if (formData.currentPassword && formData.newPassword) {
        await updatePassword(userId, {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        message.success("Password updated successfully.");
      }

      // Update profile details
      const { ...profileData } = formData;
      await updateUser(userId, profileData);
      message.success("Profile updated successfully.");
    } catch {
      message.error("Failed to update profile or password.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <Layout className="h-screen flex">
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

        {/* Profile Details Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">User ID</label>
            <Input
              name="userID"
              value={formData.userId}
              disabled
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">Full Name</label>
            <Input
              name="fullName"
              value={formData.fullName}
              disabled
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">Gender</label>
            <Input
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">Date of Birth</label>
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">Phone Number</label>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">Current Password</label>
            <Input
              type="password"
              name="currentPassword"
              value={formData.currentPassword || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-medium">New Password</label>
            <Input
              type="password"
              name="newPassword"
              value={formData.newPassword || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 mt-4">
          <Button type="primary" onClick={handleSave}>
            Save Changes
          </Button>
          <Button type="default" danger>
            Cancel
          </Button>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default PersonalProfilePage;
