import { useState, useEffect } from "react";
import { Layout, Input, Button, message, Form, Select, Spin, Card, Row, Col, Breadcrumb, Typography } from "antd";
import { createSubject } from "../../services/subjectService";
import { courseService } from "../../services/courseService";
import { ArrowLeftOutlined, BookOutlined, FormOutlined, TrophyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { applySubjectValidation } from "../../../utils/validationSchemas";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const CreateSubjectPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getAllCourses();
      if (response?.data) {
        setCourses(response.data);
      } else {
        setCourses([]);
        message.warning("No courses found. Please create a course first.");
      }
    } catch (error) {
      message.error("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCreateSubject = async (values) => {
    try {
      setLoading(true);
      await applySubjectValidation(values);
      
      await createSubject({
        ...values,
        credits: Number(values.credits),
        passingScore: Number(values.passingScore),
      });
      
      message.success("Subject created successfully!");
      navigate("/subject");
    } catch (error) {
      if (error.name === 'ValidationError') {
        message.error(error.message);
      } else {
        message.error("Failed to create subject");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Breadcrumb className="mb-4">
                <Breadcrumb.Item>
                  <a onClick={() => navigate('/subject')} className="text-blue-600">
                    <BookOutlined className="mr-1" />
                    Subjects
                  </a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Create New Subject</Breadcrumb.Item>
              </Breadcrumb>
              <Title level={2} className="mb-2">Create New Subject</Title>
            </div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/subject")}
              className="text-blue-600"
            >
              Back to Subjects
            </Button>
          </div>

          {/* Form Section */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateSubject}
            className="space-y-6"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="subjectId"
                  label={<span className="text-gray-700 font-medium">Subject ID</span>}
                  rules={[{ required: true, message: "Subject ID is required" }]}
                >
                  <Input
                    prefix={<BookOutlined className="text-gray-400" />}
                    placeholder="Enter subject ID"
                    className="rounded-lg"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="courseId"
                  label={<span className="text-gray-700 font-medium">Course</span>}
                  rules={[{ required: true, message: "Course is required" }]}
                >
                  <Select
                    placeholder="Select a course"
                    loading={loadingCourses}
                    className="rounded-lg"
                    size="large"
                    notFoundContent={
                      loadingCourses ? (
                        <div className="text-center py-4">
                          <Spin size="small" />
                          <div className="mt-2">Loading courses...</div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div>No courses found</div>
                          <Button type="link" onClick={() => navigate('/course/create')}>
                            Create a new course
                          </Button>
                        </div>
                      )
                    }
                  >
                    {courses.map(course => (
                      <Option key={course.courseId} value={course.courseId}>
                        {course.courseName} ({course.courseId})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="subjectName"
                  label={<span className="text-gray-700 font-medium">Subject Name</span>}
                  rules={[{ required: true, message: "Subject name is required" }]}
                >
                  <Input
                    placeholder="Enter subject name"
                    className="rounded-lg"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label={<span className="text-gray-700 font-medium">Description</span>}
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Enter subject description"
                    className="rounded-lg"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={16} className="mt-8">
              <Col xs={24} sm={12}>
                <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <Form.Item
                    name="credits"
                    label={<span className="text-gray-700 font-medium">Credits (1-10)</span>}
                    rules={[
                      { required: true, message: "Credits are required" },
                      () => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();
                          const num = Number(value);
                          if (num < 1 || num > 10 || !Number.isInteger(num)) {
                            return Promise.reject('Credits must be between 1 and 10');
                          }
                          return Promise.resolve();
                        }
                      })
                    ]}
                    className="mb-0"
                  >
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="Enter credits"
                      prefix={<BookOutlined className="text-gray-400" />}
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <Form.Item
                    name="passingScore"
                    label={<span className="text-gray-700 font-medium">Passing Score (0-10)</span>}
                    rules={[
                      { required: true, message: "Passing score is required" },
                      () => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();
                          const num = Number(value);
                          if (num < 0 || num > 10) {
                            return Promise.reject('Passing score must be between 0 and 10');
                          }
                          return Promise.resolve();
                        }
                      })
                    ]}
                    className="mb-0"
                  >
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      placeholder="Enter passing score"
                      prefix={<TrophyOutlined className="text-yellow-500" />}
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            {/* Submit Button */}
            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loadingCourses}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                {loading ? "Creating..." : "Create Subject"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateSubjectPage;
