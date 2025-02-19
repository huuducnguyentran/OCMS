// src/pages/CoursePage.jsx
import { Layout, Table } from "antd";
import { useParams } from "react-router-dom";
import { courseData } from "../data/CourseData";

const columns = [
  { title: "Semester", dataIndex: "semester", key: "semester" },
  { title: "Course Title", dataIndex: "title", key: "title" },
  { title: "Duration", dataIndex: "duration", key: "duration" },
  { title: "Major", dataIndex: "major", key: "major" },
  { title: "Room", dataIndex: "room", key: "room" },
  {
    title: "Days",
    dataIndex: "days",
    key: "days",
    render: (days) => days.join(", "),
  },
];

const CoursePage = () => {
  const { semester } = useParams();
  const course = courseData.find((c) => c.semester.toString() === semester);

  return (
    <Layout className="min-h-screen flex w-screen">
      <Layout className="flex flex-col w-full h-screen">
        <Layout.Content className="p-6 bg-gray-100 flex-grow">
          <h2 className="text-2xl font-semibold">Training Course Curriculum</h2>
          <p className="text-lg mb-6">Major: Aviation Science</p>
          <Table dataSource={courseData} columns={columns} rowKey="semester" />
          {course && (
            <div className="mt-8 p-4 border rounded bg-white">
              <h3 className="text-xl font-semibold">{course.title}</h3>
              <p>
                <strong>Duration:</strong> {course.duration}
              </p>
              <p>
                <strong>Major:</strong> {course.major}
              </p>
              <p>
                <strong>Room:</strong> {course.room}
              </p>
              <p>
                <strong>Days:</strong> {course.days.join(", ")}
              </p>
            </div>
          )}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default CoursePage;
