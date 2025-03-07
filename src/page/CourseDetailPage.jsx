

import { useParams, useNavigate } from "react-router-dom";
import { Layout, Button, Divider, Space, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const foundCourse = storedCourses.find((c) => c.id.toString() === id);
    setCourse(foundCourse);
  }, [id]);

  if (!course) {
    return <p className="text-center text-red-500">Course not found!</p>;
  }

  return (
    <Layout className="min-h-screen bg-gray-100 p-6">
      <Layout.Content className="flex flex-col items-center">
        <div className="w-full max-w-5xl bg-white p-8 shadow-lg rounded-lg space-y-6">
          <Button
            type="link"
            onClick={() => navigate("/course")} // Quay lại trang khóa học
            icon={<ArrowLeftOutlined />}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Courses
          </Button>

          <div className="w-full h-64 overflow-hidden rounded-lg mb-6">
            <Image
              src={course.image || "https://via.placeholder.com/600x400?text=Course+Image"}
              alt={course.title}
              preview={false}
              className="object-cover w-full h-full"
            />
          </div>

          <h2 className="text-3xl font-bold text-indigo-900">{course.title}</h2>

          <Space direction="vertical" size="large" className="w-full">
            <p className="text-lg text-gray-600">
              <strong>Code:</strong> {course.code}
            </p>
            <p className="text-lg text-gray-600">
              <strong>Level:</strong> {course.level}
            </p>
            <Divider />
            <p className="text-lg text-gray-600">
              <strong>Description:</strong> {course.description || "No description available."}
            </p>
            <Divider />
            <p className="text-lg text-gray-600">
              <strong>Start Date:</strong> {course.startDate ? dayjs(course.startDate).format("YYYY-MM-DD") : "N/A"}
            </p>
            <p className="text-lg text-gray-600">
              <strong>End Date:</strong> {course.endDate ? dayjs(course.endDate).format("YYYY-MM-DD") : "N/A"}
            </p>
          </Space>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default CourseDetailPage;
