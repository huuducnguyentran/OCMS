import { useState, useEffect } from "react";
import {
  Popconfirm,
  Layout,
  Card,
  Table,
  Tag,
  Button,
  Spin,
  Tabs,
  Collapse,
  List,
  Avatar,
  Empty,
  message,
  Typography,
  Tooltip,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  SendOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { createRequest } from "../../services/requestService";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

const RequestTypeEnum = {
  NewCourse: 1,
  UpdateCourse: 2,
  DeleteCourse: 18
};

const RequestTypeLabels = {
  [RequestTypeEnum.NewCourse]: "New Course",
  [RequestTypeEnum.UpdateCourse]: "Update Course",
  [RequestTypeEnum.DeleteCourse]: "Delete Course"
};

const CoursePage = () => {
  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [sortedInfo, setSortedInfo] = useState({});
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestForm] = Form.useForm();
  const [selectedCourseForRequest, setSelectedCourseForRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const isReviewer = userRole === "Reviewer";

  // Fetch data on mount and when refreshed
  useEffect(() => {
    fetchCourses();
    // Lấy role người dùng từ sessionStorage
    const role = sessionStorage.getItem("role");
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchCourses();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Effect để lọc khóa học khi có thay đổi về dữ liệu hoặc từ khóa tìm kiếm
  useEffect(() => {
    if (!searchText) {
      setFilteredCourses(courses);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = courses.filter(
        course => 
          course.courseName.toLowerCase().includes(searchLower) ||
          course.courseId.toLowerCase().includes(searchLower) ||
          (course.status && course.status.toLowerCase().includes(searchLower))
      );
      setFilteredCourses(filtered);
    }
  }, [courses, searchText]);

  // API calls
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      console.log("Courses data:", response);
      const coursesData = response.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);

      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "green";
      case "Pending":
        return "gold";
      case "Rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case "Completed":
        return "green";
      case "Ongoing":
        return "processing";
      case "NotStarted":
        return "default";
      default:
        return "default";
    }
  };

  // Handler cho ô tìm kiếm
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Hàm xử lý xóa từ khóa tìm kiếm
  const handleClearSearch = () => {
    setSearchText("");
  };

  // Thêm hàm xử lý thay đổi sorting
  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };
  const handleDelete = async (courseId) => {
    try {
      await courseService.deleteCourse(courseId);
      message.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      
      // Hiển thị thông báo lỗi từ API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.message && errorData.error) {
          message.error(`${errorData.message} ${errorData.error}`);
        } else if (errorData.message) {
          message.error(errorData.message);
        } else if (errorData.error) {
          message.error(errorData.error);
        } else {
          message.error("Failed to delete course");
        }
      } else {
        message.error(`Failed to delete course: ${error.message || "Unknown error"}`);
      }
    }
  };


  // Thêm hàm xử lý request
  const handleRequest = (course) => {
    setSelectedCourseForRequest(course);
    requestForm.resetFields();
    setRequestModalVisible(true);
  };

  const handleRequestSubmit = async () => {
    try {
      const values = await requestForm.validateFields();
      setSubmitting(true);

      // Tạo dữ liệu cho request
      const requestData = {
        requestEntityId: selectedCourseForRequest.courseId,
        requestType: values.requestType,
        description: values.description,
        notes: values.notes
      };

      // Gọi API tạo request từ requestService
      await createRequest(requestData);
      
      message.success(`Request sent for course: ${selectedCourseForRequest.courseName}`);
      setRequestModalVisible(false);
    } catch (error) {
      console.error("Failed to send request:", error);
      message.error("Failed to send request for this course");
    } finally {
      setSubmitting(false);
    }
  };

  // Table configuration
  const columns = [
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
      width: 120,
      sorter: (a, b) => a.courseId.localeCompare(b.courseId),
      sortOrder: sortedInfo.columnKey === 'courseId' && sortedInfo.order,
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
      sortOrder: sortedInfo.columnKey === 'courseName' && sortedInfo.order,
      render: (text, record) => (
        <a
          onClick={() => setSelectedCourse(record)}
          className="text-gray-700 hover:text-gray-900"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Level",
      dataIndex: "courseLevel",
      key: "courseLevel",
      width: 120,
      sorter: (a, b) => a.courseLevel - b.courseLevel,
      sortOrder: sortedInfo.columnKey === 'courseLevel' && sortedInfo.order,
      render: (level) => {
        const levels = ["Initial", "Recurrent", "Relearn"];
        return levels[level] || level;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded-full px-3 py-1">
          {status}
        </Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 120,
      sorter: (a, b) => a.progress.localeCompare(b.progress),
      sortOrder: sortedInfo.columnKey === 'progress' && sortedInfo.order,
      render: (progress) => (
        <Tag
          color={getProgressColor(progress)}
          className="rounded-full px-3 py-1"
        >
          {progress}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => {
        // Ẩn các nút hành động nếu là Reviewer
        if (isReviewer) {
          return (
            <div className="flex space-x-2">
              <Tooltip title="View Details">
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => setSelectedCourse(record)}
                  className="bg-gray-600 hover:bg-gray-700 border-0"
                />
              </Tooltip>
            </div>
          );
        }
        
        return (
          <div className="flex space-x-2">
            <Tooltip title="View Details">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setSelectedCourse(record)}
                className="bg-gray-600 hover:bg-gray-700 border-0"
              />
            </Tooltip>
            {record.status !== "Approved" && (
            <Tooltip title="Edit">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/course/edit/${record.courseId}`)}
                className="text-gray-600 hover:text-gray-700"
              />
            </Tooltip>
          )}
          {record.status !== "Approved" && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this course?"
                onConfirm={() => handleDelete(record.courseId)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  className="text-gray-600 hover:text-gray-700"
                />
              </Popconfirm>
            </Tooltip>
          )}
            <Tooltip title="Send Request">
              <Button
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleRequest(record)}
                className="text-blue-600 hover:text-blue-700"
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Tab items configuration - Cách mới thay vì sử dụng TabPane
  const getTabItems = () => {
    if (!selectedCourse) return [];

    return [
      {
        key: "1",
        label: (
          <span className="flex items-center">
            <FileTextOutlined className="mr-1" />
            Overview
          </span>
        ),
        children: (
          <div className="space-y-6">
            {/* Status and Actions Row */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <Tag
                  color={getStatusColor(selectedCourse.status)}
                  className="px-4 py-2 text-base"
                >
                  {selectedCourse.status}
                </Tag>
              </div>
              {!isReviewer && (
                <div className="flex space-x-3">
                {selectedCourse.status !== "Approved" && (
                  <Button
                  type="#"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/course/edit/${selectedCourse.courseId}`)}
                    className="flex items-center  "
                  >
                    Edit
                  </Button>
                  )}
                  {selectedCourse.status !== "Approved" && (
                  <Button
                  type="#"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(selectedCourse.courseId)}
                    className="flex items-center"
                  >
                    Delete
                  </Button>         
                  )}
                  
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => handleRequest(selectedCourse)}
                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                  >
                    Send Request
                  </Button>
                </div>
              )}
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-4">
                <Statistic
                  title="Course ID"
                  value={selectedCourse.courseId}
                  className="bg-gray-50 p-4 rounded-lg"
                />
                <Statistic
                  title="Course Related ID"
                  value={selectedCourse.courseRelatedId}
                  className="bg-gray-50 p-4 rounded-lg"
                />
                <Statistic
                  title="Level"
                  value={
                    ["Initial", "Recurrent", "Relearn"][
                      selectedCourse.courseLevel
                    ] || selectedCourse.courseLevel
                  }
                  className="bg-gray-50 p-4 rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <Statistic
                  title="Progress"
                  value={selectedCourse.progress}
                  valueStyle={{
                    color:
                      selectedCourse.progress === "Ongoing"
                        ? "#1677ff"
                        : selectedCourse.progress === "Completed"
                        ? "#52c41a"
                        : "#8c8c8c",
                  }}
                  className="bg-gray-50 p-4 rounded-lg"
                />
                <Statistic
                  title="Created By"
                  value={selectedCourse.createdByUserId || "N/A"}
                  className="bg-gray-50 p-4 rounded-lg"
                />
                <Statistic
                  title="Created At"
                  value={new Date(selectedCourse.createdAt).toLocaleString()}
                  className="bg-gray-50 p-4 rounded-lg"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <span className="flex items-center">
            <BookOutlined className="mr-1" />
            Subjects
            <span className="ml-2 text-gray-500">
              ({selectedCourse.subjects?.length || 0})
            </span>
          </span>
        ),
        children:
          selectedCourse.subjects?.length > 0 ? (
            <Collapse
              accordion
              bordered={false}
              className="bg-white custom-collapse"
            >
              {selectedCourse.subjects.map((subject) => (
                <Panel
                  header={
                    <div className="flex justify-between items-center">
                      <Text strong>{subject.subjectName}</Text>
                      <Tag color="default" className="rounded-full px-3 py-1">
                        {subject.credits} Credits
                      </Tag>
                    </div>
                  }
                  key={subject.subjectId}
                  className="mb-2 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="space-y-3 p-2">
                    <Paragraph>
                      <Text strong>ID:</Text> {subject.subjectId}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Description:</Text> {subject.description}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Passing Score:</Text> {subject.passingScore}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Created:</Text>{" "}
                      {new Date(subject.createdAt).toLocaleString()}
                    </Paragraph>
                    <div className="flex justify-end mt-4">
                      <Button
                        type="primary"
                        size="small"
                        className="bg-gray-600 hover:bg-gray-700 border-0"
                      >
                        View Subject
                      </Button>
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Empty
              description="No subjects available for this course"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            />
          ),
      },
      {
        key: "3",
        label: (
          <span className="flex items-center">
            <TeamOutlined className="mr-1" />
            Trainees
            <span className="ml-2 text-gray-500">
              ({selectedCourse.trainees?.length || 0})
            </span>
          </span>
        ),
        children:
          selectedCourse.trainees?.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={selectedCourse.trainees}
              renderItem={(trainee) => (
                <List.Item
                  actions={[
                    <Tag
                      key="requestStatus"
                      color={getStatusColor(trainee.requestStatus)}
                      className="rounded-full px-3 py-1"
                    >
                      {trainee.requestStatus}
                    </Tag>,
                  ]}
                  className="hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<TeamOutlined />} className="bg-gray-400" />
                    }
                    title={<Text strong>{trainee.traineeId}</Text>}
                    description={`Assigned on: ${new Date(
                      trainee.assignDate
                    ).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
              className="custom-list"
            />
          ) : (
            <Empty
              description="No trainees assigned to this course"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            />
          ),
      },
    ];
  };

  // Thêm component Modal
  const renderRequestModal = () => {
    return (
      <Modal
        title={`Send Request for Course: ${selectedCourseForRequest?.courseName || ""}`}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        onOk={handleRequestSubmit}
        confirmLoading={submitting}
        okText="Submit Request"
        width={600}
      >
        <Form
          form={requestForm}
          layout="vertical"
          initialValues={{ requestType: RequestTypeEnum.UpdateCourse }}
        >
          <Form.Item
            name="requestType"
            label="Request Type"
            rules={[{ required: true, message: "Please select a request type" }]}
          >
            <Select placeholder="Select request type">
              {Object.entries(RequestTypeLabels).map(([value, label]) => (
                <Select.Option key={value} value={Number(value)}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter request description" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            rules={[{ required: true, message: "Please enter notes" }]}
          >
            <Input.TextArea rows={3} placeholder="Additional notes" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Thêm component tìm kiếm
  const renderSearchBox = () => (
    <div className="mb-4">
      <Input
        placeholder="Search by course name, ID, or status..."
        value={searchText}
        onChange={handleSearch}
        allowClear
        style={{ width: "100%" }}
        suffix={
          <Space>
            {searchText && (
              <Button
                type="text"
                icon={<SearchOutlined />}
                size="small"
                onClick={handleClearSearch}
              />
            )}
          </Space>
        }
        prefix={<SearchOutlined className="text-gray-400" />}
        className="rounded-lg"
      />
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <Layout.Content className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="m-0 text-gray-800">
              Course Management
            </Title>
            <Text className="text-gray-500">
              View and manage your training courses
            </Text>
          </div>
          <div className="flex space-x-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCourses}
              loading={loading}
              className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
            >
              Refresh
            </Button>
            {!isReviewer && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/course/create")}
                className="bg-gray-700 hover:bg-gray-800 border-0"
              >
                Create New Course
              </Button>
            )}
          </div>
        </div>

        <Spin spinning={loading}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Courses List - Left Column */}
            <div className="lg:col-span-1">
              <Card
                title={
                  <Title level={4} className="m-0">
                    Courses
                  </Title>
                }
                className="h-full shadow-md rounded-lg overflow-hidden"
                extra={
                  <Text className="text-gray-500">Total: {filteredCourses.length}</Text>
                }
              >
                {renderSearchBox()}
                
                {filteredCourses.length === 0 ? (
                  <Empty
                    description={searchText ? "No courses matching your search" : "No courses available"}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Table
                    columns={columns.filter((col) =>
                      ["courseId", "courseName", "status"].includes(col.key)
                    )}
                    dataSource={filteredCourses}
                    rowKey="courseId"
                    pagination={{ pageSize: 5 }} // limit to 5 items per page
                    size="small"
                    scroll={{ x: "max-content" }} // enable horizontal scroll
                    onRow={(record) => ({
                      onClick: () => setSelectedCourse(record),
                      className: `cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCourse?.courseId === record.courseId
                          ? "bg-gray-100"
                          : ""
                      }`,
                    })}
                    className="custom-table"
                  />
                )}
              </Card>
            </div>

            {/* Course Details - Right Column */}
            <div className="lg:col-span-2">
              {selectedCourse ? (
                <Card
                  title={
                    <div className="flex items-center">
                      <Title level={4} className="m-0 mr-3">
                        {selectedCourse.courseName}
                      </Title>
                      <Tag
                        color={getStatusColor(selectedCourse.status)}
                        className="rounded-full px-3 py-1"
                      >
                        {selectedCourse.status}
                      </Tag>
                    </div>
                  }
                  
                >
                  {/* Thay đổi cách sử dụng Tabs để không dùng TabPane */}
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    items={getTabItems()}
                  />
                </Card>
              ) : (
                <Card className="shadow-md rounded-lg h-full flex items-center justify-center">
                  <Empty
                    description="Select a course to view details"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              )}
            </div>
          </div>

          <Card
            title={
              <Title level={4} className="m-0">
                All Courses
              </Title>
            }
            className="!mt-6 shadow-md rounded-lg overflow-hidden"
            extra={
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setSortedInfo({})}
                  size="small"
                  className="border-gray-300 text-gray-600"
                >
                  Clear Sorting
                </Button>
                <Text className="mr-2">Total: {filteredCourses.length}</Text>
                <Button
                  icon={<ReloadOutlined />}
                  size="small"
                  onClick={fetchCourses}
                  loading={loading}
                  className="border-gray-300 text-gray-600"
                />
              </div>
            }
          >
            {renderSearchBox()}
            
            <Table
              columns={columns}
              dataSource={filteredCourses}
              rowKey="courseId"
              pagination={{ pageSize: 10 }}
              onChange={handleChange}
              rowClassName={(record) =>
                `hover:bg-gray-50 transition-colors ${
                  selectedCourse?.courseId === record.courseId
                    ? "bg-gray-100"
                    : ""
                }`
              }
              scroll={{ x: true }}
              bordered
              className="custom-table"
            />
          </Card>
        </Spin>
      </Layout.Content>

      {/* Thêm Modal vào cuối component */}
      {renderRequestModal()}
    </Layout>
  );
};

export default CoursePage;
