import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  message,
  Typography,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Alert,
  Popconfirm,
  Checkbox,
  Tooltip,
} from "antd";
import {
  UserSwitchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import {
  assignToDepartment,
  getDepartmentById,
  removeFromDepartment,
  getAllUsers,
} from "../../services/departmentServices";

const { Title, Text } = Typography;
const { Option } = Select;

const AssignDepartment = () => {
  const [form] = Form.useForm();
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersToRemove, setSelectedUsersToRemove] = useState([]);

  // Fetch department and users data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptData, usersData] = await Promise.all([
          getDepartmentById(departmentId),
          getAllUsers(),
        ]);
        setDepartment(deptData);

        // Filter out users with roleId 8 (AOC Manager)
        const nonAocUsers = usersData.filter(user => user.roleId !== 8);
        
        // Filter users by matching specialty, and only show users with:
        // - No department assigned, OR
        // - Same department as current page
        const filteredUsers = nonAocUsers.filter(
          (user) => 
            user.specialtyId === deptData.specialtyId && 
            (!user.departmentId || user.departmentId === departmentId)
        );
        
        setUsers(filteredUsers);
        console.log("Department:", deptData);
        console.log("Filtered Users (excluding AOC role, only from this department):", filteredUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [departmentId]);

  const handleUserSelect = (userId) => {
    console.log("Selected User ID:", userId);
    const user = users.find((u) => u.userId === userId);
    console.log("Found User:", user);
    setSelectedUser(user);
  };

  const handleSubmit = async (values) => {
    console.log("Submit Values:", values);
    console.log("Selected User:", selectedUser);

    if (!selectedUser) {
      message.warning("Please select a user");
      return;
    }

    if (selectedUser.specialtyId !== department.specialtyId) {
      message.error("User specialty does not match department specialty");
      return;
    }

    // Check if user already has a department that's different from current
    if (selectedUser.departmentId && selectedUser.departmentId !== departmentId) {
      message.error("User is already assigned to another department");
      return;
    }

    try {
      setLoading(true);
      await assignToDepartment(departmentId, values.userId);
      message.success("User assigned successfully");

      // Reload data after assignment
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers(),
      ]);
      setDepartment(deptData);
      
      // Filter out AOC users and apply specialty & department filters
      const nonAocUsers = usersData.filter(user => user.roleId !== 8);
      const filteredUsers = nonAocUsers.filter(
        (user) => 
          user.specialtyId === deptData.specialtyId && 
          (!user.departmentId || user.departmentId === departmentId)
      );
      
      setUsers(filteredUsers);

      // Reset form and selected user
      form.resetFields();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error assigning user:", error);
      message.error("Failed to assign user");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    // Find the user object
    const user = users.find(u => u.userId === userId);
    
    // Check if user belongs to this department
    if (user.departmentId !== departmentId) {
      message.error("Cannot remove user from a different department");
      return;
    }
    
    try {
      setLoading(true);
      await removeFromDepartment(userId);
      message.success("User removed from department successfully");

      // Reload data after removal
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers(),
      ]);
      setDepartment(deptData);
      
      // Filter out AOC users and apply specialty & department filters
      const nonAocUsers = usersData.filter(user => user.roleId !== 8);
      const filteredUsers = nonAocUsers.filter(
        (user) => 
          user.specialtyId === deptData.specialtyId && 
          (!user.departmentId || user.departmentId === departmentId)
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error removing user:", error);
      message.error("Failed to remove user from department");
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleAssign = async () => {
    // Check if any selected users are already assigned to a different department
    const invalidUsers = users.filter(user => 
      selectedUsers.includes(user.userId) && 
      user.departmentId && 
      user.departmentId !== departmentId
    );
    
    if (invalidUsers.length > 0) {
      message.error("Some selected users are already assigned to other departments");
      return;
    }
    
    try {
      setLoading(true);
      // Assign multiple users
      await Promise.all(
        selectedUsers.map((userId) => assignToDepartment(departmentId, userId))
      );
      message.success("Users assigned successfully");

      // Reload data
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers(),
      ]);
      setDepartment(deptData);
      
      // Filter out AOC users and apply specialty & department filters
      const nonAocUsers = usersData.filter(user => user.roleId !== 8);
      const filteredUsers = nonAocUsers.filter(
        (user) => 
          user.specialtyId === deptData.specialtyId && 
          (!user.departmentId || user.departmentId === departmentId)
      );
      
      setUsers(filteredUsers);
      setSelectedUsers([]); // Reset selection
    } catch (error) {
      console.error("Error assigning users:", error);
      message.error("Failed to assign users");
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleRemove = async () => {
    // Check if any selected users belong to a different department
    const invalidUsers = users.filter(user => 
      selectedUsersToRemove.includes(user.userId) && 
      user.departmentId !== departmentId
    );
    
    if (invalidUsers.length > 0) {
      message.error("Cannot remove users from a different department");
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all(
        selectedUsersToRemove.map((userId) => removeFromDepartment(userId))
      );
      message.success("Users removed successfully");

      // Reload data
      const [deptData, usersData] = await Promise.all([
        getDepartmentById(departmentId),
        getAllUsers(),
      ]);
      setDepartment(deptData);
      
      // Filter out AOC users and apply specialty & department filters
      const nonAocUsers = usersData.filter(user => user.roleId !== 8);
      const filteredUsers = nonAocUsers.filter(
        (user) => 
          user.specialtyId === deptData.specialtyId && 
          (!user.departmentId || user.departmentId === departmentId)
      );
      
      setUsers(filteredUsers);
      setSelectedUsersToRemove([]); // Reset selection
    } catch (error) {
      console.error("Error removing users:", error);
      message.error("Failed to remove users");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: () => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={
              users.length > 0 &&
              users.every((u) =>
                !u.departmentId
                  ? selectedUsers.includes(u.userId)
                  : selectedUsersToRemove.includes(u.userId)
              )
            }
            indeterminate={
              (selectedUsers.length > 0 || selectedUsersToRemove.length > 0) &&
              !users.every((u) =>
                !u.departmentId
                  ? selectedUsers.includes(u.userId)
                  : selectedUsersToRemove.includes(u.userId)
              )
            }
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                // Select all
                const availableUsers = users
                  .filter((u) => !u.departmentId)
                  .map((u) => u.userId);
                const assignedUsers = users
                  .filter((u) => u.departmentId === departmentId)
                  .map((u) => u.userId);
                setSelectedUsers(availableUsers);
                setSelectedUsersToRemove(assignedUsers);
              } else {
                // Deselect all
                setSelectedUsers([]);
                setSelectedUsersToRemove([]);
              }
            }}
          />
          <span style={{ marginLeft: "8px" }}>Select</span>
        </div>
      ),
      key: "select",
      width: "5%",
      render: (_, record) => (
        <Checkbox
          checked={
            record.departmentId
              ? selectedUsersToRemove.includes(record.userId)
              : selectedUsers.includes(record.userId)
          }
          onChange={(e) => {
            if (record.departmentId) {
              // Only allow removal if department matches
              if (record.departmentId !== departmentId) {
                message.warning("Cannot remove user from a different department");
                return;
              }
              
              // Handle for remove
              if (e.target.checked) {
                setSelectedUsersToRemove((prev) => [...prev, record.userId]);
              } else {
                setSelectedUsersToRemove((prev) =>
                  prev.filter((id) => id !== record.userId)
                );
              }
            } else {
              // Handle for assign
              if (e.target.checked) {
                setSelectedUsers((prev) => [...prev, record.userId]);
              } else {
                setSelectedUsers((prev) =>
                  prev.filter((id) => id !== record.userId)
                );
              }
            }
          }}
          disabled={record.departmentId && record.departmentId !== departmentId}
        />
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: "12%",
      sorter: (a, b) => a.userId.localeCompare(b.userId),
    },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      width: "18%",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "22%",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: "12%",
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
      render: (roleName) => (
        <Tag color="purple">
          {roleName}
        </Tag>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialtyId",
      key: "specialtyId",
      width: "12%",
      sorter: (a, b) => a.specialtyId.localeCompare(b.specialtyId),
      render: (specialtyId) => (
        <Tag color={specialtyId === department?.specialtyId ? "green" : "red"}>
          {specialtyId}
          {specialtyId === department?.specialtyId && (
            <CheckCircleOutlined style={{ marginLeft: 8 }} />
          )}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "departmentStatus",
      width: "10%",
      sorter: (a, b) => (a.departmentId ? 1 : 0) - (b.departmentId ? 1 : 0),
      render: (_, record) => (
        <Tag color={record.departmentId ? "blue" : "orange"}>
          {record.departmentId ? 
            (record.departmentId === departmentId ? "Assigned" : "Other Dept") 
            : "Available"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "13%",
      render: (_, record) => (
        <Space>
          {!record.departmentId ? (
            <Button
              type="primary"
              onClick={() => {
                form.setFieldsValue({ userId: record.userId });
                handleUserSelect(record.userId);
              }}
              size="middle"
              icon={<UserSwitchOutlined />}
            >
              Assign
            </Button>
          ) : record.departmentId === departmentId ? (
            <Popconfirm
              title="Remove from Department"
              description="Are you sure you want to remove this user?"
              onConfirm={() => handleRemoveUser(record.userId)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="middle">
                Remove
              </Button>
            </Popconfirm>
          ) : (
            <Tooltip title="User belongs to another department">
              <Button disabled icon={<InfoCircleOutlined />} size="middle">
                Cannot Remove
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Row justify="center">
        <Col xs={24} xl={20}>
          <Card className="shadow-xl rounded-lg">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <Space align="start">
                  <Title level={2} className="mb-0 flex items-center">
                    <UserSwitchOutlined className="mr-3" />
                    Assign User to Department
                  </Title>
                  {department && (
                    <Tag
                      color="blue"
                      style={{ fontSize: "16px", padding: "4px 12px" }}
                    >
                      <TeamOutlined className="mr-2" />
                      {department.departmentName}
                    </Tag>
                  )}
                </Space>
                <Button type="link" onClick={() => navigate("/department")}>
                  Back to Departments
                </Button>
              </div>

              {/* Department Info */}
              {department && (
                <Alert
                  message="Department Information"
                  description={
                    <Space direction="vertical">
                      <Text>
                        Department ID:{" "}
                        <strong>{department.departmentId}</strong>
                      </Text>
                      <Text>
                        Specialty ID: <strong>{department.specialtyId}</strong>
                      </Text>
                      <Text type="secondary">
                        Only users with matching specialty can be assigned (AOC Manager excluded)
                      </Text>
                      <Text type="secondary">
                        Users can only be removed from the current department
                      </Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                />
              )}

              {/* User Selection Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
              >
                <Form.Item
                  name="userId"
                  label="Select User"
                  rules={[{ required: true, message: "Please select a user" }]}
                >
                  <Select
                    placeholder="Select a user to assign"
                    onChange={handleUserSelect}
                    style={{ width: "100%" }}
                    showSearch
                    allowClear
                    filterOption={(input, option) => {
                      const childrenText =
                        option?.children?.toString().toLowerCase() || "";
                      const searchText = input.toLowerCase();
                      return childrenText.includes(searchText);
                    }}
                  >
                    {users
                      .filter(user => !user.departmentId || user.departmentId === departmentId)
                      .map((user) => (
                        <Option key={user.userId} value={user.userId}>
                          {user.fullName} - {user.email} ({user.roleName})
                        </Option>
                      ))
                    }
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!selectedUser}
                    size="large"
                    style={{
                      backgroundColor: "#1890ff",
                      width: "200px",
                      height: "40px",
                    }}
                  >
                    Assign User
                  </Button>
                </Form.Item>
              </Form>

              {/* Users Table */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4}>Available Users (Excluding AOC Manager)</Title>
                  <Space>
                    {selectedUsersToRemove.length > 0 && (
                      <Button
                        danger
                        type="primary"
                        onClick={handleMultipleRemove}
                        loading={loading}
                        icon={<DeleteOutlined />}
                      >
                        Remove Selected ({selectedUsersToRemove.length})
                      </Button>
                    )}
                    {selectedUsers.length > 0 && (
                      <Button
                        type="primary"
                        onClick={handleMultipleAssign}
                        loading={loading}
                        icon={<UserSwitchOutlined />}
                        style={{
                          backgroundColor: "#52c41a",
                          borderColor: "#52c41a",
                        }}
                      >
                        Assign Selected ({selectedUsers.length})
                      </Button>
                    )}
                  </Space>
                </div>
                <Table
                  columns={columns}
                  dataSource={users}
                  rowKey="userId"
                  loading={loading}
                  pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Total ${total} users`,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                  }}
                  className="shadow-lg rounded-lg overflow-hidden"
                  scroll={{ x: 1200 }}
                  rowClassName={(record) => {
                    if (record.departmentId) {
                      if (record.departmentId !== departmentId) {
                        return "bg-gray-200"; // Different department
                      }
                      return selectedUsersToRemove.includes(record.userId)
                        ? "bg-red-50"
                        : "bg-gray-50";
                    }
                    return selectedUsers.includes(record.userId)
                      ? "bg-blue-50"
                      : "";
                  }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssignDepartment;
