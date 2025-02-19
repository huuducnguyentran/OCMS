// src/pages/CourseDetailPage.jsx
import { useParams } from "react-router-dom";
import { courseData } from "../data/CourseData";

const CourseDetailPage = () => {
  const { id } = useParams();
  const course = courseData.find((c) => c.semester === parseInt(id));

  if (!course) return <p>Course not found</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold">{course.title}</h2>
      <p>
        <strong>Duration:</strong> {course.duration}
      </p>
      <p>
        <strong>Time Frame:</strong> {course.timeFrame}
      </p>
      <p>
        <strong>Weekly Frequency:</strong> {course.weeklyFrequency} times per
        week
      </p>
      <p>
        <strong>Room Number:</strong> {course.room}
      </p>
    </div>
  );
};

export default CourseDetailPage;
