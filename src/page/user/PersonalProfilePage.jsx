// src\page\PersonalProfilePage.jsx
import { useState } from "react";
import { Layout, Avatar, Input, Button, Upload } from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useAvatar } from "../../context/AvatarContext"; // Import Avatar context

const PersonalProfilePage = () => {
  const { avatar, setAvatar } = useAvatar(); // Use context to set avatar
  const [imageUrl, setImageUrl] = useState(avatar);

  // Handle file upload
  const handleUpload = (info) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  // Save Avatar to Global Context
  const handleSave = () => {
    setAvatar(imageUrl); // Updates the header avatar
  };

  return (
    <Layout className="h-screen flex">
      <Layout.Content className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Profile Image */}
        <div className="relative w-32 h-32 mx-auto my-4">
          <Avatar
            size={128}
            src={imageUrl}
            icon={!imageUrl && <UserOutlined />}
          />

          {/* Upload/Edit Button */}
          <Upload
            showUploadList={false}
            beforeUpload={() => false} // Prevent automatic upload
            onChange={handleUpload}
          >
            <EditOutlined className="absolute bottom-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow-md" />
          </Upload>

          {/* Remove Image Button */}
          {imageUrl && (
            <DeleteOutlined
              className="absolute top-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow-md"
              onClick={handleRemoveImage}
            />
          )}
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Full Name</label>
            <Input placeholder="Enter your name" />
          </div>
          <div>
            <label className="block font-medium">ID</label>
            <Input value="SE102501" disabled />
          </div>
          <div>
            <label className="block font-medium">Date of Birth</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block font-medium">Password</label>
            <Input.Password
              iconRender={(visible) =>
                visible ? <EyeInvisibleOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </div>
          <div>
            <label className="block font-medium">Email</label>
            <Input placeholder="Enter your email" />
          </div>
          <div>
            <label className="block font-medium">Phone</label>
            <Input placeholder="Enter your phone number" />
          </div>
          <div className="col-span-2">
            <label className="block font-medium">Address</label>
            <Input placeholder="Enter your address" />
          </div>
        </div>

        {/* Save Buttons */}
        <div className="flex gap-4 mt-4">
          <Button type="primary" danger onClick={handleSave}>
            Save changes
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
