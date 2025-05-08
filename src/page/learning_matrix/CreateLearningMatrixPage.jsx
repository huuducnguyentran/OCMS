import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  message,
  Breadcrumb,
  Spin,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BookOutlined,
  TeamOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { getAllSubject } from "../../services/subjectService";
import { specialtyService } from "../../services/specialtyServices";
import { learningMatrixService } from "../../services/learningMatrixService";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const CreateLearningMatrixPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  // Load data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get course list
        const courseResponse = await courseService.getAllCourses();
        if (courseResponse && courseResponse.data) {
          setCourses(courseResponse.data);
        }

        // Get subject list - Cập nhật theo response mới
        const subjectResponse = await getAllSubject();
        if (subjectResponse && subjectResponse.allSubjects) {
          // Map dữ liệu theo cấu trúc mới
          const formattedSubjects = subjectResponse.allSubjects.map(subject => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            description: subject.description,
            credits: subject.credits,
            passingScore: subject.passingScore
          }));
          setSubjects(formattedSubjects);
        }

        // Get specialty list
        const specialtyResponse = await specialtyService.getAllSpecialties();
        if (specialtyResponse && specialtyResponse.data) {
          setSpecialties(specialtyResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Unable to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Thêm mối quan hệ mới
      await learningMatrixService.createCourseSubjectSpecialty(values);
      message.success("Learning matrix added successfully!");
      
      // Wait 1 second before redirecting
      setTimeout(() => {
        navigate("/learning-matrix");
      }, 1000);
    } catch (error) {
      console.error("Error adding learning matrix:", error);
      console.log("Error response:", error.response?.data);
      
      // Display error message from API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("Error data:", errorData);
        
        if (errorData.error && errorData.error.includes("already exist")) {
          message.error("This subject already exists for this specialty. Please choose a different combination.");
        } else if (errorData.error) {
          message.error(errorData.error);
        } else if (errorData.message) {
          message.error(errorData.message);
        } else {
          message.error("Unable to add learning matrix. Please check the information.");
        }
      } else {
        message.error("Unable to add learning matrix. Server error.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className="site-layout" style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "16px 16px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Training Management</Breadcrumb.Item>
          <Breadcrumb.Item 
            onClick={() => navigate("/learning-matrix")}
            className="cursor-pointer"
          >
            Learning Matrix
          </Breadcrumb.Item>
          <Breadcrumb.Item>Add New</Breadcrumb.Item>
        </Breadcrumb>

        <Card
          title={
            <div className="flex items-center">
              <BarsOutlined style={{ fontSize: "24px", marginRight: "16px" }} />
              <Title level={3} style={{ margin: 0 }}>
                Add New Learning Matrix
              </Title>
            </div>
          }
          extra={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/learning-matrix")}
              style={{ borderRadius: "6px" }}
            >
              Back
            </Button>
          }
          bordered={false}
          style={{ borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
        >
          <Spin spinning={loading || submitting}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ maxWidth: 800, margin: "0 auto" }}
            >
              <Form.Item
                name="courseId"
                label={<Text strong>Course</Text>}
                rules={[{ required: true, message: "Please select a course" }]}
              >
                <Select
                  placeholder="Select course"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {courses.map((course) => (
                    <Option key={course.courseId} value={course.courseId}>
                      {course.courseName} ({course.courseId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="subjectId"
                label={<Text strong>Subject</Text>}
                rules={[{ required: true, message: "Please select a subject" }]}
              >
                <Select
                  placeholder="Select subject"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {subjects.map((subject) => (
                    <Option 
                      key={subject.subjectId} 
                      value={subject.subjectId}
                      title={subject.description}
                    >
                      <div>
                        <div>{subject.subjectName}</div>
                        <div className="text-xs text-gray-500">
                          Credits: {subject.credits} | Passing Score: {subject.passingScore}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="specialtyId"
                label={<Text strong>Specialty</Text>}
                rules={[{ required: true, message: "Please select a specialty" }]}
              >
                <Select
                  placeholder="Select specialty"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {specialties.map((specialty) => (
                    <Option key={specialty.specialtyId} value={specialty.specialtyId}>
                      {specialty.specialtyName} ({specialty.specialtyId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label={<Text strong>Notes</Text>}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter notes (if any)"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="default" 
                    onClick={() => form.resetFields()}
                    style={{ borderRadius: "6px", height: "40px" }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SaveOutlined />}
                    style={{ borderRadius: "6px", height: "40px" }}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
};

export default CreateLearningMatrixPage; 