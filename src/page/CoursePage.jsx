
import { Layout, Card, Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import "animate.css";

const CoursePage = () => {
  const navigate = useNavigate();
  const [storedCourses, setStoredCourses] = useState([]);

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    setStoredCourses(courses);
  }, []);

  return (
    <Layout className="min-h-screen flex w-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-10 animate__animated animate__fadeIn">
      <Layout className="w-full max-w-6xl">
        <Layout.Content className="flex flex-col items-center">
          {/* Page Title */}
          <div className="w-full flex flex-col items-center text-center mb-10">
            <h2 className="text-4xl font-extrabold text-indigo-900 animate__animated animate__fadeInDown">
              Training Course Curriculum
            </h2>
            <p className="text-lg text-gray-700 mt-2">Explore our latest courses available.</p>
          </div>

          {/* Add Course Button */}
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            className="fixed bottom-6 right-6 shadow-lg bg-blue-500 hover:bg-blue-600 animate__animated animate__bounceIn"
            onClick={() => navigate("/course/create")}
          />

          {/* Check if there are courses */}
          {storedCourses.length === 0 ? (
            <div className="flex justify-center items-center h-96 animate__animated animate__fadeIn">
              <Empty description={<span className="text-lg text-gray-600">No courses available</span>} />
            </div>
          ) : (
            // Course Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full animate__animated animate__fadeInUp">
              {storedCourses.map((course) => (
                <Card
                  key={course.id}
                  hoverable
                  className="rounded-xl shadow-xl overflow-hidden flex flex-col transform transition duration-500 hover:scale-105 bg-white"
                  cover={
                    <div className="h-52 overflow-hidden">
                      <img
                        alt={course.title}
                        src={course.image || "https://via.placeholder.com/600x400?text=Course+Image"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  }
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="flex flex-col flex-grow p-5">
                    <h3 className="text-xl font-bold text-indigo-900">{course.title}</h3>
                    <p className="text-gray-700 mt-1"><strong>Major:</strong> {course.major || "Not specified"}</p>
<p className="text-gray-600 mt-1"><strong>Duration:</strong> {course.duration || "Not specified"}</p>
                    <p className="text-gray-600"><strong>Room:</strong> {course.room || "Not specified"}</p>
                    <p className="text-gray-600"><strong>Days:</strong> {Array.isArray(course.days) ? course.days.join(", ") : "Not specified"}</p>
                    <p className="text-gray-600 mt-2"><strong>Start Date:</strong> {course.startDate || "Not specified"}</p>
                    <p className="text-gray-600"><strong>End Date:</strong> {course.endDate || "Not specified"}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default CoursePage;


