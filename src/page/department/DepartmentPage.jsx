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
  Dropdown,
  Menu,
  List,
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
  DownloadOutlined,
  DownOutlined,
  FileExcelOutlined,
  ExportOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllDepartments,
  deleteDepartment,
  activateDepartment,
} from "../../services/departmentServices";
import { getAllUsers, exportTraineeInfo } from "../../services/userService";
import {
  exportExpiredCertificates,
  exportCertificate,
} from "../../services/reportService";

const { Title, Text } = Typography;

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [departmentUsers, setDepartmentUsers] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState({});
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem("role") === "Admin";
  const isReviewer = sessionStorage.getItem("role") === "Reviewer";

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartments();
      setDepartments(data);

      // Fetch users for each department
      await fetchDepartmentUsers(data);
    } catch (error) {
      message.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch users for each department
  const fetchDepartmentUsers = async (departments) => {
    try {
      const allUsers = await getAllUsers();

      // Create a mapping of departmentId to users
      const usersByDepartment = {};

      departments.forEach((dept) => {
        // Filter users who belong to this department and are not AOC (roleId 8)
        const deptUsers = allUsers.filter(
          (user) => user.departmentId === dept.departmentId && user.roleId !== 8
        );

        usersByDepartment[dept.departmentId] = deptUsers;
      });

      setDepartmentUsers(usersByDepartment);
    } catch (error) {
      console.error("Error fetching department users:", error);
      message.error("Failed to load department users");
    }
  };

  // Handle trainee info export
  const handleExportTraineeInfo = async (userId) => {
    try {
      setDownloadLoading((prev) => ({ ...prev, [userId]: true }));
      await exportTraineeInfo(userId);
      message.success("Trainee information exported successfully");
    } catch (error) {
      console.error("Error exporting trainee info:", error);
      message.error("Failed to export trainee information");
    } finally {
      setDownloadLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle expired certificates export
  const handleExportExpiredCertificates = async () => {
    try {
      setDownloadLoading((prev) => ({ ...prev, expiredCerts: true }));
      await exportExpiredCertificates();
      message.success("Expired certificates exported successfully");
    } catch (error) {
      console.error("Error exporting expired certificates:", error);
      message.error("No expired certificates found");
    } finally {
      setDownloadLoading((prev) => ({ ...prev, expiredCerts: false }));
    }
  };

  // Handle certificates export
  const handleExportCertificates = async () => {
    try {
      setDownloadLoading((prev) => ({ ...prev, allCerts: true }));
      await exportCertificate();
      message.success("Certificates exported successfully");
    } catch (error) {
      console.error("Error exporting certificates:", error);
      message.error("Failed to export certificates");
    } finally {
      setDownloadLoading((prev) => ({ ...prev, allCerts: false }));
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

  //export data
  const handleExport = () => {
    const data = getFilteredData();
    const csvContent = [
      [
        "Department ID",
        "Department Name",
        "Description",
        "Specialty",
        "Status",
      ], // adjust columns
      ...data.map((item) => [
        item.departmentId,
        item.departmentName,
        item.departmentDescription,
        item.specialtyId,
        item.status === 0 ? "Active" : "Inactive",
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const utf8BOM = "\uFEFF"; // Add BOM for Excel UTF-8 support
    const blob = new Blob([utf8BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "departments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Department statistics
  const activeCount = departments.filter((dept) => dept.status === 0).length;
  const inactiveCount = departments.filter((dept) => dept.status === 1).length;

  // Handling expanded rows
  const handleExpandRow = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.departmentId] : []);
  };

  // Expandable row render function
  const expandedRowRender = (record) => {
    const users = departmentUsers[record.departmentId] || [];

    return (
      <Card className="bg-gray-50 border-0">
        <div className="py-2">
          <div className="flex justify-between items-center mb-3">
            <Text strong className="text-blue-700">
              Department Users ({users.length})
            </Text>
          </div>

          {users.length > 0 ? (
            <List
              size="small"
              dataSource={users}
              renderItem={(user) => (
                <List.Item className="py-2 px-3 hover:bg-blue-50 rounded-lg">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{ backgroundColor: "#1890ff" }}
                        icon={<UserOutlined />}
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong>{user.fullName || user.username}</Text>
                        <Tooltip title="Export Trainee Information">
                          <Button
                            type="text"
                            size="small"
                            icon={<DownloadOutlined />}
                            loading={downloadLoading[user.userId]}
                            onClick={() => handleExportTraineeInfo(user.userId)}
                            className="text-blue-600 hover:text-blue-800"
                          />
                        </Tooltip>
                      </div>
                    }
                    description={
                      <Space size="small" className="text-xs">
                        <Tag color="blue">{user.userId}</Tag>
                        <Tag color="green">{user.roleName}</Tag>
                        <Text type="secondary">{user.email}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              pagination={users.length > 5 ? { pageSize: 5 } : false}
              className="bg-white rounded-lg shadow-sm"
            />
          ) : (
            <div className="text-center py-4 bg-white rounded-lg shadow-sm">
              <Text type="secondary">No users found in this department</Text>
            </div>
          )}
        </div>
      </Card>
    );
  };

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
      render: (text, record) => (
        <div className="flex items-center">
          <Text strong className="text-blue-800 mr-2">
            {text}
          </Text>
          {/* Add dropdown trigger button */}
          <Button
            type="text"
            size="small"
            icon={<TeamOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              const expanded = expandedRowKeys.includes(record.departmentId);
              handleExpandRow(!expanded, record);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <DownOutlined style={{ fontSize: "10px" }} />
          </Button>
        </div>
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
    !isReviewer && {
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
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-cyan-50 p-6">
      <Card
        className="shadow-md rounded-lg border-0"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Title level={3} className="mb-2 flex items-center !text-cyan-800">
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
              className="!rounded-lg !border-cyan-600 !text-cyan-700 hover:!bg-cyan-100"
            >
              Refresh
            </Button>

            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/department/create")}
                className="!bg-cyan-700 hover:!bg-cyan-800 rounded-lg border-0"
              >
                New Department
              </Button>
            )}
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm h-full bg-gradient-to-br from-cyan-50 to-cyan-100">
              <Statistic
                title={<span className="text-cyan-800">Total Departments</span>}
                value={departments.length}
                prefix={<BarsOutlined className="text-cyan-600" />}
                valueStyle={{ color: "#0891b2" }} // cyan-600
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm h-full bg-gradient-to-br from-cyan-100 to-cyan-200">
              <Statistic
                title={
                  <span className="text-cyan-900">Active Departments</span>
                }
                value={activeCount}
                prefix={<CheckCircleOutlined className="text-cyan-700" />}
                valueStyle={{ color: "#0e7490" }} // cyan-700
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Statistic
                title={
                  <span className="text-gray-700">Inactive Departments</span>
                }
                value={inactiveCount}
                prefix={<CloseCircleOutlined className="text-gray-500" />}
                valueStyle={{ color: "#6b7280" }} // gray-500
              />
            </Card>
          </Col>
        </Row>

        {/* Table Section */}
        <Card
          className="shadow-sm border-0 overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-4 bg-gradient-to-r from-cyan-700 to-cyan-600 text-white flex justify-between items-center">
            <Text strong className="!text-white text-lg">
              Department List
            </Text>

            <Space>
              <Button
                icon={<ExportOutlined />}
                type="default"
                size="small"
                className="!bg-cyan-800 !text-white !border-0 hover:!bg-cyan-950"
                onClick={handleExportExpiredCertificates}
                loading={downloadLoading.expiredCerts}
              >
                Export Expired Certificates
              </Button>

              <Button
                icon={<DownloadOutlined />}
                type="default"
                size="small"
                className="!bg-cyan-500 !text-white !border-0 hover:!bg-cyan-700"
                onClick={handleExport}
              >
                Export Departments
              </Button>
            </Space>
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
                ? "bg-white hover:bg-cyan-50"
                : "bg-gray-50 hover:bg-gray-100"
            }
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: handleExpandRow,
            }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default DepartmentPage;
