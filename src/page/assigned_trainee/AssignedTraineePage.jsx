// src/pages/AssignedTraineePage.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Tooltip,
  Typography,
  Button,
  Space,
  Input,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { getAllAssignedTrainee } from "../../services/traineeService";
import {
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const AssignedTraineePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const navigate = useNavigate();

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: "Assignment ID",
      dataIndex: "traineeAssignId",
      key: "traineeAssignId",
      width: 130,
      ellipsis: true,
      sorter: (a, b) => a.traineeAssignId.localeCompare(b.traineeAssignId),
      sortOrder:
        sortedInfo.columnKey === "traineeAssignId" ? sortedInfo.order : null,
    },
    {
      title: "Trainee ID",
      dataIndex: "traineeId",
      key: "traineeId",
      width: 140,
      ellipsis: true,
      sorter: (a, b) => a.traineeId.localeCompare(b.traineeId),
      sortOrder: sortedInfo.columnKey === "traineeId" ? sortedInfo.order : null,
      render: (text, record) => (
        <Tooltip title={text}>
          <span
            className="text-cyan-600 cursor-pointer hover:underline"
            onClick={() =>
              navigate(`/assigned-trainee/${record.traineeAssignId}`)
            }
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Training Matrix ID",
      dataIndex: "courseSubjectSpecialtyId",
      key: "courseSubjectSpecialtyId",
      width: 110,
      ellipsis: true,
      sorter: (a, b) =>
        a.courseSubjectSpecialtyId.localeCompare(b.courseSubjectSpecialtyId),
      sortOrder:
        sortedInfo.columnKey === "courseSubjectSpecialtyId"
          ? sortedInfo.order
          : null,
    },
    {
      title: "Assigned By",
      dataIndex: "assignByUserId",
      key: "assignByUserId",
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.assignByUserId.localeCompare(b.assignByUserId),
      sortOrder:
        sortedInfo.columnKey === "assignByUserId" ? sortedInfo.order : null,
    },
    {
      title: "Assign Date",
      dataIndex: "assignDate",
      key: "assignDate",
      width: 170,
      sorter: (a, b) => new Date(a.assignDate) - new Date(b.assignDate),
      sortOrder:
        sortedInfo.columnKey === "assignDate" ? sortedInfo.order : null,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Approval Status",
      dataIndex: "requestStatus",
      key: "requestStatus",
      width: 130,
      sorter: (a, b) => a.requestStatus.localeCompare(b.requestStatus),
      sortOrder:
        sortedInfo.columnKey === "requestStatus" ? sortedInfo.order : null,
      render: (status) => {
        let color = "default";
        if (status === "Pending") color = "cyan";
        else if (status === "Approved") color = "green";
        else if (status === "Rejected") color = "red";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Approved By",
      dataIndex: "approveByUserId",
      key: "approveByUserId",
      width: 120,
      sorter: (a, b) =>
        (a.approveByUserId || "").localeCompare(b.approveByUserId || ""),
      sortOrder:
        sortedInfo.columnKey === "approveByUserId" ? sortedInfo.order : null,
      render: (text) => text || "—",
    },
    {
      title: "Approval Date",
      dataIndex: "approvalDate",
      key: "approvalDate",
      width: 170,
      sorter: (a, b) =>
        new Date(a.approvalDate || 0) - new Date(b.approvalDate || 0),
      sortOrder:
        sortedInfo.columnKey === "approvalDate" ? sortedInfo.order : null,
      render: (date) => (date ? new Date(date).toLocaleString() : "—"),
    },
    {
      title: "Request ID",
      dataIndex: "requestId",
      key: "requestId",
      width: 140,
      ellipsis: true,
      sorter: (a, b) => a.requestId.localeCompare(b.requestId),
      sortOrder: sortedInfo.columnKey === "requestId" ? sortedInfo.order : null,
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

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter(
        (assignment) =>
          assignment.traineeId.toLowerCase().includes(value.toLowerCase()) ||
          assignment.courseId?.toLowerCase().includes(value.toLowerCase()) ||
          assignment.assignByUserId.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAssignments(filtered);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAllAssignedTrainee();
      const formattedData = (data || []).map((item, index) => ({
        ...item,
        key: index,
      }));
      setAssignments(formattedData);
      setFilteredAssignments(formattedData);
      setSearchText("");
    } catch (error) {
      console.error("Failed to fetch assigned trainees:", error);
      message.error("Unable to load assigned trainees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-cyan-400">
        <div className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Title level={2} className="!text-cyan-700 mb-2">
              Assigned Trainee List
            </Title>
            <Space size="middle" wrap>
              <Search
                placeholder="Search by Trainee ID, Course ID, or Assigned By"
                allowClear
                enterButton={
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#0891b2", // Tailwind's cyan-800
                      borderColor: "#0891b2",
                    }}
                    icon={<SearchOutlined />}
                  />
                }
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 400 }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAssignments}
                loading={loading}
                type="default"
                size="large"
                className="!border-cyan-500 !text-cyan-600 hover:!bg-cyan-100"
              >
                Refresh
              </Button>
              <Button
                icon={<UserAddOutlined />}
                type="primary"
                size="large"
                className="!bg-cyan-600 !text-white hover:!bg-cyan-700"
                onClick={() => navigate("/import-assign-trainee")}
              >
                Assign Trainee
              </Button>
            </Space>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchText && (
          <div className="mb-4">
            <Tag color="cyan" className="text-sm px-3 py-1">
              Found {filteredAssignments.length} results for {searchText}
            </Tag>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredAssignments}
          onChange={handleChange}
          loading={loading}
          pagination={{
            total: filteredAssignments.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
          bordered
          scroll={{ x: "max-content", y: 500 }}
        />
      </div>
    </div>
  );
};

export default AssignedTraineePage;
