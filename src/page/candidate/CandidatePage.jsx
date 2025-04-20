// src/pages/CandidatePage.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Typography,
  Modal,
  message,
  Dropdown,
} from "antd";
import {
  getCandidates,
  deleteCandidate,
} from "../../services/candidateService";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Title } = Typography;

const CandidatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    setUserRole(role);
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCandidates();
      setCandidates(data || []);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      message.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = candidates.map((candidate) => ({
        "Candidate ID": candidate.candidateId,
        "Full Name": candidate.fullName,
        Gender: candidate.gender,
        "Date of Birth": candidate.dateOfBirth
          ? new Date(candidate.dateOfBirth).toLocaleDateString()
          : "",
        Address: candidate.address || "",
        Email: candidate.email || "",
        Phone: candidate.phoneNumber || "",
        "Personal ID": candidate.personalID || "",
        Note: candidate.note || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

      const date = new Date();
      const fileName = `candidates_${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      message.success("Candidate data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      message.error("Failed to export data. Please try again.");
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      0: { color: "orange", text: "Pending" },
      1: { color: "green", text: "Approved" },
      2: { color: "red", text: "Rejected" },
    };
    const { color, text } = statusMap[status] || {
      color: "default",
      text: "Unknown",
    };
    return <Tag color={color}>{text}</Tag>;
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Candidate",
      content: (
        <div>
          <p>Are you sure you want to delete this candidate?</p>
          <div className="mt-4">
            <div className="font-medium">Candidate Details:</div>
            <div>ID: {record.candidateId}</div>
            <div>Name: {record.fullName}</div>
            <div>Email: {record.email}</div>
            <div>
              Status:{" "}
              {record.candidateStatus === 0
                ? "Pending"
                : record.candidateStatus === 1
                ? "Approved"
                : record.candidateStatus === 2
                ? "Rejected"
                : "Unknown"}
            </div>
          </div>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      width: 500,
      centered: true,
      okButtonProps: {
        className: "bg-red-500 hover:bg-red-600",
      },
      onOk: async () => {
        try {
          setLoading(true);
          await deleteCandidate(record.candidateId);
          message.success("Candidate deleted successfully");
          fetchCandidates();
        } catch (error) {
          console.error("Error deleting candidate:", error);
          if (error.response?.status === 404) {
            message.error("Candidate not found");
          } else {
            message.error("Failed to delete candidate. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getActionItems = (record) => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: () => navigate(`/candidates/${record.candidateId}`),
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        onClick: () => handleDelete(record),
      },
    ],
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "candidateId",
      key: "candidateId",
      width: 100,
      fixed: "left",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
      width: 200,
      render: (text, record) => (
        <a
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => navigate(`/candidates/${record.candidateId}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "candidateStatus",
      key: "status",
      width: 120,
      render: getStatusTag,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Contact",
      children: [
        {
          title: "Email",
          dataIndex: "email",
          key: "email",
          width: 200,
        },
        {
          title: "Phone",
          dataIndex: "phoneNumber",
          key: "phoneNumber",
          width: 150,
        },
      ],
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Dropdown
            menu={getActionItems(record)}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="text-gray-600 hover:text-blue-600"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const filteredCandidates = candidates.filter((candidate) =>
    Object.values(candidate)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="max-w-7xl mx-auto shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="mb-0">
            <UserOutlined className="mr-2" />
            Candidate Management
          </Title>
          <Space>
            <Input
              placeholder="Search candidates..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              className="min-w-[300px]"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCandidates}
              loading={loading}
              type="primary"
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCandidates.map((item) => ({
            ...item,
            key: item.candidateId,
          }))}
          bordered
          loading={loading}
          scroll={{ x: 1500, y: "calc(100vh - 300px)" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} candidates`,
          }}
          className="shadow-sm"
        />

        {userRole === "Reviewer" && (
          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExportData}
              className="bg-green-600 hover:bg-green-700 border-0"
            >
              Export Candidate Information
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CandidatePage;
