import { useParams, useNavigate } from "react-router-dom";
import { Layout, Button, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const storedCourses = JSON.parse(sessionStorage.getItem("courses")) || [];
    const foundCourse = storedCourses.find((c) => c.id.toString() === id);
    setCourse(foundCourse);
  }, [id]);

  if (!course) {
    return <p className="text-center text-red-500">Course not found!</p>;
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Layout.Content>
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-8">
            <Button
              type="link"
              onClick={() => navigate("/course")}
              icon={<ArrowLeftOutlined />}
              className="flex items-center text-blue-600 hover:text-blue-800 text-lg font-medium 
                       transition-all duration-300 hover:-translate-x-1"
            >
              Back to Courses
            </Button>
          </div>

          {/* Course Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <Image
                    src={
                      course.image ||
                      "https://via.placeholder.com/600x400?text=Course+Image"
                    }
                    alt={course.title}
                    preview={true}
                    className="w-full object-cover transition-transform duration-300 hover:scale-105"
                    style={{ height: "300px" }}
                  />
                  {/* Quick Info Cards */}
                  <div className="p-6 space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-blue-600 font-semibold">
                        Course Code
                      </p>
                      <p className="text-lg text-gray-800">{course.code}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-purple-600 font-semibold">
                        Level
                      </p>
                      <p className="text-lg text-gray-800">{course.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>

                {/* Description */}
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {course.description || "No description available."}
                  </p>
                </div>
              </div>

              {/* Course Timeline */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">
                  Course Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                    <p className="text-sm text-blue-600 font-semibold mb-2">
                      Start Date
                    </p>
                    <p className="text-lg text-gray-800">
                      {course.startDate ? (
                        <>
                          <span className="block text-2xl font-bold">
                            {dayjs(course.startDate).format("D MMM")}
                          </span>
                          <span className="text-gray-600">
                            {dayjs(course.startDate).format("YYYY")}
                          </span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                    <p className="text-sm text-purple-600 font-semibold mb-2">
                      End Date
                    </p>
                    <p className="text-lg text-gray-800">
                      {course.endDate ? (
                        <>
                          <span className="block text-2xl font-bold">
                            {dayjs(course.endDate).format("D MMM")}
                          </span>
                          <span className="text-gray-600">
                            {dayjs(course.endDate).format("YYYY")}
                          </span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default CourseDetailPage;
