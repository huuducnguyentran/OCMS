// src/pages/AssignedTraineePage.jsx
import { useEffect, useState } from "react";
import { Table, Tooltip } from "antd";
// import { useNavigate } from "react-router-dom";
import { getAllAssignedTrainee } from "../../services/traineeService";

const AssignedTraineePage = () => {
  const [assignments, setAssignments] = useState([]);
  //   const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getAllAssignedTrainee();
        setAssignments(data || []);
      } catch (error) {
        console.error("Failed to fetch assigned trainees:", error);
      }
    };

    fetchAssignments();
  }, []);

  const columns = [
    {
      title: "Assignment ID",
      dataIndex: "traineeAssignId",
      key: "traineeAssignId",
      width: 130,
      ellipsis: true,
    },
    {
      title: "Trainee ID",
      dataIndex: "traineeId",
      key: "traineeId",
      width: 140,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-blue-600 cursor-pointer hover:underline">
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
      width: 110,
      ellipsis: true,
    },
    {
      title: "Assigned By",
      dataIndex: "assignByUserId",
      key: "assignByUserId",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Assign Date",
      dataIndex: "assignDate",
      key: "assignDate",
      width: 170,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Approval Status",
      dataIndex: "requestStatus",
      key: "requestStatus",
      width: 130,
    },
    {
      title: "Approved By",
      dataIndex: "approveByUserId",
      key: "approveByUserId",
      width: 120,
      render: (text) => text || "—",
    },
    {
      title: "Approval Date",
      dataIndex: "approvalDate",
      key: "approvalDate",
      width: 170,
      render: (date) => (date ? new Date(date).toLocaleString() : "—"),
    },
    {
      title: "Request ID",
      dataIndex: "requestId",
      key: "requestId",
      width: 140,
      ellipsis: true,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      width: 150,
      ellipsis: true,
      render: (text) => text || "—",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl text-gray-900 font-semibold mb-4">
          Assigned Trainee List
        </h2>

        <Table
          columns={columns}
          dataSource={assignments.map((item, index) => ({
            ...item,
            key: index,
          }))}
          bordered
          scroll={{ x: "max-content", y: 500 }}
        />
      </div>
    </div>
  );
};

export default AssignedTraineePage;
