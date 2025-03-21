// src/pages/SchedulePage.jsx
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import { courseData, slotData } from "../data/CourseData";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";

const SchedulePage = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 text-indigo-700">
          <ClockCircleOutlined />
          <span>Time Slot</span>
        </div>
      ),
      dataIndex: "timeFrame",
      key: "timeFrame",
      fixed: "left",
      width: 150,
      render: (text) => (
        <div className="font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
          {text}
        </div>
      ),
    },
    ...["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
      (day) => ({
        title: (
          <div className="text-center font-semibold text-indigo-700">
            <div className="text-lg">{day}</div>
          </div>
        ),
        dataIndex: day,
        key: day,
        width: 200,
        render: (content) => (
          <div className="p-2">
            {content !== "-" ? (
              <div className="bg-white hover:bg-blue-50 p-4 rounded-xl shadow-sm 
                            border border-blue-100 transition-all duration-300
                            hover:shadow-md cursor-pointer">
                {content}
              </div>
            ) : (
              <div className="text-center text-gray-400 p-4">No Class</div>
            )}
          </div>
        ),
      })
    ),
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
        <div
          onClick={() => navigate(`/course/${course.semester}`)}
          className="space-y-2"
        >
          <div className="font-semibold text-blue-600 hover:text-blue-700">
            {course.title}
          </div>
          <div className="text-sm text-gray-500">
            Room {course.room}
          </div>
        </div>
      ) : (
        "-"
      );
    });
    return row;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-[1500px] mx-auto">
        {/* Header Section với logo đậm hơn */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              <CalendarOutlined className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Weekly Schedule
              </h2>
              <p className="text-gray-600">View your weekly training schedule</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 overflow-hidden">
          <Table
            dataSource={tableData}
            columns={columns}
            bordered={true}
            scroll={{ x: "max-content" }}
            pagination={false}
            className="custom-schedule-table"
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
