// src/pages/SchedulePage.jsx
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import { courseData, slotData } from "../data/CourseData";

const SchedulePage = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Time Slot",
      dataIndex: "timeFrame",
      key: "timeFrame",
      fixed: "left",
      width: 150,
    },
    { title: "Monday", dataIndex: "Monday", key: "Monday", width: 180 },
    { title: "Tuesday", dataIndex: "Tuesday", key: "Tuesday", width: 180 },
    {
      title: "Wednesday",
      dataIndex: "Wednesday",
      key: "Wednesday",
      width: 180,
    },
    { title: "Thursday", dataIndex: "Thursday", key: "Thursday", width: 180 },
    { title: "Friday", dataIndex: "Friday", key: "Friday", width: 180 },
    { title: "Saturday", dataIndex: "Saturday", key: "Saturday", width: 180 },
    { title: "Sunday", dataIndex: "Sunday", key: "Sunday", width: 180 },
  ];

  const tableData = slotData.map((slot) => {
    let row = { key: slot.slot, timeFrame: slot.timeFrame };
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].forEach((day) => {
      const course = courseData.find(
        (course) => course.slot === slot.slot && course.days.includes(day)
      );
      row[day] = course ? (
        <span
          className="cursor-pointer text-blue-500 underline"
          onClick={() => navigate(`/course/${course.semester}`)}
        >
          {course.title} <br /> (Room {course.room})
        </span>
      ) : (
        "-"
      );
    });
    return row;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen overflow-auto">
      <h2 className="text-2xl font-semibold mb-4">Trainee Schedule</h2>
      <div className="overflow-x-auto">
        <Table
          dataSource={tableData}
          columns={columns}
          bordered
          scroll={{ x: "max-content" }}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default SchedulePage;
