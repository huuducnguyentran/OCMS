import { useState, useEffect } from "react";
import {
  Popconfirm,
  Layout,
  Card,
  Tag,
  Button,
  Spin,
  Empty,
  message,
  Typography,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Row,
  Col,
  Pagination,
} from "antd";
import {
  PlusOutlined,
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

const { Title, Text, Paragraph } = Typography;

const RequestTypeEnum = {
  NewCourse: 1,
  UpdateCourse: 2,
  DeleteCourse: 18,
};

const RequestTypeLabels = {
  [RequestTypeEnum.NewCourse]: "New Course",
  [RequestTypeEnum.UpdateCourse]: "Update Course",
  [RequestTypeEnum.DeleteCourse]: "Delete Course",
};

const ITEMS_PER_PAGE = 6;

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestForm] = Form.useForm();
  const [selectedCourseForRequest, setSelectedCourseForRequest] =
    useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const isReviewer = userRole === "Reviewer";
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCourses();
    const role = sessionStorage.getItem("role");
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchCourses();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const removeDuplicateCourses = (coursesToFilter) => {
    const uniqueCourses = [];
    const seen = new Set();
    coursesToFilter.forEach((course) => {
      if (!seen.has(course.courseId)) {
        seen.add(course.courseId);
        uniqueCourses.push(course);
      }
    });
    return uniqueCourses;
  };

  useEffect(() => {
    let currentCourses = courses;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      currentCourses = courses.filter(
        (course) =>
          course.courseName.toLowerCase().includes(searchLower) ||
          course.courseId.toLowerCase().includes(searchLower) ||
          (course.status && course.status.toLowerCase().includes(searchLower))
      );
    }
    const uniqueFiltered = removeDuplicateCourses(currentCourses);
    setFilteredCourses(uniqueFiltered);
    setCurrentPage(1);
  }, [courses, searchText]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      const coursesData = response.data || [];
      const uniqueCoursesData = removeDuplicateCourses(coursesData);
      setCourses(uniqueCoursesData);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "green";
      case "Pending": return "gold";
      case "Rejected": return "red";
      default: return "default";
    }
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case "Completed": return "green";
      case "Ongoing": return "processing";
      case "NotStarted": return "default";
      default: return "default";
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handleRequest = (course) => {
    setSelectedCourseForRequest(course);
    requestForm.resetFields();
    setRequestModalVisible(true);
  };

  const handleRequestSubmit = async () => {
    try {
      const values = await requestForm.validateFields();
      setSubmitting(true);
      const requestData = {
        requestEntityId: selectedCourseForRequest.courseId,
        requestType: values.requestType,
        description: values.description,
        notes: values.notes,
      };
      await createRequest(requestData);
      message.success(
        `Request sent for course: ${selectedCourseForRequest.courseName}`
      );
      setRequestModalVisible(false);
    } catch (error) {
      console.error("Failed to send request:", error);
      message.error("Failed to send request for this course");
    } finally {
      setSubmitting(false);
    }
  };

  const indexOfLastCourse = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstCourse = indexOfLastCourse - ITEMS_PER_PAGE;
  const currentDisplayCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderSearchBox = () => (
    <div className="mb-6">
      <Input
        placeholder="Search by course name, ID, or status..."
        value={searchText}
        onChange={handleSearch}
        allowClear
        style={{ width: "100%" }}
        prefix={<SearchOutlined className="!text-cyan-700" />}
        className="!rounded-lg !border !border-cyan-700 focus:!border-cyan-800 focus:!ring-cyan-700"
      />
    </div>
  );

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100 !p-6 !sm:p-8">
      <Layout.Content className="!max-w-7xl !mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="!m-0 !text-cyan-900">
              Course Management
            </Title>
            <Text className="!text-cyan-700">
              View and manage your training courses
            </Text>
          </div>
          <div className="flex space-x-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCourses}
              loading={loading}
              className="!border-cyan-400 !text-cyan-700 hover:!text-cyan-900 hover:!border-cyan-600"
            >
              Refresh
            </Button>
            {!isReviewer && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/course/create")}
                className="!bg-cyan-700 hover:!bg-cyan-800 !border-0"
              >
                Create New Course
              </Button>
            )}
          </div>
        </div>

        {renderSearchBox()}

        <Spin spinning={loading}>
          {filteredCourses.length === 0 && !loading ? (
            <Card className="!shadow-md !rounded-lg !h-full !flex !items-center !justify-center !bg-white !border !border-cyan-100">
                  <Empty
                description={searchText ? "No courses matching your search" : "No courses available"}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {currentDisplayCourses.map((course) => (
                <Col key={course.courseId} xs={24} sm={12} md={8}>
                <Card
                    hoverable
                    className="!rounded-lg !shadow-md hover:!shadow-xl !transition-shadow !border !border-cyan-200 h-full flex flex-col"
                    title={<Tooltip title={course.courseName}><Text ellipsis className="text-cyan-700 font-semibold text-lg">{course.courseName}</Text></Tooltip>}
                    extra={<Tag color={getStatusColor(course.status)}>{course.status}</Tag>}
                    actions={[
                      <Tooltip title="View Details" key={`view-${course.courseId}`}>
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/course/${course.courseId}`)} className="text-blue-500 hover:text-blue-700" />
                      </Tooltip>,
                      <Tooltip title="Send Request" key={`request-${course.courseId}`}>
                         <Button type="text" icon={<SendOutlined />} onClick={() => handleRequest(course)} className="text-green-500 hover:text-green-700" />
                      </Tooltip>,
                    ]}
                  >
                    <div className="flex-grow">
                        <Paragraph><Text strong>ID:</Text> {course.courseId}</Paragraph>
                        <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                            <Text strong>Description:</Text> {course.description || "N/A"}
                        </Paragraph>
                        <Paragraph><Text strong>Level:</Text> {course.courseLevel}</Paragraph>
                        <Paragraph><Text strong>Progress:</Text> <Tag color={getProgressColor(course.progress)}>{course.progress}</Tag></Paragraph>
                    </div>
                    <Text type="secondary" className="block text-xs mt-auto pt-2 border-t border-gray-100">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                    </Text>
                </Card>
                </Col>
              ))}
            </Row>
          )}
          {filteredCourses.length > ITEMS_PER_PAGE && (
            <div className="mt-8 flex justify-center">
              <Pagination
                current={currentPage}
                total={filteredCourses.length}
                pageSize={ITEMS_PER_PAGE}
                onChange={paginate}
                showSizeChanger={false}
              />
            </div>
          )}
        </Spin>
      </Layout.Content>

      <Modal
        title={
          <span className="!text-cyan-700 !font-semibold">
            Send Request for Course: {selectedCourseForRequest?.courseName || ""}
          </span>
        }
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRequestModalVisible(false)} className="!rounded-md !border !border-cyan-700 !text-cyan-700 hover:!bg-cyan-50">
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={submitting} onClick={handleRequestSubmit} className="!bg-cyan-700 hover:!bg-cyan-800 !border-cyan-700">
            Submit Request
          </Button>,
        ]}
        width={600}
        className="!rounded-lg"
      >
        <Form form={requestForm} layout="vertical" initialValues={{ requestType: RequestTypeEnum.UpdateCourse }}>
          <Form.Item name="requestType" label={<span className="!text-cyan-800">Request Type</span>} rules={[{ required: true, message: "Please select a request type" }]}>
            <Select placeholder="Select request type">
              {Object.entries(RequestTypeLabels).map(([value, label]) => (
                <Select.Option key={value} value={Number(value)}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label={<span className="!text-cyan-800">Description</span>} rules={[{ required: true, message: "Please enter a description" }]}>
            <Input.TextArea rows={4} placeholder="Enter request description" maxLength={100} className="!border-cyan-700 focus:!border-cyan-800 focus:!ring-cyan-700" />
          </Form.Item>
          <Form.Item name="notes" label={<span className="!text-cyan-800">Notes</span>} rules={[{ required: true, message: "Please enter notes" }]}>
            <Input.TextArea rows={3} placeholder="Additional notes" maxLength={100} className="!border-cyan-700 focus:!border-cyan-800 focus:!ring-cyan-700" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default CoursePage;
