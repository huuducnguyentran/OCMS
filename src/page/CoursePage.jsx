// src/pages/CoursePage.jsx
import { Layout, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { courseData } from "../data/CourseData";

const CoursePage = () => {
  const { semester } = useParams();
  courseData.find((c) => c.semester.toString() === semester);
  const navigate = useNavigate();

  return (
    <Layout className="min-h-screen flex w-screen bg-gray-100 p-6">
      <Layout className="w-full">
        <Layout.Content className="flex flex-col items-center">
          {/* Page Title */}
          <h2 className="text-3xl font-bold mb-4">
            Training Course Curriculum
          </h2>
          <p className="text-lg text-gray-600 mb-8">Major: Aviation Science</p>

          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-6">
            {courseData.map((course) => (
              <Card
                key={course.semester}
                hoverable
                className="rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
                cover={
                  <img
                    alt={course.title}
                    src="https://source.unsplash.com/400x250/?airplane,aviation"
                    className="h-48 w-full object-cover"
                  />
                }
                onClick={() => navigate(`/course/${course.semester}`)}
              >
                <div className="flex flex-col flex-grow bg-indigo-950 p-4 h-full">
                  <h3 className="text-lg font-bold text-white">
                    {course.title}
                  </h3>
                  <p className="text-gray-100">{course.major}</p>
                  <p className="text-sm text-gray-300">
                    <strong>Duration:</strong> {course.duration}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Room:</strong> {course.room}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Days:</strong> {course.days.join(", ")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default CoursePage;
