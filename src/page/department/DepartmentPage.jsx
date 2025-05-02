import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Typography,
  Tag,
  Tooltip,
  Row,
  Col,
  Input,
  Switch,
  Statistic,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  ReloadOutlined,
  BarsOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllDepartments,
  deleteDepartment,
  activateDepartment,
} from "../../services/departmentServices";

const { Title, Text } = Typography;

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem("role") === "Admin";

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      message.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      setLoading(true);

      if (currentStatus === 1) {
        // Nếu đang inactive -> active
        const response = await activateDepartment(id);
        if (response) {
          message.success("Department activated successfully");
        }
      } else {
        // Nếu đang active -> delete
        await deleteDepartment(id);
        message.success("Department deleted successfully");
      }

      await fetchDepartments();
    } catch (error) {
      console.error("Error handling status change:", error);
      message.error(
        currentStatus === 1
          ? "Failed to activate department"
          : "Failed to delete department"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filtering function
  const getFilteredData = () => {
    if (!searchText) return departments;

    return departments.filter((item) =>
      Object.values(item).some(
        (val) =>
          val && val.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };

  // Department statistics
  const activeCount = departments.filter((dept) => dept.status === 0).length;
  const inactiveCount = departments.filter((dept) => dept.status === 1).length;

  const columns = [
    {
      title: "Department ID",
      dataIndex: "departmentId",
      key: "departmentId",
      render: (text) => (
        <div className="flex items-center">
          <Text
            copyable={{ tooltips: ["Copy ID", "Copied!"] }}
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            {text}
          </Text>
        </div>
      ),
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Department Name",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (text) => (
        <Text strong className="text-blue-800">
          {text}
        </Text>
      ),
      width: "18%",
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "departmentDescription",
      key: "departmentDescription",
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <div className="max-w-md truncate">{text}</div>
        </Tooltip>
      ),
      width: "20%",
      ellipsis: true,
    },
    {
      title: "Specialty",
      dataIndex: "specialtyId",
      key: "specialtyId",
      render: (text) => (
        <Tag color="blue" className="text-center px-3 py-1 rounded-full">
          {text}
        </Tag>
      ),
      width: "12%",
      ellipsis: true,
    },
    {
      title: "Manager",
      dataIndex: "managerUserId",
      key: "managerUserId",
      render: (text) => (
        <div className="flex items-center space-x-2">
          <Avatar
            size="small"
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
          />
          <Text>{text}</Text>
        </div>
      ),
      width: "12%",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Switch
              checked={status === 0}
              onChange={() => handleStatusChange(record.departmentId, status)}
              size="small"
              className="mr-2"
              loading={loading && record.loading}
              disabled={!isAdmin}
            />
          )}

          {status === 0 ? (
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              className="px-2 py-1 flex items-center space-x-1 rounded-full"
            >
              <span>Active</span>
            </Tag>
          ) : (
            <Tag
              icon={<CloseCircleOutlined />}
              color="error"
              className="px-2 py-1 flex items-center space-x-1 rounded-full"
            >
              <span>Inactive</span>
            </Tag>
          )}
        </div>
      ),
      width: "12%",
      filters: [
        { text: "Active", value: 0 },
        { text: "Inactive", value: 1 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: "12%",
      render: (_, record) => (
        <Space size="middle">
          {isAdmin && (
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/department/edit/${record.departmentId}`)
              }
              type="primary"
              size="small"
              ghost
              className="flex items-center"
            >
              Edit
            </Button>
          )}

          <Button
            icon={<UserSwitchOutlined />}
            onClick={() =>
              navigate(`/department/assign/${record.departmentId}`)
            }
            type="default"
            size="small"
            className="flex items-center text-purple-600 border-purple-300"
          >
            Assign
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card
        className="shadow-md rounded-lg border-0"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Title level={3} className="mb-2 flex items-center text-blue-800">
              <TeamOutlined className="mr-2" />
              Department Management
            </Title>
            <Text type="secondary" className="text-sm">
              View and manage all departments in your organization
            </Text>
          </div>

          <Space size="middle" wrap className="flex-shrink-0 mt-4 md:mt-0">
            <Input
              placeholder="Search departments..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
              className="rounded-lg"
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDepartments}
              loading={loading}
              className="rounded-lg border-gray-300"
            >
              Refresh
            </Button>

            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/department/create")}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg border-0"
              >
                New Department
              </Button>
            )}
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm h-full bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title={<span className="text-blue-800">Total Departments</span>}
                value={departments.length}
                prefix={<BarsOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm h-full bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title={
                  <span className="text-green-800">Active Departments</span>
                }
                value={activeCount}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm h-full bg-gradient-to-br from-red-50 to-red-100">
              <Statistic
                title={
                  <span className="text-red-800">Inactive Departments</span>
                }
                value={inactiveCount}
                prefix={<CloseCircleOutlined className="text-red-600" />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          className="shadow-sm border-0 overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
            <Text strong className="text-white text-lg">
              Department List
            </Text>
          </div>
          <Table
            columns={columns}
            dataSource={getFilteredData()}
            loading={loading}
            rowKey="departmentId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} departments`,
              className: "p-4",
            }}
            scroll={{ x: 1100 }}
            className="department-table"
            size="middle"
            rowClassName={(record) =>
              record.status === 0
                ? "bg-white hover:bg-blue-50"
                : "bg-gray-50 hover:bg-gray-100"
            }
          />
        </Card>
      </Card>
    </div>
  );
};

export default DepartmentPage;
