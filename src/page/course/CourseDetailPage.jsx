import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Button,
  Image,
  Spin,
  Empty,
  message,
  Typography,
  Tag,
  Row,
  Col,
  Descriptions,
  Tabs,
  List,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Tooltip,
  Space,
  Pagination,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  PlusOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { courseService } from "../../services/courseService";
import { createRequest } from "../../services/requestService";
import { specialtyService } from "../../services/specialtyServices"; // Assuming this is how you get all specialties
import { getAllSubjectSpecialties } from "../../services/subjectSpecialtyServices";


import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs; // Using TabPane for clarity if needed, or items prop for newer AntD

// Enums from CoursePage (or define globally if shared)
const RequestTypeEnum = {
  NewCourse: 1,
  UpdateCourse: 2,
  DeleteCourse: 18,
};

const RequestTypeLabels = {
  [RequestTypeEnum.UpdateCourse]: "Update Course",
  [RequestTypeEnum.DeleteCourse]: "Delete Course",
};

const CourseDetailPage = () => {
  const { courseId } = useParams(); // Changed from id to courseId to match API and typical naming
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const isReviewer = userRole === "Reviewer";

  // States for "Send Request" Modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestForm] = Form.useForm();
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // States for "Assign Subject Specialty" Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignForm] = Form.useForm();
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [allSubjectSpecialtiesForDropdown, setAllSubjectSpecialtiesForDropdown] = useState([]);
  const [loadingSpecialtiesForDropdown, setLoadingSpecialtiesForDropdown] = useState(false);

  // States for Subject Specialty Pagination in Tab
  const [subjectSpecialtyCurrentPage, setSubjectSpecialtyCurrentPage] = useState(1);
  const SUBJECT_SPECIALTY_PAGE_SIZE = 3; // Or any other number you prefer

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    setUserRole(role);
    if (courseId) {
      fetchCourseDetails(courseId);
    } else {
      setError("Course ID is missing.");
      setLoading(false);
    }
  }, [courseId]);

  const fetchCourseDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourseById(id);
      if (response.success && response.data) {
        setCourse(response.data);
      } else {
        setError(response.message || "Failed to retrieve course details.");
        message.error(response.message || "Failed to retrieve course details.");
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError(err.message || "An error occurred while fetching course details.");
      message.error(err.message || "An error occurred while fetching course details.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for actions
  const handleEdit = () => {
    navigate(`/course/edit/${courseId}`);
  };

  const handleDelete = async () => {
    try {
      await courseService.deleteCourse(courseId);
      message.success("Course deleted successfully.");
      navigate("/all-courses", { state: { refresh: true } }); // Navigate back and refresh list
    } catch (err) {
      console.error("Failed to delete course:", err);
      message.error(err.response?.data?.message || err.message || "Failed to delete course.");
    }
  };

  const handleOpenRequestModal = () => {
    requestForm.resetFields();
    setRequestModalVisible(true);
  };

  const handleRequestSubmit = async () => {
    try {
      const values = await requestForm.validateFields();
      setSubmittingRequest(true);
      const requestData = {
        requestEntityId: course.courseId,
        requestType: values.requestType,
        description: values.description,
        notes: values.notes,
      };
      await createRequest(requestData);
      message.success("Request sent successfully.");
      setRequestModalVisible(false);
      fetchCourseDetails(courseId); // Refresh course details
    } catch (err) {
      console.error("Failed to send request:", err);
      message.error("Failed to send request.");
    } finally {
      setSubmittingRequest(false);
    }
  };
  
  const fetchAllSubjectSpecialtiesForModal = async () => {
    setLoadingSpecialtiesForDropdown(true);
    try {
      const response = await getAllSubjectSpecialties(); // Using the direct import
      let specialtiesData = [];
      if (Array.isArray(response)) {
        specialtiesData = response;
      } else if (response && Array.isArray(response.data)) {
        specialtiesData = response.data;
      } else if (response && Array.isArray(response.subjectSpecialties)) {
        specialtiesData = response.subjectSpecialties;
      }
      
      // Filter out already assigned subject specialties
      const assignedIds = new Set(course?.subjectSpecialties?.map(ss => ss.subjectSpecialtyId) || []);
      const availableSpecialties = specialtiesData.filter(s => !assignedIds.has(s.subjectSpecialtyId));

      setAllSubjectSpecialtiesForDropdown(availableSpecialties);
       if (availableSpecialties.length === 0 && specialtiesData.length > 0) {
        message.info("All available subject specialties are already assigned to this course or no new ones found.");
      } else if (specialtiesData.length === 0) {
        message.warn("No subject specialties found in the system to assign.");
      }

    } catch (error) {
      console.error("Error fetching subject specialties for dropdown:", error);
      message.error("Failed to load subject specialties for assignment.");
      setAllSubjectSpecialtiesForDropdown([]);
    } finally {
      setLoadingSpecialtiesForDropdown(false);
    }
  };


  const handleOpenAssignModal = () => {
    assignForm.resetFields();
    fetchAllSubjectSpecialtiesForModal();
    setAssignModalVisible(true);
  };

  const handleAssignSubjectSpecialtySubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      setSubmittingAssign(true);
      await courseService.assignSubjectSpecialty({
        courseId: course.courseId,
        subjectSpecialtyId: values.subjectSpecialtyId,
      });
      message.success("Subject specialty assigned successfully.");
      setAssignModalVisible(false);
      fetchCourseDetails(courseId); // Refresh course details
    } catch (err) {
      console.error("Failed to assign subject specialty:", err);
      message.error(err.response?.data?.message || err.message || "Failed to assign subject specialty.");
    } finally {
      setSubmittingAssign(false);
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

  if (loading) {
    return (
      <Layout className="!min-h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading course details..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="!min-h-screen flex flex-col justify-center items-center p-8">
        <Empty description={<Text type="danger">{`Error: ${error}`}</Text>} />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/all-courses")}
          className="mt-4"
        >
          Back to Courses
        </Button>
      </Layout>
    );
  }

  if (!course) {
  return (
      <Layout className="!min-h-screen flex flex-col justify-center items-center p-8">
        <Empty description="Course not found or details could not be loaded." />
            <Button
          type="primary"
              icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/all-courses")}
          className="mt-4"
            >
              Back to Courses
            </Button>
      </Layout>
    );
  }
  
  const subjectSpecialtyAlreadyAssigned = (subjectSpecialtyId) => {
    return course.subjectSpecialties?.some(ss => ss.subjectSpecialtyId === subjectSpecialtyId);
  };

  const overviewItems = [
    { key: "1", label: "Course ID", children: course.courseId, span: 1 },
    { key: "2", label: "Course Name", children: course.courseName, span: 2 },
    { key: "3", label: "Description", children: course.description || "N/A", span: 3 },
    { key: "4", label: "Related Course ID", children: course.courseRelatedId || "N/A", span: 1 },
    { key: "5", label: "Level", children: course.courseLevel, span: 1 },
    { key: "6", label: "Status", children: <Tag color={getStatusColor(course.status)}>{course.status}</Tag>, span: 1 },
    { key: "7", label: "Progress", children: <Tag color={getProgressColor(course.progress)}>{course.progress}</Tag>, span: 1 },
    { key: "8", label: "Created By", children: course.createdByUserId || "N/A", span: 1 },
    { key: "9", label: "Created At", children: dayjs(course.createdAt).format("YYYY-MM-DD HH:mm:ss"), span: 1 },
  ];

  const tabItems = [
    {
      key: "overview",
      label: (
        <span className="flex items-center">
          <FileTextOutlined className="mr-1" /> Overview
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }} layout="vertical" className="bg-white p-4 rounded-lg shadow">
          {overviewItems.map(item => (
            <Descriptions.Item key={item.key} label={item.label} span={item.span}>
              {item.children}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ),
    },
    {
      key: "subjectSpecialties",
      label: (
        <span className="flex items-center">
          <BookOutlined className="mr-1" /> Subject Specialties ({course.subjectSpecialties?.length || 0})
        </span>
      ),
      children: (
        <div className="bg-white p-4 rounded-lg shadow">
          {course.subjectSpecialties && course.subjectSpecialties.length > 0 ? (
            <>
              <List
                itemLayout="vertical"
                dataSource={course.subjectSpecialties.slice(
                  (subjectSpecialtyCurrentPage - 1) * SUBJECT_SPECIALTY_PAGE_SIZE,
                  subjectSpecialtyCurrentPage * SUBJECT_SPECIALTY_PAGE_SIZE
                )}
                renderItem={(ss) => (
                  <List.Item
                    key={ss.subjectSpecialtyId}
                    className="border !border-gray-200 !p-4 !mb-3 rounded-md hover:shadow-md transition-shadow"
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} className="!bg-cyan-600" />}
                      title={<Text strong className="text-cyan-700">{ss.subject?.subjectName || ss.subjectId}</Text>}
                      description={`Specialty: ${ss.specialty?.specialtyName || ss.specialtyId}`}
                    />
                    <Descriptions size="small" column={2}>
                      <Descriptions.Item label="SS ID">{ss.subjectSpecialtyId}</Descriptions.Item>
                      <Descriptions.Item label="Subject ID">{ss.subjectId}</Descriptions.Item>
                      <Descriptions.Item label="Specialty ID">{ss.specialtyId}</Descriptions.Item>
                      <Descriptions.Item label="Credits">{ss.subject?.credits}</Descriptions.Item>
                      <Descriptions.Item label="Passing Score">{ss.subject?.passingScore}</Descriptions.Item>
                    </Descriptions>
                  </List.Item>
                )}
              />
              {course.subjectSpecialties.length > SUBJECT_SPECIALTY_PAGE_SIZE && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={subjectSpecialtyCurrentPage}
                    pageSize={SUBJECT_SPECIALTY_PAGE_SIZE}
                    total={course.subjectSpecialties.length}
                    onChange={(page) => setSubjectSpecialtyCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty description="No subject specialties assigned to this course." />
          )}
        </div>
      ),
    },
    {
      key: "trainees",
      label: (
        <span className="flex items-center">
          <TeamOutlined className="mr-1" /> Trainees ({course.trainees?.length || 0})
                          </span>
      ),
      children: (
         <div className="bg-white p-4 rounded-lg shadow">
            {course.trainees && course.trainees.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={course.trainees}
                    renderItem={(trainee) => (
                        <List.Item key={trainee.traineeId || trainee.id /* Fallback if traineeId is not primary key */}>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={<a href="#">{trainee.traineeName || trainee.traineeId}</a>} // Assuming trainee might have a name property
                                description={`Status: ${trainee.status || 'N/A'}`} // Example property
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="No trainees assigned to this course." />
            )}
                  </div>
      ),
    },
  ];


  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-blue-100">
      <Layout.Content className="!p-6 !sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation and Header */}
          <Row justify="space-between" align="middle" className="mb-6">
            <Col>
              <Button
                type="link"
                onClick={() => navigate("/all-courses")} // Updated navigation path
                icon={<ArrowLeftOutlined />}
                className="!flex !items-center !text-cyan-700 hover:!text-cyan-900 !text-lg !font-medium !p-0"
              >
                Back to Courses
              </Button>
              <Title level={2} className="!mt-2 !mb-0 !text-cyan-900">
                {course.courseName}
              </Title>
              <Tag color={getStatusColor(course.status)} className="!mt-1 !text-sm">{course.status}</Tag>
            </Col>
            {!isReviewer && (
                <Col>
                <Space wrap>
                    {course.status === "Pending" && (
                        <>
                            <Button icon={<EditOutlined />} onClick={handleEdit} className="!border-blue-500 !text-blue-600 hover:!bg-blue-50">
                                Edit
                            </Button>
                            <Popconfirm
                                title="Are you sure you want to delete this course?"
                                onConfirm={handleDelete}
                                okText="Yes, Delete"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                            >
                                <Button icon={<DeleteOutlined />} danger>
                                Delete
                                </Button>
                            </Popconfirm>
                            <Button icon={<PlusOutlined />} onClick={handleOpenAssignModal} type="dashed" className="!border-teal-500 !text-teal-600 hover:!bg-teal-50">
                                Assign Subject Specialty
                            </Button>
                        </>
                    )}
                    <Button icon={<SendOutlined />} onClick={handleOpenRequestModal} type="primary" className="!bg-green-600 hover:!bg-green-700">
                        Send Request
                    </Button>
                </Space>
                </Col>
            )}
          </Row>

          {/* Tabs for Course Details */}
          <Tabs defaultActiveKey="overview" type="card" items={tabItems} className="course-detail-tabs bg-white p-1 rounded-lg shadow-lg"/>

        </div>
      </Layout.Content>

      {/* Send Request Modal */}
      <Modal
        title={<span className="!text-cyan-700 !font-semibold">Send Request for: {course.courseName}</span>}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        confirmLoading={submittingRequest}
        onOk={handleRequestSubmit}
        okText="Submit Request"
        className="!rounded-lg"
        destroyOnClose
      >
        <Form form={requestForm} layout="vertical" initialValues={{ requestType: RequestTypeEnum.UpdateCourse }}>
          <Form.Item name="requestType" label="Request Type" rules={[{ required: true }]}>
            <Select placeholder="Select request type">
              {Object.entries(RequestTypeLabels).map(([value, label]) => (
                <Select.Option key={value} value={Number(value)}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Request description (max 100 chars)" maxLength={100} />
          </Form.Item>
          <Form.Item name="notes" label="Notes" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Additional notes (max 100 chars)" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Subject Specialty Modal */}
      <Modal
        title={<span className="!text-teal-700 !font-semibold">Assign Subject Specialty to: {course.courseName}</span>}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        confirmLoading={submittingAssign}
        onOk={handleAssignSubjectSpecialtySubmit}
        okText="Assign Specialty"
        className="!rounded-lg"
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item 
            name="subjectSpecialtyId" 
            label="Available Subject Specialties" 
            rules={[{ required: true, message: "Please select a subject specialty" }]}
          >
            <Select
              placeholder="Select a subject specialty"
              loading={loadingSpecialtiesForDropdown}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {allSubjectSpecialtiesForDropdown.map((ss) => (
                <Select.Option 
                    key={ss.subjectSpecialtyId} 
                    value={ss.subjectSpecialtyId} 
                    label={`${ss.subject?.subjectName || ss.subjectId} - ${ss.specialty?.specialtyName || ss.specialtyId}`}
                    // disabled={subjectSpecialtyAlreadyAssigned(ss.subjectSpecialtyId)} // Redundant due to pre-filtering
                >
                  {`${ss.subject?.subjectName || ss.subjectId} - ${ss.specialty?.specialtyName || ss.specialtyId}`}
                  {/* {subjectSpecialtyAlreadyAssigned(ss.subjectSpecialtyId) && <Tag color="orange" className="ml-2">Assigned</Tag>} */}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {allSubjectSpecialtiesForDropdown.length === 0 && !loadingSpecialtiesForDropdown && (
            <Text type="warning">No new subject specialties available to assign, or none found in the system.</Text>
          )}
        </Form>
      </Modal>

    </Layout>
  );
};

export default CourseDetailPage;
